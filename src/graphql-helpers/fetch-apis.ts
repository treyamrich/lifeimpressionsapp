import { ListTShirtsQuery, TShirt, ModelTShirtFilterInput, ModelPurchaseOrderFilterInput, ListPurchaseOrdersQuery, PurchaseOrder, GetPurchaseOrderQueryVariables, GetPurchaseOrderQuery, ListCustomerOrdersQuery, ModelCustomerOrderFilterInput, CustomerOrder, GetCustomerOrderQueryVariables, GetCustomerOrderQuery, ModelSortDirection, CustomerOrdersByCreatedAtQuery, PurchaseOrdersByCreatedAtQuery, POStatus } from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import { customerOrdersByCreatedAt, getCustomerOrder, getPurchaseOrder, listCustomerOrders, listPurchaseOrders, listTShirts, purchaseOrdersByCreatedAt } from "@/graphql/queries";
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

export const listPurchaseOrderAPI = async (filters: ModelPurchaseOrderFilterInput, sortDirection: ModelSortDirection): Promise<PurchaseOrder[]> => {
  const resp = await API.graphql<GraphQLQuery<PurchaseOrdersByCreatedAtQuery>>({
    query: purchaseOrdersByCreatedAt,
    variables: {
      filter: filters,
      sortDirection: sortDirection,
      type: "PurchaseOrder"
    },
    authMode: configuredAuthMode
  })
    .then((res) => res.data?.purchaseOrdersByCreatedAt?.items as PurchaseOrder[])
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to fetch Purchase Orders");
    });
  return resp;
}

export const listCustomerOrderAPI = async (filters: ModelCustomerOrderFilterInput, sortDirection: ModelSortDirection): Promise<CustomerOrder[]> => {
  const resp = await API.graphql<GraphQLQuery<CustomerOrdersByCreatedAtQuery>>({
    query: customerOrdersByCreatedAt,
    variables: {
      filter: filters,
      sortDirection: sortDirection,
      type: "CustomerOrder"
    },
    authMode: configuredAuthMode
  })
    .then((res) => res.data?.customerOrdersByCreatedAt?.items as CustomerOrder[])
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