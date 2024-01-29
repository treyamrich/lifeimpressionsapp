import { toAWSDateTime } from "@/utils/datetimeConversions";
import dayjs from "dayjs";
import { EntityType } from "../app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { CognitoUser } from "@aws-amplify/auth";
import {
  ExecuteTransactionCommand,
  ParameterizedStatement,
} from "@aws-sdk/client-dynamodb";
import { CustomerOrder, PurchaseOrder, TShirtOrder } from "@/API";
import { createDynamoDBObj } from "./dynamodb";
import {
  PurchaseOrderOrCustomerOrder,
  getInsertOrderPartiQL,
  getInsertTShirtOrderTablePartiQL,
  getUpdateTShirtTablePartiQL,
} from "./partiql-helpers";
import { v4 } from "uuid";
import { validateEmail, validatePhoneNumber } from "@/utils/field-validation";
import { validateTShirtOrderInput } from "./validation";
import { DBOperation } from "@/contexts/DBErrorContext";

export const getTShirtOrdersStatements = (
  orderedItems: TShirtOrder[],
  entityType: EntityType,
  createdAt: string,
  parentOrderUuid: string,
  allowNegativeInventory: boolean
): ParameterizedStatement[] => {
  const res: ParameterizedStatement[] = [];
  orderedItems.forEach((tshirtOrder: TShirtOrder) => {
    // Only decrement from TShirt table when it's a customer order
    if (entityType === EntityType.CustomerOrder) {
      const tshirtQtyChange = -tshirtOrder.quantity;
      res.push(
        getUpdateTShirtTablePartiQL(
          tshirtQtyChange,
          allowNegativeInventory,
          createdAt,
          tshirtOrder.tshirt.id
        )
      );
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
  });
  return res;
};

export const assembleCreateOrderTransactionStatements = (
  input: PurchaseOrderOrCustomerOrder,
  entityType: EntityType,
  allowNegativeInventory: boolean
): ParameterizedStatement[] => {
  // Insertion fields for new Order
  const orderId = v4();
  const createdAtTimestamp = toAWSDateTime(dayjs());

  const orderedItems = input.orderedItems as any as TShirtOrder[]; // Locally orderedItems is just an array not a model connection
  const transactionStatements: ParameterizedStatement[] = [
    getInsertOrderPartiQL(input, entityType, createdAtTimestamp, orderId),
    ...getTShirtOrdersStatements(
      orderedItems,
      entityType,
      createdAtTimestamp,
      orderId,
      allowNegativeInventory
    ),
  ];
  return transactionStatements;
};

const validateCreateOrderInput = (input: PurchaseOrderOrCustomerOrder, entityType: EntityType) => {
  const orderedItems = input.orderedItems as any as TShirtOrder[]; // Locally orderedItems is just an array
  orderedItems.forEach(item => {
    validateTShirtOrderInput(item, DBOperation.CREATE);
    if (item.amountReceived !== 0) throw Error("Received amount should be 0 on order creation");
  });
  const isValidStr = (str: string | undefined | null) => str !== undefined && str !== null;
  if (entityType === EntityType.CustomerOrder) {
    let order = input as CustomerOrder;
    if (isValidStr(order.customerPhoneNumber) && validatePhoneNumber(order.customerPhoneNumber!) === undefined)
      throw Error("Invalid phone number input");
    if (isValidStr(order.customerEmail) && validateEmail(order.customerEmail!) === undefined)
      throw Error("Invalid email input.")
  }
}

// If allow negative inventory is set to false, then an array of tshirt order style numbers will be returned that would've caused negative inventory
export const createOrderTransactionAPI = async (
  input: PurchaseOrderOrCustomerOrder,
  entityType: EntityType,
  user: CognitoUser,
  allowNegativeInventory: boolean
): Promise<Array<string>> => {

  const orderedItems = input.orderedItems as any as TShirtOrder[]; // Locally orderedItems is just an array
  validateCreateOrderInput(input, entityType);

  let command = null;
  try {
    command = new ExecuteTransactionCommand({
      TransactStatements: assembleCreateOrderTransactionStatements(
        input,
        entityType,
        allowNegativeInventory
      ),
    });
  } catch (e) {
    console.log(e);
    throw new Error(`Failed to create ${entityType} order`);
  }


  const dynamodbClient = await createDynamoDBObj(user);
  return dynamodbClient.send(command).catch((e) => {
    if (!allowNegativeInventory && e.CancellationReasons) {
      const negativeInventoryShirts = e.CancellationReasons.slice(1)
        .map((cancellationObj: any, index: number) => {
          if (cancellationObj.Code === "ConditionalCheckFailed") {
            const tshirt = orderedItems[index].tshirt;
            return `Style#: ${tshirt.styleNumber} | Size: ${tshirt.size} | Color: ${tshirt.color}`;
          }
          return null;
        })
        .filter((x: string) => x != null);
      return negativeInventoryShirts;
    }
    console.log(e);
    throw new Error(`Failed to create ${entityType} order`);
  });
};
