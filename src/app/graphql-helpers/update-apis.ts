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
  tshirtStyleNumber: string;
  tshirtOrderId: string;
  customerOrderId: string;
  reason: string;
  quantityDelta: number;
  quantityDelta2: number | undefined;
}
export const updateCustomerOrderTransactionAPI = async (input: UpdateOrderTransactionInput, entityType: EntityType) => {
  const { tshirtStyleNumber, tshirtOrderId, customerOrderId, reason, quantityDelta, quantityDelta2 } = input;
  const qtyDeltaStr = quantityDelta.toString();
  const qtyDelta2Str = quantityDelta2 ? quantityDelta2.toString() : "0";
  const entitySpecificStatement = entityType === EntityType.CustomerOrder ?
    {
      Statement: `INSERT INTO "${customerOrderChangeTable.tableName}" value {'orderedQuantityChange': '?', 'reason': '?', 'customerOrderChangeHistoryId': '?', 'customerOrderChangeTshirtStyleNumber': '?'}`,
      Parameters: [
        { N: qtyDeltaStr }, { S: reason }, { S: customerOrderId }, { S: tshirtStyleNumber }
      ]
    } : {
      Statement: `INSERT INTO "${purchaseOrderChangeTable.tableName}" value {'orderedQuantityChange': '?', 'quantityChange': '?', 'reason': '?', 'customerOrderChangeHistoryId': '?', 'customerOrderChangeTshirtStyleNumber': '?'}`,
      Parameters: [
        { N: qtyDeltaStr }, { N: qtyDelta2Str }, { S: reason }, { S: customerOrderId }, { S: tshirtStyleNumber }
      ]
    }
  const dynamodbClient = await createDynamoDBObj();
  const command = new ExecuteTransactionCommand({
    TransactStatements: [
      {
        Statement: `UPDATE "${tshirtTable.tableName}" SET ${tshirtTable.quantityFieldName}=${tshirtTable.quantityFieldName}-? WHERE ${tshirtTable.pkFieldName}=? AND ${tshirtTable.quantityFieldName} >= ?`,
        Parameters: [
          { N: qtyDeltaStr }, { S: tshirtStyleNumber }, { N: qtyDeltaStr }
        ]
      },
      {
        Statement: `UPDATE "${tshirtOrderTable.tableName}" SET ${tshirtOrderTable.quantityFieldName}=${tshirtOrderTable.quantityFieldName}-? WHERE ${tshirtOrderTable.pkFieldName}=? AND ${tshirtOrderTable.quantityFieldName} >= ?`,
        Parameters: [
          { N: qtyDeltaStr }, { S: tshirtOrderId }, { N: qtyDeltaStr }
        ]
      },
      entitySpecificStatement
    ]
  });
  return dynamodbClient.send(command);
}