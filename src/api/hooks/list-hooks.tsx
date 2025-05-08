import {
  CustomerOrder,
  ModelCustomerOrderFilterInput,
  ModelPurchaseOrderFilterInput,
  OrderChange,
  PurchaseOrder,
  TShirt,
} from "@/API";
import { listOrderChangesHistoryAPI } from "@/api/list-apis";
import { Page } from "@/api/types";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { ListAPIInput } from "@/graphql-helpers/types";
import {
  listCustomerOrderAPI,
  listPurchaseOrderAPI,
  listTShirtAPI,
} from "@/graphql-helpers/list-apis";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { LRUCache } from "./lru-cache";

export const listTShirtBaseQueryKey = "listTShirts";
export const listPurchaseOrdersBaseQueryKey = "listPurchaseOrders";
export const listCustomerOrdersBaseQueryKey = "listCustomerOrders";
export const listOrderChangeHistoryBaseQueryKey = "listOrderChangeHistory";

const FIVE_MINUTES = 300000;

export const useListOrderChangeHistory = ({
  orderId,
  orderType,
  limit,
}: {
  orderId: string;
  orderType?: EntityType;
  limit: number;
}) =>
  useInfiniteQuery<Page<OrderChange>>({
    queryKey: [listOrderChangeHistoryBaseQueryKey, orderId, orderType],
    queryFn: ({ pageParam }) =>
      listOrderChangesHistoryAPI({
        nextToken: pageParam,
        orderId,
        orderType: orderType!,
        limit,
      }),
    getNextPageParam: (lastPage) => lastPage.nextToken,
    initialPageParam: null,
    retry: (failureCount, error) => {
      if (error.stack?.includes("status code 400")) return false;
      return failureCount < 3;
    },
  });

export const useListPurchaseOrder = (
  input: ListAPIInput<ModelPurchaseOrderFilterInput>
) => {
  return useInfiniteQuery<Page<PurchaseOrder>>({
    // Query stays the same for listing POs
    queryKey: [
      listPurchaseOrdersBaseQueryKey,
      input.createdAt, // sort key
      input.sortDirection,
    ].filter((x) => x !== undefined),
    queryFn: ({ pageParam }) => {
      input.nextToken = pageParam as string | undefined | null;
      return listPurchaseOrderAPI(input);
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextToken,
  });
};

export const useListCustomerOrder = (
  input: ListAPIInput<ModelCustomerOrderFilterInput>,
  customerNameFilter: string,
  lruCache: LRUCache<string>
) => {
  // Make sure LRU cache only stores query results for the non-nil filter
  // This allows the unfiltered result to stay in the Tanstack Query cache
  if (customerNameFilter) {
    lruCache.add(customerNameFilter);
  }

  const deletedFilter = { isDeleted: { ne: true } };

  const fetchCustomerOrdersNoFilterFn = (
    nextToken: string | null | undefined
  ) =>
    listCustomerOrderAPI({
      filters: deletedFilter,
      nextToken: nextToken,
      sortDirection: input.sortDirection,
      doCompletePagination: input.doCompletePagination,
      limit: input.limit,
    });

  const fetchCustomerOrdersByCustomerNameFn = (
    nextToken: string | null | undefined
  ) =>
    listCustomerOrderAPI(
      {
        filters: deletedFilter,
        doCompletePagination: input.doCompletePagination,
        nextToken: nextToken,
        limit: input.limit,
        indexPartitionKey: customerNameFilter,
      },
      "byCustomerName"
    );

  const queryFn = useMemo(
    () =>
      customerNameFilter
        ? fetchCustomerOrdersByCustomerNameFn
        : fetchCustomerOrdersNoFilterFn,
    [customerNameFilter]
  );

  return useInfiniteQuery<Page<CustomerOrder>>({
    queryKey: [
      listCustomerOrdersBaseQueryKey,
      input.createdAt, // sort key
      customerNameFilter,
      input.sortDirection,
    ].filter((x) => x !== undefined),
    queryFn: ({ pageParam }) => queryFn(pageParam as string | null),
    getNextPageParam: (lastPage) => lastPage.nextToken,
    initialPageParam: null,
    // For the case where the user is changing the filter often
    staleTime: FIVE_MINUTES,
  });
};

export const useListTShirt = (
  styleNoFilter: string,
  lruCache: LRUCache<string>,
  pageSize: number
) => {
  // Make sure LRU cache only stores query results for the non-nil filter
  // This allows the unfiltered result to stay in the Tanstack Query cache
  if (styleNoFilter) {
    lruCache.add(styleNoFilter);
  }

  const deletedFilter = { isDeleted: { ne: true } };

  const fetchTShirtsNoFilterAPI = (nextToken: string | null | undefined) => {
    return listTShirtAPI({
      filters: deletedFilter,
      nextToken: nextToken,
      limit: pageSize,
    });
  };

  const fetchTShirtsByStyleNumberAPI = (
    nextToken: string | null | undefined
  ) => {
    return listTShirtAPI(
      {
        filters: deletedFilter,
        nextToken: nextToken,
        indexPartitionKey: styleNoFilter,
        limit: pageSize,
      },
      "byStyleNumber"
    );
  };

  const queryFn = useMemo(() => {
    return styleNoFilter
      ? fetchTShirtsByStyleNumberAPI
      : fetchTShirtsNoFilterAPI;
  }, [styleNoFilter]);

  return useInfiniteQuery<Page<TShirt>>({
    queryKey: [listTShirtBaseQueryKey, styleNoFilter],
    queryFn: ({ pageParam }) => queryFn(pageParam as string | null),
    getNextPageParam: (lastPage) => lastPage.nextToken,
    initialPageParam: null,
    // For the case where the user is changing the filter often
    staleTime: FIVE_MINUTES,
  });
};
