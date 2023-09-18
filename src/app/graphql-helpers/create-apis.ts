import { CreatePurchaseOrderInput, CreatePurchaseOrderMutation, CreateTShirtInput, CreateTShirtMutation, PurchaseOrder, TShirt } from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import { createPurchaseOrder, createTShirt } from "@/graphql/mutations";
import { configuredAuthMode } from "./auth-mode";

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

export const createPurchaseOrderAPI = async (
  po: CreatePurchaseOrderInput
): Promise<PurchaseOrder> => {
  const resp = await API.graphql<GraphQLQuery<CreatePurchaseOrderMutation>>({
    query: createPurchaseOrder,
    variables: { input: po },
    authMode: configuredAuthMode
  })
    .then(res => res.data?.createPurchaseOrder as PurchaseOrder)
    .catch(e => {
      console.log(e);
      throw new Error("Failed to create new Purchase Order");
    });
  return resp
}