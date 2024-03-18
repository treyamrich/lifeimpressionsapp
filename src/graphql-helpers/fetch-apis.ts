import {
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
  TshirtsByQtyQuery,
  OrderChange,
  ModelOrderChangeFilterInput,
  OrderChangesByCreatedAtQuery,
  GetInventoryValueCacheQueryVariables,
  GetInventoryValueCacheQuery,
  GetCacheExpirationQuery,
} from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import {
  customerOrdersByCreatedAt,
  getCacheExpiration,
  getCustomerOrder,
  getInventoryValueCache,
  getPurchaseOrder,
  orderChangesByCreatedAt,
  purchaseOrdersByCreatedAt,
  tshirtsByQty,
} from "@/graphql/queries";
import { configuredAuthMode } from "./auth-mode";
import { GraphQLOptions, GraphQLResult } from "@aws-amplify/api-graphql";
import { CACHE_EXPIRATION_ID } from "@/dynamodb-transactions/dynamodb";

export interface ListAPIInput<T> {
  doCompletePagination?: boolean;
  filters?: T;
  sortDirection?: ModelSortDirection;
  createdAt?: ModelStringKeyConditionInput;
  nextToken?: string | null;
  indexPartitionKey?: string;
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
    query: tshirtsByQty,
    variables: {
      filter: input.filters,
      sortDirection: input.sortDirection,
      nextToken: input.nextToken,
      indexField: "TShirtIndexField", // Required to access 2nd index
      limit: PAGINATION_LIMIT,
    },
    authMode: configuredAuthMode,
  };
  const errorMessage = "Failed to fetch TShirts";

  if (input.doCompletePagination) {
    return await completePagination(
      options,
      (res: GraphQLResult<TshirtsByQtyQuery>) => res.data?.tshirtsByQty,
      errorMessage
    );
  }

  const resp = await API.graphql<GraphQLQuery<TshirtsByQtyQuery>>(options)
    .then((res: GraphQLResult<TshirtsByQtyQuery>) => {
      let data = res.data?.tshirtsByQty;
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


export const listOrderChangeHistoryAPI = async (
  input: ListAPIInput<ModelOrderChangeFilterInput>
): Promise<ListAPIResponse<OrderChange>> => {
  const options: GraphQLOptions = {
    query: orderChangesByCreatedAt,
    variables: {
      createdAt: input.createdAt,
      filter: input.filters,
      indexField: input.indexPartitionKey, // Required to access 2nd index
      sortDirection: input.sortDirection,
      nextToken: input.nextToken,
      limit: PAGINATION_LIMIT,
    },
    authMode: configuredAuthMode,
  };
  const errorMessage = "Failed to fetch Change History";

  if (input.doCompletePagination) {
    return await completePagination(
      options,
      (res: GraphQLResult<OrderChangesByCreatedAtQuery>) =>
        res.data?.orderChangesByCreatedAt,
      errorMessage
    );
  }

  const resp = await API.graphql<GraphQLQuery<OrderChangesByCreatedAtQuery>>(
    options
  )
    .then((res: GraphQLResult<OrderChangesByCreatedAtQuery>) => {
      let data = res.data?.orderChangesByCreatedAt;
      return {
        result: data?.items as OrderChange[],
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
}: GetPurchaseOrderQueryVariables): Promise<PurchaseOrder> => {
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
  return resp as PurchaseOrder;
};

export const getCustomerOrderAPI = async ({
  id,
}: GetCustomerOrderQueryVariables): Promise<CustomerOrder> => {
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
  return resp as CustomerOrder;
};

export const getInventoryValueAPI = async({ 
  createdAt 
}: GetInventoryValueCacheQueryVariables) => {
  const resp = await API.graphql<GraphQLQuery<GetInventoryValueCacheQuery>>({
    query: getInventoryValueCache,
    variables: { createdAt: createdAt },
    authMode: configuredAuthMode
  })
  .catch(e => {
    console.log(e);
    throw new Error("Failed to fetch inventory value")
  })
  .then(res => {
    const data = res.data?.getInventoryValueCache;
    if(!data) throw new Error('Inventory value report was not found.')
    return data;
  })
  return resp
}

export const getCacheExpirationAPI = async () => {
  const resp = await API.graphql<GraphQLQuery<GetCacheExpirationQuery>>({
    query: getCacheExpiration,
    variables: { id: CACHE_EXPIRATION_ID },
    authMode: configuredAuthMode
  })
  .catch(e => {
    console.log(e)
    throw new Error('Failed to get inventory value report expiration')
  })
  .then(res => {
    const data = res.data?.getCacheExpiration!;
    if(!data) throw Error('Inventory value report expiration data not found');
    return data;
  })
  return resp;
}