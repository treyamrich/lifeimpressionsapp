import { ListTShirtsQuery, TShirt, ModelTShirtFilterInput, ModelPurchaseOrderFilterInput, ListPurchaseOrdersQuery, PurchaseOrder } from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery, GRAPHQL_AUTH_MODE } from "@aws-amplify/api";
import { listPurchaseOrders, listTShirts } from "@/graphql/queries";

export const listTShirtAPI = async (filters: ModelTShirtFilterInput): Promise<TShirt[]> => {
  const resp = await API.graphql<GraphQLQuery<ListTShirtsQuery>>({
    query: listTShirts,
    variables: {
      filter: filters
    },
    authMode: GRAPHQL_AUTH_MODE.API_KEY,
  })
    .then((res) => res.data?.listTShirts?.items as TShirt[])
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to fetch TShirts");
    });
  return resp;
};

export const listPurchaseOrderAPI = async (filters: ModelPurchaseOrderFilterInput): Promise<PurchaseOrder[]> => {
  const resp = await API.graphql<GraphQLQuery<ListPurchaseOrdersQuery>>({
    query: listPurchaseOrders,
    variables: {
      filter: filters
    },
    authMode: GRAPHQL_AUTH_MODE.API_KEY
  })
    .then((res) => res.data?.listPurchaseOrders?.items as PurchaseOrder[])
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to fetch Purchase Orders");
    });
  return resp;
}