import {
  PurchaseOrder,
  GetPurchaseOrderQueryVariables,
  GetPurchaseOrderQuery,
  CustomerOrder,
  GetCustomerOrderQueryVariables,
  GetCustomerOrderQuery,
  GetInventoryValueCacheQueryVariables,
  GetInventoryValueCacheQuery,
  GetCacheExpirationQuery,
  InventoryValueCache,
  CacheExpiration,
} from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import {
  getCacheExpiration,
  getCustomerOrder,
  getInventoryValueCache,
  getPurchaseOrder,
} from "@/graphql/queries";
import { configuredAuthMode } from "./auth-mode";
import { CACHE_EXPIRATION_ID } from "@/dynamodb-transactions/dynamodb";
import { Query } from "./types";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { getCustomerOrderMin, getPurchaseOrderMin } from "@/my-graphql-queries/queries";
import { OrderMinInfo, OrderMinInfoQuery } from "@/my-graphql-queries/types";

async function getAPI<Q, R>(
  q: Query,
  variables: object,
  errorMsg: string
): Promise<R> {
  const extractor = (res: any) => (res.data ? res.data[q.name] : undefined);
  const resp = await API.graphql<GraphQLQuery<Q>>({
    query: q.query,
    variables,
    authMode: configuredAuthMode,
  })
    .then(extractor)
    .catch((e) => {
      console.log(e);
      throw new Error(errorMsg);
    });
  return resp;
}

export const getPurchaseOrderAPI = async ({
  id,
}: GetPurchaseOrderQueryVariables): Promise<PurchaseOrder> => {
  const q: Query = { name: "getPurchaseOrder", query: getPurchaseOrder };
  const v = { id };
  return await getAPI<GetPurchaseOrderQuery, PurchaseOrder>(
    q,
    v,
    "Failed to fetch Purchase Order"
  );
};

export const getCustomerOrderAPI = async ({
  id,
}: GetCustomerOrderQueryVariables): Promise<CustomerOrder> => {
  const q: Query = { name: "getCustomerOrder", query: getCustomerOrder };
  const v = { id };
  return await getAPI<GetCustomerOrderQuery, CustomerOrder>(
    q,
    v,
    "Failed to fetch Customer Order"
  );
};

export const getInventoryValueAPI = async ({
  createdAt,
}: GetInventoryValueCacheQueryVariables) => {
  const q: Query = {
    name: "getInventoryValueCache",
    query: getInventoryValueCache,
  };
  const v = { createdAt };
  return await getAPI<GetInventoryValueCacheQuery, InventoryValueCache>(
    q,
    v,
    "Failed to fetch inventory value report"
  ).then((cache) => {
    if (!cache) throw new Error("Inventory value report was not found.");
    return cache;
  });
};

export const getCacheExpirationAPI = async () => {
  const q: Query = {
    name: "getCacheExpiration",
    query: getCacheExpiration,
  };
  const v = { id: CACHE_EXPIRATION_ID };
  return await getAPI<GetCacheExpirationQuery, CacheExpiration>(
    q,
    v,
    "Failed to get inventory value report expiration"
  )
  .then((cacheExpiration) => {
    if (!cacheExpiration)
      throw Error("Inventory value report expiration data not found");
    return cacheExpiration;
  });
};

export const getOrderMinInfoAPI = async (
  orderId: string, 
  orderType: EntityType
): Promise<OrderMinInfo> => {
  const q: Query = orderType === EntityType.PurchaseOrder ? 
    { name: "getPurchaseOrder", query: getPurchaseOrderMin } : 
    { name: "getCustomerOrder", query: getCustomerOrderMin }
  const v = { id: orderId };
  return await getAPI<OrderMinInfoQuery, OrderMinInfo>(
    q,
    v,
    "Failed to fetch Order"
  );
}