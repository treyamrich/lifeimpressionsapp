import {
  UpdateTShirtInput,
  UpdateTShirtMutation,
  TShirt,
  UpdatePurchaseOrderInput,
  PurchaseOrder,
  UpdatePurchaseOrderMutation,
  UpdateTShirtOrderInput,
  TShirtOrder,
  UpdateTShirtOrderMutation,
  UpdateCustomerOrderInput,
  UpdateCustomerOrderMutation,
  CustomerOrder,
  PurchaseOrderChange,
} from "@/API";
import { ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import {
  updateCustomerOrder,
  updatePurchaseOrder,
  updateTShirt,
  updateTShirtOrder,
} from "@/graphql/mutations";
import { configuredAuthMode } from "./auth-mode";
import { cleanObjectFields } from "./util";
import { createDynamoDBObj, customerOrderChangeTable, purchaseOrderChangeTable, tshirtOrderTable, tshirtTable } from './dynamodb';
import { EntityType } from "../(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { CognitoUser } from '@aws-amplify/auth';
import { toAWSDateTime } from "@/utils/datetimeConversions";
import dayjs from "dayjs";
import { uuid } from 'uuidv4';
import { OrderChange } from "../(DashboardLayout)/components/tshirt-order-table/table-constants";

export const updateTShirtAPI = async (
  tshirt: UpdateTShirtInput
): Promise<TShirt> => {
  //Clean up the data by removing fields not defined in the graphql request
  const updatedTShirt = cleanObjectFields(tshirt);
  const resp = await API.graphql<GraphQLQuery<UpdateTShirtMutation>>({
    query: updateTShirt,
    variables: { input: updatedTShirt },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.updateTShirt as TShirt)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to update TShirt");
    });
  return resp;
};

export const updateTShirtOrderAPI = async (
  tshirtOrder: UpdateTShirtOrderInput
): Promise<TShirtOrder> => {
  const updatedTshirtOrder = cleanObjectFields(tshirtOrder);
  const resp = await API.graphql<GraphQLQuery<UpdateTShirtOrderMutation>>({
    query: updateTShirtOrder,
    variables: { input: updatedTshirtOrder },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.updateTShirtOrder as TShirtOrder)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to update TShirtOrder");
    });
  return resp;
};

export const updatePurchaseOrderAPI = async (
  po: UpdatePurchaseOrderInput
): Promise<PurchaseOrder> => {
  //Clean up the data by removing fields not defined in the graphql request
  const updatedPO = cleanObjectFields(po);
  const resp = await API.graphql<GraphQLQuery<UpdatePurchaseOrderMutation>>({
    query: updatePurchaseOrder,
    variables: { input: updatedPO },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.updatePurchaseOrder as PurchaseOrder)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to update Purchase Order");
    });
  return resp;
};

export const updateCustomerOrderAPI = async (
  co: UpdateCustomerOrderInput
): Promise<CustomerOrder> => {
  //Clean up the data by removing fields not defined in the graphql request
  const updatedCO = cleanObjectFields(co);
  const resp = await API.graphql<GraphQLQuery<UpdateCustomerOrderMutation>>({
    query: updateCustomerOrder,
    variables: { input: updatedCO },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.updateCustomerOrder as CustomerOrder)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to update Customer Order");
    });
  return resp;
};


export type UpdateOrderTransactionInput = {
  tshirtOrder: TShirtOrder;
  orderId: string;
  reason: string;
  quantityDelta: number;
  quantityDelta2: number | undefined;
}

export const updateOrderTransactionAPI = async (input: UpdateOrderTransactionInput, entityType: EntityType, user: CognitoUser): Promise<OrderChange> => {
  const { tshirtOrder, orderId, reason, quantityDelta, quantityDelta2 } = input;
  const tshirtOrderId = tshirtOrder.id;
  const tshirtStyleNumber = tshirtOrder.tShirtOrderTshirtStyleNumber;

  let qtyDelta = entityType === EntityType.CustomerOrder ? -quantityDelta : quantityDelta; 
  const qtyDeltaStr = qtyDelta.toString();
  const qtyDelta2Str = quantityDelta2 ? quantityDelta2.toString() : "0";

  // Insertion fields for new OrderChange
  const createdAtTimestamp = toAWSDateTime(dayjs());
  const orderChangeUuid = uuid();
  const typename = entityType === EntityType.CustomerOrder ? "CustomerOrderChange" : "PurchaseOrderChange";
  const parentOrderIdFieldName = `${entityType}OrderChangeHistoryId`
  const associatedTShirtStyleNumberFieldName = `${entityType}OrderChangeTshirtStyleNumber`

  const transactionStatements = [
    {
      Statement: `
        UPDATE "${tshirtTable.tableName}"
        SET ${tshirtTable.quantityFieldName[0]} = ${tshirtTable.quantityFieldName[0]} + ?
        WHERE ${tshirtTable.pkFieldName} = ? AND ${tshirtTable.quantityFieldName[0]} >= ?`,
      Parameters: [
        { N: qtyDeltaStr }, { S: tshirtStyleNumber }, { N: qtyDeltaStr }
      ]
    },
    {
      Statement: `
      UPDATE "${tshirtOrderTable.tableName}"
      SET ${tshirtOrderTable.quantityFieldName[0]} = ${tshirtOrderTable.quantityFieldName[0]} + ?
      SET ${tshirtOrderTable.quantityFieldName[1]} = ${tshirtOrderTable.quantityFieldName[1]} + ?
      WHERE ${tshirtOrderTable.pkFieldName} = ? AND ${tshirtOrderTable.quantityFieldName[1]} >= ?`,
      Parameters: [
        { N: qtyDeltaStr }, { N: qtyDelta2Str }, { S: tshirtOrderId }, { N: qtyDelta2Str } //qtyDelta2Str should be amountReceived column
      ]
    },
    entityType === EntityType.CustomerOrder ?
      {
        Statement: `
        INSERT INTO "${customerOrderChangeTable.tableName}"
        value {
          'id': ?,
          '__typename': ?,
          'orderedQuantityChange': ?,
          'reason': ?,
          '${parentOrderIdFieldName}': ?,
          '${associatedTShirtStyleNumberFieldName}': ?,
          'createdAt': ?,
          'updatedAt': ?
        }`,
        Parameters: [
          { S: orderChangeUuid },
          { S: typename },
          { N: qtyDeltaStr },
          { S: reason },
          { S: orderId },
          { S: tshirtStyleNumber },
          { S: createdAtTimestamp },
          { S: createdAtTimestamp }
        ]
      } : {
        Statement: `INSERT INTO "${purchaseOrderChangeTable.tableName}"
        value {
          'id': ?,
          '__typename': ?,
          'orderedQuantityChange': ?, 
          'quantityChange': ?, 
          'reason': ?, 
          '${parentOrderIdFieldName}': ?, 
          '${associatedTShirtStyleNumberFieldName}': ?,
          'createdAt': ?,
          'updatedAt': ?
        }`,
        Parameters: [
          { S: orderChangeUuid },
          { S: typename },
          { N: qtyDeltaStr },
          { N: qtyDelta2Str },
          { S: reason },
          { S: orderId },
          { S: tshirtStyleNumber },
          { S: createdAtTimestamp },
          { S: createdAtTimestamp }
        ]
      }
  ];

  const command = new ExecuteTransactionCommand({
    TransactStatements: transactionStatements
  });
  const dynamodbClient = await createDynamoDBObj(user);
  return dynamodbClient.send(command)
    .then((onFulfilled) => {
      const orderChange = {
        __typename: typename,
        id: orderChangeUuid,
        createdAt: createdAtTimestamp,
        updatedAt: createdAtTimestamp,
        [parentOrderIdFieldName]: orderId,
        [associatedTShirtStyleNumberFieldName]: tshirtStyleNumber,
        orderedQuantityChange: quantityDelta,
        tshirt: {}
      };
      if (entityType === EntityType.PurchaseOrder) {
        orderChange.quantityChange = quantityDelta2 ? quantityDelta2 : 0;
      }
      return orderChange as OrderChange;
    })
    .catch((e) => {
      console.log(e);
      throw new Error(`Failed to update ${entityType}`);
    });
}