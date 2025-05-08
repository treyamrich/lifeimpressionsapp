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
  listTShirtOrders,
  orderChangesByCreatedAt,
  tshirtsByQty,
  tshirtsByStyleNumber
} from "@/graphql/queries";
import { configuredAuthMode } from "./auth-mode";
import { GraphQLOptions, GraphQLResult } from "@aws-amplify/api-graphql";
import { ListAPIInput, Query } from "./types";
import { customerOrderByCustomerNameMinimum, customerOrdersByCreatedAtMinimum, purchaseOrdersByCreatedAtMinimum } from "@/my-graphql-queries/list-queries";
import { Page } from "@/api/types";
import { fetchUntilLimitItemsReceived } from "@/api/list-apis";

const PAGINATION_LIMIT = 100;

async function completePagination<T>(
  options: GraphQLOptions,
  dataExtractor: (res: GraphQLResult<T>) => any,
  onErrMsg: string
): Promise<Page<any>> {
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
  return { items: result, nextToken: null };
}

async function listAPI<F, Q, R>(
  input: ListAPIInput<F>,
  q: Query,
  qVariables: object,
  errorMessage: string
): Promise<Page<R>> {
  const options: GraphQLOptions = {
    query: q.query,
    variables: {
      ...qVariables,
      filter: input.filters,
      nextToken: input.nextToken,
      limit: input.limit ?? PAGINATION_LIMIT,
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

  const f = () => API.graphql<GraphQLQuery<Q>>(
    options
  )
    .then((res: any) => {
      let data = extractor(res);
      return {
        items: data?.items as R[],
        nextToken: data?.nextToken,
      };
    })
    .catch((e) => {
      console.log(e);
      throw new Error(errorMessage);
    });
  return fetchUntilLimitItemsReceived<R>({
    nextToken: input.nextToken,
    queryFn: f,
    limit: input.limit ?? PAGINATION_LIMIT,
  });
};

export const listTShirtAPI = async (
  input: ListAPIInput<ModelTShirtFilterInput>,
  queryColumn?: "byStyleNumber" | "byQty"
): Promise<Page<TShirt>> => {
  let q: Query;
  let v: any = { sortDirection: input.sortDirection }

  if (queryColumn === "byStyleNumber") {
    q = { name: 'tshirtsByStyleNumber', query: tshirtsByStyleNumber };
    v = {...v, styleNumber: input.indexPartitionKey };
  } else {
    q = { name: 'tshirtsByQty', query: tshirtsByQty };
    v = {...v, indexField: "TShirtIndexField" };
  }
    
  return await listAPI<ModelTShirtFilterInput, TshirtsByQtyQuery, TShirt>(
    input,
    q,
    v,
    "Failed to fetch TShirts"
  );
}

// Keeping this separate from hook since reports don't require pagination
export const listPurchaseOrderAPI = async (
  input: ListAPIInput<ModelPurchaseOrderFilterInput>
): Promise<Page<PurchaseOrder>> => {
  const q: Query = {
    name: 'purchaseOrdersByCreatedAt',
    query: purchaseOrdersByCreatedAtMinimum // Query name is the same, just no change history
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
  input: ListAPIInput<ModelCustomerOrderFilterInput>,
  queryColumn?: "byCustomerName" | "byCreatedAt"
): Promise<Page<CustomerOrder>> => {
  let q: Query;
  let v: any = { sortDirection: input.sortDirection }
  switch (queryColumn) {
    case "byCustomerName":
      q = {
        name: 'customerOrderByCustomerName',
        query: customerOrderByCustomerNameMinimum // Query name is the same, just no change history
      };
      v = { ...v, customerName: input.indexPartitionKey };
      break;
    default:
      q = {
        name: 'customerOrdersByCreatedAt',
        query: customerOrdersByCreatedAtMinimum // Query name is the same, just no change history
      }
      v = {
        ...v,
        type: "CustomerOrder", // Index Key
        createdAt: input.createdAt // Sort key
      }
  }
  return await listAPI<
    ModelCustomerOrderFilterInput,
    CustomerOrdersByCreatedAtQuery,
    CustomerOrder>(input, q, v, "Failed to fetch Customer Orders");
};


export const listOrderChangeHistoryAPI = async (
  input: ListAPIInput<ModelOrderChangeFilterInput>
): Promise<Page<OrderChange>> => {
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
): Promise<Page<TShirtOrder>> => {
  const q: Query = { name: 'listTShirtOrders', query: listTShirtOrders };
  const v = {}
  return await listAPI<
    ModelTShirtOrderFilterInput,
    ListTShirtOrdersQuery,
    TShirtOrder>(input, q, v, "Failed to fetch Order Items")
};