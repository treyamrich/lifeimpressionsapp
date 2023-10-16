import { CreateCustomerOrderChangeInput, CreateCustomerOrderChangeMutation, CreateCustomerOrderInput, CreateCustomerOrderMutation, CreatePurchaseOrderChangeInput, CreatePurchaseOrderChangeMutation, CreatePurchaseOrderInput, CreatePurchaseOrderMutation, CreateTShirtInput, CreateTShirtMutation, CreateTShirtOrderMutation, CustomerOrder, CustomerOrderChange, PurchaseOrder, PurchaseOrderChange, TShirt, TShirtOrder } from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import { createCustomerOrder, createCustomerOrderChange, createPurchaseOrder, createPurchaseOrderChange, createTShirt, createTShirtOrder } from "@/graphql/mutations";
import { configuredAuthMode } from "./auth-mode";
import { cleanObjectFields } from "./util";
import { toAWSDateTime } from "@/utils/datetimeConversions";
import dayjs from "dayjs";
import { EntityType } from "../(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { CognitoUser } from '@aws-amplify/auth';
import { OrderChange } from "../(DashboardLayout)/components/tshirt-order-table/table-constants";
import { v4 } from 'uuid';
import { customerOrderTable, purchaseOrderTable } from "./dynamodb";

export const createTShirtAPI = async (
  tshirt: CreateTShirtInput
): Promise<TShirt> => {
  const resp = await API.graphql<GraphQLQuery<CreateTShirtMutation>>({
    query: createTShirt,
    variables: { input: tshirt },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.createTShirt as TShirt)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to create TShirt");
    });
  return resp;
};

export const createCustomerOrderAPI = async (
  co: CreateCustomerOrderInput
): Promise<CustomerOrder> => {
  const cleanCO = cleanObjectFields(co);
  const resp = await API.graphql<GraphQLQuery<CreateCustomerOrderMutation>>({
    query: createCustomerOrder,
    variables: { input: cleanCO },
    authMode: configuredAuthMode
  })
    .then(res => res.data?.createCustomerOrder as CustomerOrder)
    .catch(e => {
      console.log(e);
      throw new Error("Failed to create new Customer Order");
    });
  return resp
}

export const createPurchaseOrderAPI = async (
  po: PurchaseOrder
): Promise<PurchaseOrder> => {
  const cleanPO = cleanObjectFields(po);
  const resp = await API.graphql<GraphQLQuery<CreatePurchaseOrderMutation>>({
    query: createPurchaseOrder,
    variables: { input: cleanPO },
    authMode: configuredAuthMode
  })
    .then(res => res.data?.createPurchaseOrder as PurchaseOrder)
    .catch(e => {
      console.log(e);
      throw new Error("Failed to create new Purchase Order");
    });
  return resp
}

export const createPurchaseOrderChangeAPI = async (
  poChange: CreatePurchaseOrderChangeInput
): Promise<PurchaseOrderChange> => {
  const resp = await API.graphql<GraphQLQuery<CreatePurchaseOrderChangeMutation>>({
    query: createPurchaseOrderChange,
    variables: { input: poChange },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.createPurchaseOrderChange as PurchaseOrderChange)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to create Purchase Order Change");
    });
  return resp;
}

export const createCustomerOrderChangeAPI = async (
  coChange: CreateCustomerOrderChangeInput
): Promise<CustomerOrderChange> => {
  const resp = await API.graphql<GraphQLQuery<CreateCustomerOrderChangeMutation>>({
    query: createCustomerOrderChange,
    variables: { input: coChange },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.createCustomerOrderChange as CustomerOrderChange)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to create Customer Order Change");
    });
  return resp;
}

export type PurchaseOrderOrCustomerOrder = PurchaseOrder | CustomerOrder;

export const createTShirtOrderAPI = async (
  parentObject: PurchaseOrderOrCustomerOrder,
  orderedItems: TShirtOrder[]
): Promise<TShirtOrder[]> => {
  const requests: Promise<TShirtOrder | void>[] = [];
  const errors: string[] = [];
  orderedItems.forEach((tshirtOrder: TShirtOrder) => {
    // Populate the foreign key
    const tshirtToAdd = { ...tshirtOrder };
    if (parentObject.__typename === "PurchaseOrder") {
      tshirtToAdd["purchaseOrderOrderedItemsId"] = parentObject.id;
    } else if (parentObject.__typename === "CustomerOrder") {
      tshirtToAdd["customerOrderOrderedItemsId"] = parentObject.id;
    }
    const resp = API.graphql<GraphQLQuery<CreateTShirtOrderMutation>>({
      query: createTShirtOrder,
      variables: { input: tshirtToAdd },
      authMode: configuredAuthMode
    })
      .then(res => res.data?.createTShirtOrder as TShirtOrder)
      .catch(e => {
        console.log(e);
        errors.push(tshirtToAdd.tShirtOrderTshirtStyleNumber);
      });
    requests.push(resp);
  });

  const results = await Promise.all(requests);
  if (errors.length > 0) {
    throw new Error(`Failed to add TShirt(s): ${errors.toString()} to purchase order`);
  }
  return results as TShirtOrder[];
}

// const getInsertOrderStatement = (input: CreateOrderTransactionInput, entityType: EntityType, createdAt: string) => {
//   const orderId = v4();
//   if (entityType === EntityType.PurchaseOrder) {
//     const purchaseOrder = input as any as PurchaseOrder;
//     return {
//       Statement: `
//         INSERT INTO "${purchaseOrderTable}"
//           __typename: ?,
//           id: ?,
//           orderNumber: ?,
//           vendor: ?,
//           status: ?,
//           isDeleted: ?,
//           createdAt: ?,
//           updatedAt: ?
//       `,
//       Parameters: [
//         { S: "PurchaseOrder" },
//         { S: orderId },
//         { S: purchaseOrder.orderNumber },
//         { S: purchaseOrder.vendor },
//         { S: purchaseOrder.status },
//         { BOOL: false },
//         { S: createdAt },
//         { S: createdAt },
//       ]
//     }
//   }
//   const customerOrder = input as any as CustomerOrder;
//   return {
//     Statement: `
//       INSERT INTO "${customerOrderTable}"
//         __typename: ?,
//         id: ?,
//         customerName: ?,
//         customerEmail: ?,
//         customerPhoneNumber: ?
//         orderNumber: ?,
//         orderStatus: ?,
//         orderNotes: ?,
//         dateNeededBy: ?,
//         isDeleted: ?,
//         createdAt: ?,
//         updatedAt: ?
//     `,
//     Parameters: [
//       { S: "CustomerOrder" },
//       { S: orderId },
//       { S: customerOrder.customerName },
//       { S: customerOrder.customerEmail },
//       { S: customerOrder.customerPhoneNumber },
//       { BOOL: false },
//       { S: createdAt },
//       { S: createdAt },
//     ]
//   }
// }

// export type CreateOrderTransactionInput = {
//   order: PurchaseOrderOrCustomerOrder;
// }

// export const createOrderTransactionAPI = async (input: CreateOrderTransactionInput, entityType: EntityType, user: CognitoUser): Promise<OrderChange> => {
//   // Insertion fields for new Order
//   const createdAtTimestamp = toAWSDateTime(dayjs());
//   const typename = entityType === EntityType.CustomerOrder ? "CustomerOrder" : "PurchaseOrder";

//   // PurchaseOrder uses amountReceived (quantityDelta2) column as the column affecting TShirt table qty
//   const tshirtQtyChange = entityType === EntityType.CustomerOrder ? qtyDeltaStr : qtyDelta2Str;

//   const transactionStatements = [
//     {
//       Statement: `
//         INSERT INTO "${}"
//       `,
//       Parameters: [

//       ]
//     }
//     {
//       Statement: `
//         UPDATE "${tshirtTable.tableName}"
//         SET ${tshirtTable.quantityFieldName[0]} = ${tshirtTable.quantityFieldName[0]} + ?
//         WHERE ${tshirtTable.pkFieldName} = ?`,
//       Parameters: [
//         { N: tshirtQtyChange },
//         { S: tshirtStyleNumber },
//         { N: tshirtQtyChange },
//       ]
//     },
//     {
//       Statement: `
//       UPDATE "${tshirtOrderTable.tableName}"
//       SET ${tshirtOrderTable.quantityFieldName[0]} = ${tshirtOrderTable.quantityFieldName[0]} + ?
//       SET ${tshirtOrderTable.quantityFieldName[1]} = ${tshirtOrderTable.quantityFieldName[1]} + ?
//       WHERE ${tshirtOrderTable.pkFieldName} = ?`,
//       Parameters: [
//         { N: qtyDeltaStr }, { N: qtyDelta2Str }, { S: tshirtOrderId },
//       ]
//     },
//     entityType === EntityType.CustomerOrder ?
//       {
//         Statement: `
//         INSERT INTO "${customerOrderChangeTable.tableName}"
//         value {
//           'id': ?,
//           '__typename': ?,
//           'orderedQuantityChange': ?,
//           'reason': ?,
//           '${parentOrderIdFieldName}': ?,
//           '${associatedTShirtStyleNumberFieldName}': ?,
//           'createdAt': ?,
//           'updatedAt': ?
//         }`,
//         Parameters: [
//           { S: orderChangeUuid },
//           { S: typename },
//           { N: qtyDeltaStr },
//           { S: reason },
//           { S: orderId },
//           { S: tshirtStyleNumber },
//           { S: createdAtTimestamp },
//           { S: createdAtTimestamp }
//         ]
//       } : {
//         Statement: `INSERT INTO "${purchaseOrderChangeTable.tableName}"
//         value {
//           'id': ?,
//           '__typename': ?,
//           'orderedQuantityChange': ?, 
//           'quantityChange': ?, 
//           'reason': ?, 
//           '${parentOrderIdFieldName}': ?, 
//           '${associatedTShirtStyleNumberFieldName}': ?,
//           'createdAt': ?,
//           'updatedAt': ?
//         }`,
//         Parameters: [
//           { S: orderChangeUuid },
//           { S: typename },
//           { N: qtyDeltaStr },
//           { N: qtyDelta2Str },
//           { S: reason },
//           { S: orderId },
//           { S: tshirtStyleNumber },
//           { S: createdAtTimestamp },
//           { S: createdAtTimestamp }
//         ]
//       }
//   ];
//   const command = new ExecuteTransactionCommand({
//     TransactStatements: transactionStatements
//   });
//   const dynamodbClient = await createDynamoDBObj(user);
//   return dynamodbClient.send(command)
//     .then((onFulfilled) => {
//       const orderChange = {
//         __typename: typename,
//         id: orderChangeUuid,
//         createdAt: createdAtTimestamp,
//         updatedAt: createdAtTimestamp,
//         [parentOrderIdFieldName]: orderId,
//         [associatedTShirtStyleNumberFieldName]: tshirtStyleNumber,
//         orderedQuantityChange: quantityDelta,
//         tshirt: {}
//       };
//       if (entityType === EntityType.PurchaseOrder) {
//         orderChange.quantityChange = quantityDelta2 ? quantityDelta2 : 0;
//       }
//       return orderChange as OrderChange;
//     })
//     .catch((e) => {
//       console.log(e);
//       throw new Error(`Failed to update ${entityType} order`);
//     });
// }