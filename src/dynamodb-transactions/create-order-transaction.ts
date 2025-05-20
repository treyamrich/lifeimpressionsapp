import {
  fromUTC,
  getTodayInSetTz,
  toAWSDateTime,
} from "@/utils/datetimeConversions";
import { EntityType } from "../app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { CognitoUser } from "@aws-amplify/auth";
import {
  ExecuteTransactionCommand,
  ParameterizedStatement,
} from "@aws-sdk/client-dynamodb";
import {
  CustomerOrder,
  CustomerOrderStatus,
  POStatus,
  PurchaseOrder,
  TShirt,
  TShirtOrder,
} from "@/API";
import { createDynamoDBObj } from "./dynamodb";
import {
  PurchaseOrderOrCustomerOrder,
  getInsertOrderPartiQL,
  getInsertTShirtOrderTablePartiQL,
  getConditionalUpdateTShirtTablePartiQL,
} from "./partiql-helpers";
import { v4 } from "uuid";
import {
  validateEmail,
  validateISO8601,
  validatePhoneNumber,
} from "@/utils/field-validation";
import { validateTShirtOrderInput } from "./validation";
import { DBOperation } from "@/contexts/DBErrorContext";
import { CreatePurchaseOrderMoneyAwareForm } from "@/app/(DashboardLayout)/purchase-orders/table-constants";
import { CreateCustomerOrderMoneyAwareForm } from "@/app/(DashboardLayout)/customer-orders/table-constants";

export type PreparedStatements = {
  statements: ParameterizedStatement[];
  statementIdxToTShirt: { [x: number]: TShirt };
};

export const getTShirtOrdersStatements = (
  orderedItems: TShirtOrder[],
  entityType: EntityType,
  createdAt: string,
  parentOrderUuid: string,
  allowNegativeInventory: boolean,
  startingStatementIndex: number
): PreparedStatements => {
  let statementIdx = startingStatementIndex;
  const idxToTShirt: { [x: number]: TShirt } = {};
  const res: ParameterizedStatement[] = [];
  orderedItems.forEach((tshirtOrder: TShirtOrder) => {
    // Only decrement from TShirt table when it's a customer order
    if (entityType === EntityType.CustomerOrder) {
      const tshirtQtyChange = -tshirtOrder.quantity;
      res.push(
        getConditionalUpdateTShirtTablePartiQL(
          tshirtQtyChange,
          allowNegativeInventory,
          createdAt,
          tshirtOrder.tshirt.id
        )
      );
      idxToTShirt[statementIdx++] = tshirtOrder.tshirt;
    }
    // Add to TShirtOrder table
    const tshirtOrderId = v4();
    res.push(
      getInsertTShirtOrderTablePartiQL(
        entityType,
        parentOrderUuid,
        createdAt,
        tshirtOrder,
        tshirtOrderId
      )
    );
    statementIdx++;
  });
  return { statements: res, statementIdxToTShirt: idxToTShirt };
};

export const assembleCreateOrderTransactionStatements = (
  input: PurchaseOrderOrCustomerOrder,
  entityType: EntityType,
  allowNegativeInventory: boolean
): PreparedStatements => {
  // Insertion fields for new Order
  const orderId = v4();
  const createdAtTimestamp = input.createdAt; //toAWSDateTime(dayjs());

  const orderedItems = input.orderedItems as any as TShirtOrder[]; // Locally orderedItems is just an array not a model connection
  const tshirtOrderStatements = getTShirtOrdersStatements(
    orderedItems,
    entityType,
    createdAtTimestamp,
    orderId,
    allowNegativeInventory,
    1 // b/c insert order is idx 0
  );
  const transactionStatements: ParameterizedStatement[] = [
    getInsertOrderPartiQL(input, entityType, createdAtTimestamp, orderId),
    ...tshirtOrderStatements.statements,
  ];
  return {
    statements: transactionStatements,
    statementIdxToTShirt: tshirtOrderStatements.statementIdxToTShirt,
  };
};

const validateCreateOrderInput = (
  input: PurchaseOrderOrCustomerOrder,
  entityType: EntityType
) => {
  const orderedItems = input.orderedItems as any as TShirtOrder[]; // Locally orderedItems is just an array
  orderedItems.forEach((item) => {
    validateTShirtOrderInput(item, DBOperation.CREATE);
    if (item.amountReceived !== 0)
      throw Error("Received amount should be 0 on order creation");
  });

  if (input.taxRate < 0) throw Error("Invalid tax rate");

  const now = getTodayInSetTz();
  const inputTimestamp = fromUTC(input.createdAt);

  if (!validateISO8601(input.createdAt))
    throw Error("Date order placed has an invalid date format");
  if (inputTimestamp > now)
    throw Error("Date order was placed cannot be in the future.");
  // TEMPORARY UNLOCK. Need to add this back.
  // if (inputTimestamp < now.startOf("month"))
  //   throw Error("Orders cannot be placed in prior months");

  const isValidStr = (str: string | undefined | null) =>
    str !== undefined && str !== null;
  if (entityType === EntityType.CustomerOrder) {
    let order = input as CustomerOrder;
    const coStatuses = [
      CustomerOrderStatus.NEW,
      CustomerOrderStatus.IN_PROGRESS,
      CustomerOrderStatus.BLOCKED,
      CustomerOrderStatus.COMPLETED,
    ];

    if (
      isValidStr(order.customerPhoneNumber) &&
      validatePhoneNumber(order.customerPhoneNumber!) === undefined
    )
      throw Error("Invalid phone number input");
    if (
      isValidStr(order.customerEmail) &&
      validateEmail(order.customerEmail!) === undefined
    )
      throw Error("Invalid email input.");
    if (isValidStr(order.dateNeededBy) && !validateISO8601(order.dateNeededBy))
      throw Error("Invalid date for date needed by field");
    if (!coStatuses.find((status) => order.orderStatus === status))
      throw Error("Invalid customer order status");
  } else {
    let order = input as PurchaseOrder;
    const poStatuses = [POStatus.SentToVendor, POStatus.Closed, POStatus.Open];

    if (isValidStr(order.dateExpected) && !validateISO8601(order.dateExpected))
      throw Error("Invalid date for date expected by field");
    if (order.fees < 0) throw Error("Invalid value for order fees");
    if (order.shipping < 0) throw Error("Invalid shipping value");
    if (!poStatuses.find((status) => status === order.status))
      throw Error("Invalid purchase order status");
  }
};

const transformInput = (input: POOrCOCreateInput, entityType: EntityType): PurchaseOrderOrCustomerOrder => {
  if (entityType === EntityType.CustomerOrder) {
    let inputCO = input as CreateCustomerOrderMoneyAwareForm;
    return {
      ...inputCO,
      createdAt: toAWSDateTime(inputCO.createdAt),
      dateNeededBy: toAWSDateTime(inputCO.dateNeededBy),
      taxRate: parseFloat(inputCO.taxRate),
      orderedItems: inputCO.orderedItems as any,
      updatedAt: '',
      id: '',
      changeHistory: [] as any,
    };
  }
  let inputPO = input as CreatePurchaseOrderMoneyAwareForm;
  return {
    ...inputPO,
    createdAt: toAWSDateTime(inputPO.createdAt),
    dateExpected: toAWSDateTime(inputPO.dateExpected),
    taxRate: parseFloat(inputPO.taxRate),
    shipping: parseFloat(inputPO.shipping),
    fees: parseFloat(inputPO.fees),
    orderedItems: inputPO.orderedItems as any,
    id: '',
    updatedAt: '',
    changeHistory: [] as any,
  }
}


export type POOrCOCreateInput = CreatePurchaseOrderMoneyAwareForm | CreateCustomerOrderMoneyAwareForm;

// If allow negative inventory is set to false, then an array of tshirt order style numbers will be returned that would've caused negative inventory
export const createOrderTransactionAPI = async (
  createInput: POOrCOCreateInput,
  entityType: EntityType,
  user: CognitoUser,
  allowNegativeInventory: boolean,
  refreshTokenFn?: () => Promise<CognitoUser | undefined>
): Promise<Array<TShirt>> => {

  const input = transformInput(createInput, entityType);
  validateCreateOrderInput(input, entityType);

  const commonError = new Error(`Failed to create ${entityType} order`);
  let command = null;
  let transactionStatements: PreparedStatements;
  try {
    transactionStatements = assembleCreateOrderTransactionStatements(
      input,
      entityType,
      allowNegativeInventory
    );
    command = new ExecuteTransactionCommand({
      TransactStatements: transactionStatements.statements,
    });
  } catch (e) {
    console.log(e);
    throw commonError;
  }

  const dynamodbClient = await createDynamoDBObj(user);
  return dynamodbClient.send(command)
  .then((response) => {
    return [];
  })
  .catch(async (e) => {
    // Retry and try refresh token
    if (e.message.includes("Token expired") && refreshTokenFn) {
      let updatedSession = await refreshTokenFn();
      if (updatedSession) {
        // Don't retry session renewal again
        return createOrderTransactionAPI(
          createInput,
          entityType,
          updatedSession,
          allowNegativeInventory
        );
      }
    }

    if (!allowNegativeInventory && e.CancellationReasons) {
      const negativeInventoryShirts: TShirt[] = e.CancellationReasons.map(
        (cancellationObj: any, index: number) => {
          if (cancellationObj.Code === "ConditionalCheckFailed") {
            return transactionStatements.statementIdxToTShirt[index];
          }
          if (cancellationObj.Code !== "None")
            throw commonError;
          return null;
        }
      ).filter((x: string) => x != null);
      return negativeInventoryShirts;
    }

    throw commonError;
  });
};
