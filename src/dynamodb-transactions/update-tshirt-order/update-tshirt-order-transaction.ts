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
import { TShirtOrderFields } from "@/app/(DashboardLayout)/components/TShirtOrderTable/table-constants";
import { isAddingNewPOItem, isCO, isReceivingPOItem, orderIsAfterStartOfMonth } from "../util";
import { getDecreasePOItemStatements } from "./decrease-po-statements";
import { getCustomerOrderAPI, getPurchaseOrderAPI } from "@/graphql-helpers/fetch-apis";

export type GetUpdateTShirtOrderStatements = {
  updateTShirtOrderStatements: ParameterizedStatement[];
  earliestTShirtOrder: TShirtOrder;
};

export type AssembleUpdateStatementsResult = {
  transactionStatements: ParameterizedStatement[];
  response: UpdateOrderTransactionResponse;
  earliestTShirtOrder: TShirtOrder;
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
  const getUpdateTShirtOrderStatements = (): GetUpdateTShirtOrderStatements => {
    // CASE: Adding new order item to an existing order
    if (tshirtOrderTableOperation === DBOperation.CREATE) {
      responseTShirtOrder.id = newTShirtOrderId;
      return {
        updateTShirtOrderStatements: [
          getInsertTShirtOrderTablePartiQL(
          entityType,
          parentOrder.id,
          createdAtTimestamp,
          updatedTShirtOrder,
          newTShirtOrderId
        )],
        earliestTShirtOrder: updatedTShirtOrder
      };
    }

    // CASE: Updating a CO rewrites the transaction history; item returns not supported.
    if (isCO(parentOrder)) 
      return {
        updateTShirtOrderStatements: [getUpdateTShirtOrderTablePartiQL(updatedTShirtOrder)],
        earliestTShirtOrder: updatedTShirtOrder
      };

    const getDeltaOrExisting = (fieldName: string, defaultObj: any) => {
      let fieldChange = fieldChanges.find((x) => x.fieldName === fieldName);
      if (!fieldChange) return defaultObj[fieldName];
      let i_0 = parseInt(fieldChange.oldValue);
      let i_f = parseInt(fieldChange.newValue);
      return i_f - i_0;
    };
    const amtRecvDelta = getDeltaOrExisting(
      TShirtOrderFields.AmtReceived,
      updatedTShirtOrder
    );

    // CASE: Decreasing PO item rewrites history by removing from the transaction group
    if (amtRecvDelta < 0) return getDecreasePOItemStatements(parentOrder, input, amtRecvDelta)

    // CASE: Receiving PO item splits the transaction to track when items were received.
    const onlyQtyChangesCopy: TShirtOrder = {
      ...responseTShirtOrder,
      id: newTShirtOrderId,
      quantity: 0,
      amountReceived: amtRecvDelta
    };
    responseTShirtOrder = onlyQtyChangesCopy;
    return {
      updateTShirtOrderStatements: [getInsertTShirtOrderTablePartiQL(
        entityType,
        parentOrder.id,
        createdAtTimestamp,
        onlyQtyChangesCopy,
        newTShirtOrderId
      )],
      earliestTShirtOrder: updatedTShirtOrder
    }
  };

  const { updateTShirtOrderStatements, earliestTShirtOrder } = getUpdateTShirtOrderStatements();

  const transactionStatements: ParameterizedStatement[] = [
    getUpdateOrderPartiQL(entityType, parentOrder.id, createdAtTimestamp),
    getConditionalUpdateTShirtTablePartiQL(
      maybeNegatedInventoryQtyDelta,
      allowNegativeInventory,
      createdAtTimestamp,
      updatedTShirtOrder.tshirt.id
    ),
    ...updateTShirtOrderStatements,
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

  return { transactionStatements, response, earliestTShirtOrder };
};


export type UpdateOrderTransactionInput = {
  updatedTShirtOrder: TShirtOrder;
  parentOrder: PurchaseOrderOrCustomerOrder;
  inventoryQtyDelta: number;
  createOrderChangeInput: CreateOrderChangeInput;
  // Remember subsequent updates to the same tshirt in a session.
  prevUpdatesTshirtIdsMap: {[x: string]: boolean};
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
  let earliestTShirtOrder;
  let parentOrder: PurchaseOrderOrCustomerOrder = input.parentOrder;

  try {
    if (entityType === EntityType.PurchaseOrder && 
      input.prevUpdatesTshirtIdsMap[input.updatedTShirtOrder.tshirt.id]) {
      parentOrder = await getPurchaseOrderAPI({ id: input.parentOrder.id });
    }

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
    earliestTShirtOrder = res.earliestTShirtOrder;
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

      const shouldNotUpdateCacheExpiration = !response || 
        orderIsAfterStartOfMonth(parentOrder) || 
        isReceivingPOItem(input) || 
        isAddingNewPOItem(input, response?.newTShirtOrder);
      if (shouldNotUpdateCacheExpiration) return response;
      
      // Update the cache expiration
      dynamodbClient.send(new ExecuteStatementCommand(
        getConditionalUpdateCacheExpiration(earliestTShirtOrder)
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
