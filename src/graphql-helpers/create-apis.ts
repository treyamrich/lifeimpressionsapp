import {  CreateCustomerOrderInput, CreateCustomerOrderMutation, CreatePurchaseOrderInput, CreatePurchaseOrderMutation, CreateTShirtInput, CreateTShirtMutation, CreateTShirtOrderMutation, CustomerOrder, CustomerOrderStatus, PurchaseOrder, TShirt, TShirtOrder } from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import { createCustomerOrder, createPurchaseOrder, createTShirt, createTShirtOrder } from "@/graphql/mutations";
import { configuredAuthMode } from "./auth-mode";
import { cleanObjectFields } from "./util";

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

// REPLACED BY TRANSACTIONS
// export const createCustomerOrderAPI = async (
//   co: CreateCustomerOrderInput
// ): Promise<CustomerOrder> => {
//   const cleanCO = cleanObjectFields(co);
//   const resp = await API.graphql<GraphQLQuery<CreateCustomerOrderMutation>>({
//     query: createCustomerOrder,
//     variables: { input: cleanCO },
//     authMode: configuredAuthMode
//   })
//     .then(res => res.data?.createCustomerOrder as CustomerOrder)
//     .catch(e => {
//       console.log(e);
//       throw new Error("Failed to create new Customer Order");
//     });
//   return resp
// }

// export const createPurchaseOrderAPI = async (
//   po: PurchaseOrder
// ): Promise<PurchaseOrder> => {
//   const cleanPO = cleanObjectFields(po);
//   const resp = await API.graphql<GraphQLQuery<CreatePurchaseOrderMutation>>({
//     query: createPurchaseOrder,
//     variables: { input: cleanPO },
//     authMode: configuredAuthMode
//   })
//     .then(res => res.data?.createPurchaseOrder as PurchaseOrder)
//     .catch(e => {
//       console.log(e);
//       throw new Error("Failed to create new Purchase Order");
//     });
//   return resp
// }