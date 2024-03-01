import {
  ExecuteTransactionCommand,
  ParameterizedStatement,
} from "@aws-sdk/client-dynamodb";
import { createDynamoDBObj } from "./dynamodb";
import { EntityType } from "../app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { CognitoUser } from "@aws-amplify/auth";
import { fromUTC, getStartOfMonth, toAWSDateTime } from "@/utils/datetimeConversions";
import dayjs from "dayjs";
import { v4 } from "uuid";
import {
  CreateOrderChangeInput,
  FieldChange,
  FieldChangeInput,
  OrderChange,
  TShirtOrder,
} from "@/API";
import {
  getInsertOrderChangePartiQL,
  getInsertTShirtOrderTablePartiQL,
  getUpdateOrderPartiQL,
  getUpdateTShirtOrderTablePartiQL,
  getConditionalUpdateTShirtTablePartiQL,
  PurchaseOrderOrCustomerOrder,
} from "./partiql-helpers";
import { DBOperation } from "@/contexts/DBErrorContext";
import { validateTShirtOrderInput } from "./validation";
import { TShirtOrderFields } from "@/app/(DashboardLayout)/components/TShirtOrderTable/table-constants";

export type AssembleUpdateStatementsResult = {
  transactionStatements: ParameterizedStatement[];
  response: UpdateOrderTransactionResponse;
};
export const assembleUpdateOrderTransactionStatements = (
  input: UpdateOrderTransactionInput,
  tshirtOrderTableOperation: DBOperation,
  entityType: EntityType,
  allowNegativeInventory: boolean
): AssembleUpdateStatementsResult => {
  const {
    updatedTShirtOrder,
    parentOrder,
    createOrderChangeInput,
    inventoryQtyDelta,
  } = input;

  let maybeNegatedInventoryQtyDelta =
    entityType === EntityType.CustomerOrder
      ? -inventoryQtyDelta
      : inventoryQtyDelta;

  // Insertion fields for new OrderChange
  const createdAtTimestamp = toAWSDateTime(dayjs());
  const orderChangeUuid = v4();
  const newTShirtOrderId = v4();
  const typename = "OrderChange";
  const parentOrderIdFieldName = `${entityType}OrderChangeHistoryId`;
  const fieldChanges: FieldChange[] = createOrderChangeInput.fieldChanges.map(
    (fieldChange: FieldChangeInput) => ({
      ...fieldChange,
      __typename: "FieldChange",
    })
  );

  // If a new tshirt order is inserted, the id must be set
  let responseNewTShirtOrder = { ...updatedTShirtOrder };
  const getUpdateTShirtOrderStatement = () => {
    if (tshirtOrderTableOperation === DBOperation.CREATE) {
      responseNewTShirtOrder.id = newTShirtOrderId;
      return getInsertTShirtOrderTablePartiQL(
        entityType,
        parentOrder.id,
        createdAtTimestamp,
        updatedTShirtOrder,
        newTShirtOrderId
      );
    }

    if (orderIsAfterStartOfMonth(input.parentOrder))
      return getUpdateTShirtOrderTablePartiQL(
        updatedTShirtOrder,
        createdAtTimestamp
      );

    // Updating an item last month needs to create a separate item
    const getDeltaOrExisting = (fieldName: string, defaultObj: any) => {
      let fieldChange = fieldChanges.find((x) => x.fieldName === fieldName);
      if (!fieldChange) return defaultObj[fieldName];
      let i_0 = parseInt(fieldChange.oldValue);
      let i_f = parseInt(fieldChange.newValue);
      return i_f - i_0;
    };
    const justDeltasTShirtOrder: TShirtOrder = {
      ...responseNewTShirtOrder,
      id: newTShirtOrderId,
    };

    if (entityType === EntityType.PurchaseOrder) {
      justDeltasTShirtOrder.quantity = 0;
      justDeltasTShirtOrder.amountReceived = getDeltaOrExisting(
        TShirtOrderFields.AmtReceived,
        updatedTShirtOrder
      );
    } else {
      justDeltasTShirtOrder.quantity = getDeltaOrExisting(
        TShirtOrderFields.Qty,
        updatedTShirtOrder
      );
    }
    responseNewTShirtOrder = justDeltasTShirtOrder;
    return getInsertTShirtOrderTablePartiQL(
      entityType,
      parentOrder.id,
      createdAtTimestamp,
      justDeltasTShirtOrder,
      newTShirtOrderId
    );
  };

  const transactionStatements: ParameterizedStatement[] = [
    getUpdateOrderPartiQL(entityType, parentOrder.id, createdAtTimestamp),
    getConditionalUpdateTShirtTablePartiQL(
      maybeNegatedInventoryQtyDelta,
      allowNegativeInventory,
      createdAtTimestamp,
      updatedTShirtOrder.tshirt.id
    ),
    getUpdateTShirtOrderStatement(),
    getInsertOrderChangePartiQL(
      orderChangeUuid,
      updatedTShirtOrder.tshirt.id,
      createdAtTimestamp,
      createOrderChangeInput.reason,
      fieldChanges,
      {
        parentOrderIdFieldName,
        orderId: parentOrder.id,
      }
    ),
  ];

  // Assemble response
  const orderChange: OrderChange = {
    __typename: typename,
    id: orderChangeUuid,
    createdAt: createdAtTimestamp,
    updatedAt: createdAtTimestamp,
    [parentOrderIdFieldName]: parentOrder.id,
    orderChangeTshirtId: updatedTShirtOrder.tshirt.id,
    tshirt: updatedTShirtOrder.tshirt,
    reason: createOrderChangeInput.reason,
    fieldChanges: fieldChanges,
  };

  const response: UpdateOrderTransactionResponse = {
    orderChange: orderChange,
    orderUpdatedAtTimestamp: createdAtTimestamp,
    newTShirtOrder: responseNewTShirtOrder,
  };

  return { transactionStatements, response };
};

const validateOrderChangeInput = (
  createOrderChangeInput: CreateOrderChangeInput
) => {
  if (createOrderChangeInput.fieldChanges.length === 0)
    throw Error("No changes made to order");
  if (createOrderChangeInput.reason.length === 0)
    throw Error("No reason for editing order provided.");
  if (createOrderChangeInput.orderChangeTshirtId.length === 0)
    throw Error("No thirt id provided");
};

const orderIsAfterStartOfMonth = (
  order: PurchaseOrderOrCustomerOrder
): boolean => fromUTC(order.createdAt) >= getStartOfMonth(0)

const validateUpdateOrderInput = (
  input: UpdateOrderTransactionInput,
  tshirtOrderTableOperation: DBOperation
) => {
  if (
    tshirtOrderTableOperation !== DBOperation.CREATE &&
    tshirtOrderTableOperation !== DBOperation.UPDATE
  )
    throw Error("Invalid operation " + tshirtOrderTableOperation);
  const { updatedTShirtOrder, parentOrder, createOrderChangeInput } = input;
  if (parentOrder.id === undefined || parentOrder.id === "")
    throw Error("Order id does not exist");

  const isValid = (input: UpdateOrderTransactionInput) => {
    if (orderIsAfterStartOfMonth(parentOrder)) return true;
    const fieldChanges = input.createOrderChangeInput.fieldChanges;
    if (fieldChanges.length !== 1) return false;
    if (tshirtOrderTableOperation !== DBOperation.UPDATE) return false;

    const isPO = input.parentOrder.__typename === "PurchaseOrder";
    const fieldChange = fieldChanges[0];
    const onlyUpdatingAmtRecvField =
      fieldChange.fieldName === TShirtOrderFields.AmtReceived;
    const isOnlyAddingToExistingPOItem =
      isPO && onlyUpdatingAmtRecvField && input.inventoryQtyDelta > 0;

    if (isOnlyAddingToExistingPOItem) return true;

    // At this pt. we already know its a CustomerOrder
    if (fieldChange.fieldName !== TShirtOrderFields.Qty) return false;
    const delta =
      parseInt(fieldChange.newValue) - parseInt(fieldChange.oldValue);
    return delta < 0;
  };

  if (!isValid(input))
    throw Error(
      "Orders from prior months cannot be updated except when... 1) Receiving outstanding purchase order items. 2) Returning customer bought items to inventory"
    );

  validateOrderChangeInput(createOrderChangeInput);
  validateTShirtOrderInput(updatedTShirtOrder, tshirtOrderTableOperation);
};

export type UpdateOrderTransactionInput = {
  updatedTShirtOrder: TShirtOrder;
  parentOrder: PurchaseOrderOrCustomerOrder;
  inventoryQtyDelta: number;
  createOrderChangeInput: CreateOrderChangeInput;
};

export type UpdateOrderTransactionResponse = {
  orderChange: OrderChange;
  newTShirtOrder: TShirtOrder;
  orderUpdatedAtTimestamp: string;
} | null;

// Used when updating the TShirtOrder row in an order.
// Returns null if allowNegativeInventory is false and the inventory will become negative in the TShirt table.
// tshirtOrderTableOperation is the effect of the transaction. Only support for update and insert.
// If tshirtOrderTableOpeartion is CREATE a new tshirtOrder id will be returned
export const updateOrderTransactionAPI = async (
  input: UpdateOrderTransactionInput,
  entityType: EntityType,
  user: CognitoUser,
  tshirtOrderTableOperation: DBOperation,
  allowNegativeInventory: boolean,
  refreshTokenFn?: () => Promise<CognitoUser | undefined>
): Promise<UpdateOrderTransactionResponse> => {
  validateUpdateOrderInput(input, tshirtOrderTableOperation);

  let command = null;
  let response: UpdateOrderTransactionResponse = null;
  try {
    const res = assembleUpdateOrderTransactionStatements(
      input,
      tshirtOrderTableOperation,
      entityType,
      allowNegativeInventory
    );
    command = new ExecuteTransactionCommand({
      TransactStatements: res.transactionStatements,
    });
    response = res.response;
  } catch (e) {
    console.log(e);
    throw new Error(`Failed to update ${entityType} order`);
  }

  const dynamodbClient = await createDynamoDBObj(user);
  return dynamodbClient
    .send(command)
    .then((onFulfilled) => response)
    .catch(async (e) => {
      // Retry and try refresh token
      if (e.message.includes("Token expired") && refreshTokenFn) {
        let updatedSession = await refreshTokenFn();
        if (updatedSession) {
          // Don't retry session renewal again
          return updateOrderTransactionAPI(
            input,
            entityType,
            updatedSession,
            tshirtOrderTableOperation,
            allowNegativeInventory
          );
        }
      }

      if (!allowNegativeInventory) {
        return null;
      }
      console.log(e.message);
      throw new Error(`Failed to update ${entityType} order`);
    });
};
