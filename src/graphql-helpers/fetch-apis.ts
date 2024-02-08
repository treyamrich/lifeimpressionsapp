import {
  ListTShirtsQuery,
  TShirt,
  ModelTShirtFilterInput,
  ModelPurchaseOrderFilterInput,
  PurchaseOrder,
  GetPurchaseOrderQueryVariables,
  GetPurchaseOrderQuery,
  ModelCustomerOrderFilterInput,
  CustomerOrder,
  GetCustomerOrderQueryVariables,
  GetCustomerOrderQuery,
  ModelSortDirection,
  CustomerOrdersByCreatedAtQuery,
  PurchaseOrdersByCreatedAtQuery,
  ModelStringKeyConditionInput,
} from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import {
  customerOrdersByCreatedAt,
  getCustomerOrder,
  getPurchaseOrder,
  listCustomerOrders,
  listPurchaseOrders,
  listTShirts,
  purchaseOrdersByCreatedAt,
} from "@/graphql/queries";
import { configuredAuthMode } from "./auth-mode";
import { GraphQLOptions, GraphQLResult } from "@aws-amplify/api-graphql";

const PAGINATION_LIMIT = 100;

async function completePagination<T>(
  options: GraphQLOptions,
  dataExtractor: (res: GraphQLResult<T>) => any,
  onErrMsg: string
): Promise<any[]> {
  let done = false;
  let result: any = [];
  options.variables = { ...options.variables, limit: PAGINATION_LIMIT }

  while (!done) {
    await API.graphql<GraphQLQuery<T>>(options)
      .then((res: any) => {
        const data = dataExtractor(res);
        done = !data.nextToken;
        options.variables = {...options.variables, nextToken: data.nextToken};
        result = result.concat(data.items);
      })
      .catch((e: any) => {
        console.log(e);
        throw new Error(onErrMsg);
      });
  }
  return result;
}

export const listTShirtAPI = async (
  filters: ModelTShirtFilterInput
): Promise<TShirt[]> => {
  const options: GraphQLOptions = {
    query: listTShirts,
    variables: {
      filter: filters,
    },
    authMode: configuredAuthMode,
  };

  const resp = await API.graphql<GraphQLQuery<ListTShirtsQuery>>(options)
    .then(
      (res: GraphQLResult<ListTShirtsQuery>) =>
        res.data?.listTShirts?.items as TShirt[]
    )
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to fetch TShirts");
    });
  return resp;
};

export const listPurchaseOrderAPI = async (
  doCompletePagination: boolean,
  filters?: ModelPurchaseOrderFilterInput,
  sortDirection?: ModelSortDirection,
  createdAt?: ModelStringKeyConditionInput
): Promise<PurchaseOrder[]> => {
  const options: GraphQLOptions = {
    query: purchaseOrdersByCreatedAt,
    variables: {
      createdAt: createdAt,
      filter: filters,
      sortDirection: sortDirection,
      type: "PurchaseOrder",
    },
    authMode: configuredAuthMode,
  };
  const errorMessage = "Failed to fetch Purchase Orders";

  if (doCompletePagination) {
    return await completePagination(
      options,
      (res: GraphQLResult<PurchaseOrdersByCreatedAtQuery>) =>
        res.data?.purchaseOrdersByCreatedAt,
      errorMessage
    );
  }

  const resp = await API.graphql<GraphQLQuery<PurchaseOrdersByCreatedAtQuery>>(
    options
  )
    .then(
      (res: GraphQLResult<PurchaseOrdersByCreatedAtQuery>) =>
        res.data?.purchaseOrdersByCreatedAt?.items as PurchaseOrder[]
    )
    .catch((e) => {
      console.log(e);
      throw new Error(errorMessage);
    });
  return resp;
};

export const listCustomerOrderAPI = async (
  doCompletePagination: boolean,
  filters?: ModelCustomerOrderFilterInput,
  sortDirection?: ModelSortDirection,
  createdAt?: ModelStringKeyConditionInput,
): Promise<CustomerOrder[]> => {

  const options: GraphQLOptions = {
    query: customerOrdersByCreatedAt,
    variables: {
      createdAt: createdAt,
      filter: filters,
      sortDirection: sortDirection,
      type: "CustomerOrder",
    },
    authMode: configuredAuthMode,
  };
  const errorMessage = "Failed to fetch Customer Orders";

  if (doCompletePagination) {
    return await completePagination(
      options,
      (res: GraphQLResult<CustomerOrdersByCreatedAtQuery>) =>
        res.data?.customerOrdersByCreatedAt,
      errorMessage
    );
  }

  const resp = await API.graphql<GraphQLQuery<CustomerOrdersByCreatedAtQuery>>(
    options
  )
    .then((res: GraphQLResult<CustomerOrdersByCreatedAtQuery>) => {
      return res.data?.customerOrdersByCreatedAt?.items as CustomerOrder[];
    })
    .catch((e) => {
      console.log(e);
      throw new Error(errorMessage);
    });
  return resp;
};

export const getPurchaseOrderAPI = async ({
  id,
}: GetPurchaseOrderQueryVariables) => {
  const resp = await API.graphql<GraphQLQuery<GetPurchaseOrderQuery>>({
    query: getPurchaseOrder,
    variables: {
      id: id,
    },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.getPurchaseOrder)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to fetch Purchase Order");
    });
  return resp;
};

export const getCustomerOrderAPI = async ({
  id,
}: GetCustomerOrderQueryVariables) => {
  const resp = await API.graphql<GraphQLQuery<GetCustomerOrderQuery>>({
    query: getCustomerOrder,
    variables: {
      id: id,
    },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.getCustomerOrder)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to fetch Customer Order");
    });
  return resp;
};
