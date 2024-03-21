import {
  ExecuteStatementCommand,
  ExecuteTransactionCommand,
  ParameterizedStatement,
} from "@aws-sdk/client-dynamodb";
import { createDynamoDBObj } from "../dynamodb";
import { EntityType } from "../../app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
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
  getConditionalUpdateTShirtTablePartiQL,
  PurchaseOrderOrCustomerOrder,
  getConditionalUpdateCacheExpiration
} from "../partiql-helpers";
import { DBOperation } from "@/contexts/DBErrorContext";
import { validateUpdateOrderInput } from "../validation";
import { isAfterStartOfMonth, isCO, isPO, orderIsAfterStartOfMonth } from "../util";
import { getDecreasePOItemStatement, getIncreasePOItemStatement } from "./get-update-po-statement";

export type GetUpdateTShirtOrderStatement = {
  updateTShirtOrderStatement: ParameterizedStatement;
  earliestTShirtOrderDate: string;
};

export type AssembleUpdateStatementsResult = {
  transactionStatements: ParameterizedStatement[];
  response: UpdateOrderTransactionResponse;
  earliestTShirtOrderDate: string;
};

export const assembleUpdateOrderTransactionStatements = (
  parentOrder: PurchaseOrderOrCustomerOrder,
  input: UpdateOrderTransactionInput,
  tshirtOrderTableOperation: DBOperation,
  entityType: EntityType,
  allowNegativeInventory: boolean
): AssembleUpdateStatementsResult => {
  const {
    updatedTShirtOrder,
    createOrderChangeInput,
    inventoryQtyDelta,
  } = input;

  let maybeNegatedInventoryQtyDelta = isCO(parentOrder)
      ? -inventoryQtyDelta
      : inventoryQtyDelta;
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

  let responseTShirtOrder = { ...updatedTShirtOrder };
  const getUpdateTShirtOrderStatements = (): GetUpdateTShirtOrderStatement => {
    // CASE: Adding new order item to an existing order
    if (tshirtOrderTableOperation === DBOperation.CREATE) {
      responseTShirtOrder.id = newTShirtOrderId;
      return {
        updateTShirtOrderStatement:
          getInsertTShirtOrderTablePartiQL(
          entityType,
          parentOrder.id,
          createdAtTimestamp,
          updatedTShirtOrder,
          newTShirtOrderId
        ),
        earliestTShirtOrderDate: parentOrder.createdAt
      };
    }

    // CASE: Updating a CO rewrites the transaction history; item returns not supported.
    if (isCO(parentOrder)) 
      return {
        updateTShirtOrderStatement: getUpdateTShirtOrderTablePartiQL(updatedTShirtOrder),
        earliestTShirtOrderDate: updatedTShirtOrder.createdAt
      };

    // CASES: Decreasing/Increasing PO item qty
    const amtRecvDelta = input.inventoryQtyDelta;
    const receivedAtDatetime = input.poItemReceivedDate ?? createdAtTimestamp;
    const { newPOReceivals, earliestTShirtOrderDate } = amtRecvDelta < 0 ? 
      getDecreasePOItemStatement(responseTShirtOrder, amtRecvDelta) :
      getIncreasePOItemStatement(responseTShirtOrder, amtRecvDelta, receivedAtDatetime);
    
    responseTShirtOrder.receivals = newPOReceivals;
    
    return {
      updateTShirtOrderStatement: getUpdateTShirtOrderTablePartiQL(responseTShirtOrder),
      earliestTShirtOrderDate
    }
  };

  const { updateTShirtOrderStatement, earliestTShirtOrderDate } = getUpdateTShirtOrderStatements();

  const transactionStatements: ParameterizedStatement[] = [
    getUpdateOrderPartiQL(entityType, parentOrder.id, createdAtTimestamp),
    getConditionalUpdateTShirtTablePartiQL(
      maybeNegatedInventoryQtyDelta,
      allowNegativeInventory,
      createdAtTimestamp,
      updatedTShirtOrder.tshirt.id
    ),
    updateTShirtOrderStatement,
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
    newTShirtOrder: responseTShirtOrder,
  };

  return { transactionStatements, response, earliestTShirtOrderDate };
};


export type UpdateOrderTransactionInput = {
  updatedTShirtOrder: TShirtOrder;
  parentOrder: PurchaseOrderOrCustomerOrder;
  inventoryQtyDelta: number;
  createOrderChangeInput: CreateOrderChangeInput;
  poItemReceivedDate?: string;
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
export const updateTShirtOrderTransactionAPI = async (
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
  let earliestTShirtOrderDate: string;
  let parentOrder: PurchaseOrderOrCustomerOrder = input.parentOrder;

  try {
    const res = assembleUpdateOrderTransactionStatements(
      parentOrder,
      input,
      tshirtOrderTableOperation,
      entityType,
      allowNegativeInventory
    );
    command = new ExecuteTransactionCommand({
      TransactStatements: res.transactionStatements,
    });
    response = res.response;
    earliestTShirtOrderDate = res.earliestTShirtOrderDate;
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
          return updateTShirtOrderTransactionAPI(
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
    })
    .then(response => {
      if(!response) return response;
      
      let orderFromLastMonth = !orderIsAfterStartOfMonth(input.parentOrder);
      let changeToCoInPrevMonth = isCO(input.parentOrder) && orderFromLastMonth;
      let addingNewOrderItem = tshirtOrderTableOperation === DBOperation.CREATE;
      
      const shouldInvalidateCache = changeToCoInPrevMonth ||
        isPO(input.parentOrder) && 
          !addingNewOrderItem && (
            !isAfterStartOfMonth(input.poItemReceivedDate!) || 
            orderFromLastMonth && input.inventoryQtyDelta < 0 
          )

      if (!shouldInvalidateCache) return response;
      
      // Update the cache expiration
      dynamodbClient.send(new ExecuteStatementCommand(
        getConditionalUpdateCacheExpiration(earliestTShirtOrderDate)
      ))
      .catch(e => {
        if (e.name === 'ConditionalCheckFailedException')
          return;
        console.log(e)
      })

      // Returns on errors since we aren't awaiting above
      return response;
    });
};
