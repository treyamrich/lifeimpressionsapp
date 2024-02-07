import {
  ExecuteTransactionCommand,
  ParameterizedStatement,
} from "@aws-sdk/client-dynamodb";
import { createDynamoDBObj } from "./dynamodb";
import { EntityType } from "../app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { CognitoUser } from "@aws-amplify/auth";
import { toAWSDateTime } from "@/utils/datetimeConversions";
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
  getUpdateTShirtTablePartiQL,
} from "./partiql-helpers";
import { DBOperation } from "@/contexts/DBErrorContext";
import { validateTShirtOrderInput } from "./validation";

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
    parentOrderId,
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

  const getUpdateTShirtOrderStatement = () => {
    if (tshirtOrderTableOperation === DBOperation.CREATE) {
      return getInsertTShirtOrderTablePartiQL(
        entityType,
        parentOrderId,
        createdAtTimestamp,
        updatedTShirtOrder,
        newTShirtOrderId
      );
    }
    return getUpdateTShirtOrderTablePartiQL(
      updatedTShirtOrder,
      createdAtTimestamp
    );
  };

  const transactionStatements: ParameterizedStatement[] = [
    getUpdateOrderPartiQL(entityType, parentOrderId, createdAtTimestamp),
    getUpdateTShirtTablePartiQL(
      maybeNegatedInventoryQtyDelta,
      allowNegativeInventory,
      createdAtTimestamp,
      updatedTShirtOrder.tshirt.id
    ),
    getUpdateTShirtOrderStatement(),
    getInsertOrderChangePartiQL(
      orderChangeUuid,
      typename,
      parentOrderIdFieldName,
      parentOrderId,
      updatedTShirtOrder.tshirt.id,
      createdAtTimestamp,
      createOrderChangeInput.reason,
      fieldChanges
    ),
  ];

  // Assemble response
  const orderChange: OrderChange = {
    __typename: typename,
    id: orderChangeUuid,
    createdAt: createdAtTimestamp,
    updatedAt: createdAtTimestamp,
    [parentOrderIdFieldName]: parentOrderId,
    orderChangeTshirtId: updatedTShirtOrder.tshirt.id,
    tshirt: updatedTShirtOrder.tshirt,
    reason: createOrderChangeInput.reason,
    fieldChanges: fieldChanges,
  };

  const response: UpdateOrderTransactionResponse = {
    orderChange: orderChange,
    orderUpdatedAtTimestamp: createdAtTimestamp,
    newTShirtOrderId:
      tshirtOrderTableOperation === DBOperation.CREATE
        ? newTShirtOrderId
        : undefined,
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

const validateUpdateOrderInput = (
  input: UpdateOrderTransactionInput,
  tshirtOrderTableOperation: DBOperation
) => {
  if (
    tshirtOrderTableOperation !== DBOperation.CREATE &&
    tshirtOrderTableOperation !== DBOperation.UPDATE
  )
    throw Error("Invalid operation " + tshirtOrderTableOperation);
  const { updatedTShirtOrder, parentOrderId, createOrderChangeInput } = input;
  if (parentOrderId === undefined || parentOrderId === "")
    throw Error("Order id does not exist");
  validateOrderChangeInput(createOrderChangeInput);
  validateTShirtOrderInput(updatedTShirtOrder, tshirtOrderTableOperation);
};

export type UpdateOrderTransactionInput = {
  updatedTShirtOrder: TShirtOrder;
  parentOrderId: string;
  inventoryQtyDelta: number;
  createOrderChangeInput: CreateOrderChangeInput;
};

export type UpdateOrderTransactionResponse = {
  orderChange: OrderChange;
  newTShirtOrderId?: string;
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
      console.log(e);
      throw new Error(`Failed to update ${entityType} order`);
    });
};
