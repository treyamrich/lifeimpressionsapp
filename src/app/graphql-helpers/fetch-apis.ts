import { ListTShirtsQuery, TShirt, ModelTShirtFilterInput, ModelPurchaseOrderFilterInput, ListPurchaseOrdersQuery, PurchaseOrder, GetPurchaseOrderQueryVariables, GetPurchaseOrderQuery, ListCustomerOrdersQuery, ModelCustomerOrderFilterInput, CustomerOrder, GetCustomerOrderQueryVariables, GetCustomerOrderQuery } from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import { getCustomerOrder, getPurchaseOrder, listCustomerOrders, listPurchaseOrders, listTShirts } from "@/graphql/queries";
import { configuredAuthMode } from "./auth-mode";

export const listTShirtAPI = async (filters: ModelTShirtFilterInput): Promise<TShirt[]> => {
  const resp = await API.graphql<GraphQLQuery<ListTShirtsQuery>>({
    query: listTShirts,
    variables: {
      filter: filters
    },
    authMode: configuredAuthMode
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
    authMode: configuredAuthMode
  })
    .then((res) => res.data?.listPurchaseOrders?.items as PurchaseOrder[])
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to fetch Purchase Orders");
    });
  return resp;
}

export const listCustomerOrderAPI = async (filters: ModelCustomerOrderFilterInput): Promise<CustomerOrder[]> => {
  const resp = await API.graphql<GraphQLQuery<ListCustomerOrdersQuery>>({
    query: listCustomerOrders,
    variables: {
      filter: filters
    },
    authMode: configuredAuthMode
  })
    .then((res) => res.data?.listCustomerOrders?.items as CustomerOrder[])
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to fetch Customer Orders");
    });
  return resp;
}

export const getPurchaseOrderAPI = async ({ id } : GetPurchaseOrderQueryVariables) => {
  const resp = await API.graphql<GraphQLQuery<GetPurchaseOrderQuery>>({
    query: getPurchaseOrder,
    variables: {
      id: id
    },
    authMode: configuredAuthMode
  })
  .then(res => res.data?.getPurchaseOrder)
  .catch(e => {
    console.log(e);
    throw new Error("Failed to fetch Purchase Order");
  })
  return resp;
}

export const getCustomerOrderAPI = async ({ id } : GetCustomerOrderQueryVariables) => {
  const resp = await API.graphql<GraphQLQuery<GetCustomerOrderQuery>>({
    query: getCustomerOrder,
    variables: {
      id: id
    },
    authMode: configuredAuthMode
  })
  .then(res => res.data?.getCustomerOrder)
  .catch(e => {
    console.log(e);
    throw new Error("Failed to fetch Customer Order");
  })
  return resp;
}