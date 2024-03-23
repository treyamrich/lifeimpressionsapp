import {
  TShirt,
  ModelTShirtFilterInput,
  ModelPurchaseOrderFilterInput,
  PurchaseOrder,
  ModelCustomerOrderFilterInput,
  CustomerOrder,
  CustomerOrdersByCreatedAtQuery,
  PurchaseOrdersByCreatedAtQuery,
  TshirtsByQtyQuery,
  OrderChange,
  ModelOrderChangeFilterInput,
  OrderChangesByCreatedAtQuery,
  ModelTShirtOrderFilterInput,
  ListTShirtOrdersQuery,
  TShirtOrder,
} from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import {
  customerOrdersByCreatedAt,
  listTShirtOrders,
  orderChangesByCreatedAt,
  purchaseOrdersByCreatedAt,
  tshirtsByQty,
} from "@/graphql/queries";
import { configuredAuthMode } from "./auth-mode";
import { GraphQLOptions, GraphQLResult } from "@aws-amplify/api-graphql";
import { ListAPIInput, ListAPIResponse, Query } from "./types";


const PAGINATION_LIMIT = 100;

async function completePagination<T>(
  options: GraphQLOptions,
  dataExtractor: (res: GraphQLResult<T>) => any,
  onErrMsg: string
): Promise<ListAPIResponse<any>> {
  let done = false;
  let result: any[] = [];

  while (!done) {
    await API.graphql<GraphQLQuery<T>>(options)
      .then((res: any) => {
        const data = dataExtractor(res);
        done = !data.nextToken;
        options.variables = { ...options.variables, nextToken: data.nextToken };
        result = result.concat(data.items);
      })
      .catch((e: any) => {
        console.log(e);
        throw new Error(onErrMsg);
      });
  }
  return { result: result, nextToken: null };
}

async function listAPI<F, Q, R>(
  input: ListAPIInput<F>,
  q: Query,
  qVariables: object,
  errorMessage: string
): Promise<ListAPIResponse<R>> {
  const options: GraphQLOptions = {
    query: q.query,
    variables: {
      ...qVariables,
      filter: input.filters,
      nextToken: input.nextToken,
      limit: PAGINATION_LIMIT,
    },
    authMode: configuredAuthMode,
  };

  const extractor = (res: GraphQLResult<Q>) => {
    const data = res.data as any;
    return data ? data[q.name] : undefined;
  }

  if (input.doCompletePagination) {
    return await completePagination(
      options,
      extractor,
      errorMessage
    );
  }

  const resp = await API.graphql<GraphQLQuery<Q>>(
    options
  )
    .then((res: any) => {
      let data = extractor(res);
      return {
        result: data?.items as R[],
        nextToken: data?.nextToken,
      };
    })
    .catch((e) => {
      console.log(e);
      throw new Error(errorMessage);
    });
  return resp;
};

export const listTShirtAPI = async (
  input: ListAPIInput<ModelTShirtFilterInput>
): Promise<ListAPIResponse<TShirt>> => {
  const q: Query = { name: 'tshirtsByQty', query: tshirtsByQty };
  const v = {
    sortDirection: input.sortDirection,
    indexField: "TShirtIndexField" // Required to access 2nd index
  };
  return await listAPI<ModelTShirtFilterInput, TshirtsByQtyQuery, TShirt>(
    input,
    q,
    v,
    "Failed to fetch TShirts"
  );
}

export const listPurchaseOrderAPI = async (
  input: ListAPIInput<ModelPurchaseOrderFilterInput>
): Promise<ListAPIResponse<PurchaseOrder>> => {
  const q: Query = {
    name: 'purchaseOrdersByCreatedAt',
    query: purchaseOrdersByCreatedAt
  };
  const v = {
    sortDirection: input.sortDirection,
    type: "PurchaseOrder", // Index Key
    createdAt: input.createdAt // Sort Key
  };
  return await listAPI<
    ModelPurchaseOrderFilterInput,
    PurchaseOrdersByCreatedAtQuery,
    PurchaseOrder>(input, q, v, "Failed to fetch Purchase Orders")
};

export const listCustomerOrderAPI = async (
  input: ListAPIInput<ModelCustomerOrderFilterInput>
): Promise<ListAPIResponse<CustomerOrder>> => {
  const q: Query = {
    name: 'customerOrdersByCreatedAt',
    query: customerOrdersByCreatedAt
  }
  const v = {
    sortDirection: input.sortDirection,
    type: "CustomerOrder", // Index Key
    createdAt: input.createdAt // Sort key
  }
  return await listAPI<
    ModelCustomerOrderFilterInput,
    CustomerOrdersByCreatedAtQuery,
    CustomerOrder>(input, q, v, "Failed to fetch Customer Orders");
};


export const listOrderChangeHistoryAPI = async (
  input: ListAPIInput<ModelOrderChangeFilterInput>
): Promise<ListAPIResponse<OrderChange>> => {
  const q: Query = {
    name: 'orderChangesByCreatedAt',
    query: orderChangesByCreatedAt
  }
  const v = {
    sortDirection: input.sortDirection,
    indexField: input.indexPartitionKey, // Index key
    createdAt: input.createdAt  // Sort key
  }
  return await listAPI<
    ModelOrderChangeFilterInput,
    OrderChangesByCreatedAtQuery,
    OrderChange>(input, q, v, "Failed to fetch Change History")
};

export const listTShirtOrdersAPI = async (
  input: ListAPIInput<ModelTShirtOrderFilterInput>
): Promise<ListAPIResponse<TShirtOrder>> => {
  const q: Query = { name: 'listTShirtOrders', query: listTShirtOrders };
  const v = {}
  return await listAPI<
    ModelTShirtOrderFilterInput,
    ListTShirtOrdersQuery,
    TShirtOrder>(input, q, v, "Failed to fetch Order Items")
};