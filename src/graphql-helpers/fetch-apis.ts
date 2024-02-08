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

export interface ListAPIInput<T> {
  doCompletePagination?: boolean;
  filters?: T;
  sortDirection?: ModelSortDirection;
  createdAt?: ModelStringKeyConditionInput;
  nextToken?: string | null;
}

export type ListAPIResponse<T> = {
  result: T[];
  nextToken: string | null | undefined;
};

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

export const listTShirtAPI = async (
  input: ListAPIInput<ModelTShirtFilterInput>
): Promise<ListAPIResponse<TShirt>> => {
  const options: GraphQLOptions = {
    query: listTShirts,
    variables: {
      filter: input.filters,
      sortDirection: input.sortDirection,
      nextToken: input.nextToken,
      limit: PAGINATION_LIMIT,
    },
    authMode: configuredAuthMode,
  };
  const errorMessage = "Failed to fetch TShirts";

  if (input.doCompletePagination) {
    return await completePagination(
      options,
      (res: GraphQLResult<ListTShirtsQuery>) => res.data?.listTShirts,
      errorMessage
    );
  }

  const resp = await API.graphql<GraphQLQuery<ListTShirtsQuery>>(options)
    .then((res: GraphQLResult<ListTShirtsQuery>) => {
      let data = res.data?.listTShirts;
      return { result: data?.items as TShirt[], nextToken: data?.nextToken };
    })
    .catch((e) => {
      console.log(e);
      throw new Error(errorMessage);
    });
  return resp;
};

export const listPurchaseOrderAPI = async (
  input: ListAPIInput<ModelPurchaseOrderFilterInput>
): Promise<ListAPIResponse<PurchaseOrder>> => {
  const options: GraphQLOptions = {
    query: purchaseOrdersByCreatedAt,
    variables: {
      createdAt: input.createdAt,
      filter: input.filters,
      sortDirection: input.sortDirection,
      type: "PurchaseOrder",
      nextToken: input.nextToken,
      limit: PAGINATION_LIMIT,
    },
    authMode: configuredAuthMode,
  };
  const errorMessage = "Failed to fetch Purchase Orders";

  if (input.doCompletePagination) {
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
    .then((res: GraphQLResult<PurchaseOrdersByCreatedAtQuery>) => {
      let data = res.data?.purchaseOrdersByCreatedAt;
      return {
        result: data?.items as PurchaseOrder[],
        nextToken: data?.nextToken,
      };
    })
    .catch((e) => {
      console.log(e);
      throw new Error(errorMessage);
    });
  return resp;
};

export const listCustomerOrderAPI = async (
  input: ListAPIInput<ModelCustomerOrderFilterInput>
): Promise<ListAPIResponse<CustomerOrder>> => {
  const options: GraphQLOptions = {
    query: customerOrdersByCreatedAt,
    variables: {
      createdAt: input.createdAt,
      filter: input.filters,
      sortDirection: input.sortDirection,
      type: "CustomerOrder",
      nextToken: input.nextToken,
      limit: PAGINATION_LIMIT,
    },
    authMode: configuredAuthMode,
  };
  const errorMessage = "Failed to fetch Customer Orders";

  if (input.doCompletePagination) {
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
      let data = res.data?.customerOrdersByCreatedAt;
      return {
        result: data?.items as CustomerOrder[],
        nextToken: data?.nextToken,
      };
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
