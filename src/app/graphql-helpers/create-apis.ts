import { CreatePurchaseOrderInput, CreatePurchaseOrderMutation, CreateTShirtInput, CreateTShirtMutation, PurchaseOrder, TShirt } from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery, GRAPHQL_AUTH_MODE } from "@aws-amplify/api";
import { createPurchaseOrder, createTShirt } from "@/graphql/mutations";

export const createTShirtAPI = async (
  tshirt: CreateTShirtInput
): Promise<TShirt> => {
  const resp = await API.graphql<GraphQLQuery<CreateTShirtMutation>>({
    query: createTShirt,
    variables: { input: tshirt },
    authMode: GRAPHQL_AUTH_MODE.API_KEY,
  })
    .then((res) => res.data?.createTShirt as TShirt)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to create TShirt");
    });
  return resp;
};

export const createPurchaseOrderAPI = async (
  po: CreatePurchaseOrderInput
): Promise<PurchaseOrder> => {
  const resp = await API.graphql<GraphQLQuery<CreatePurchaseOrderMutation>>({
    query: createPurchaseOrder,
    variables: { input: po },
    authMode: GRAPHQL_AUTH_MODE.API_KEY
  })
  .then(res => res.data?.createPurchaseOrder as PurchaseOrder)
  .catch(e => {
    console.log(e);
    throw new Error("Failed to create new Purchase Order");
  });
  return resp
}