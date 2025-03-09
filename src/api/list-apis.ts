import { OrderChange } from "@/API";
import { ListAPIResponse, Page, SortDirection } from "./types";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { apiClient } from "./api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

const parseListApiResponse = <T>(response: AxiosResponse<ListAPIResponse<T>>): Page<T> => {
  return {
    items: response.data.data.items, 
    nextToken: response.data.data.nextToken,
  }
}

const listOrderChangesHistory = async ({
  nextToken = null,
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: EntityType;
  nextToken: string | null | unknown;
}): Promise<Page<OrderChange>> => {
  let params: any = {};
  if (orderType === EntityType.PurchaseOrder) {
    params.type = "PO";
  } else if (orderType === EntityType.CustomerOrder) {
    params.type = "CO";
  }
  const resp = await apiClient.get<ListAPIResponse<OrderChange>>(`/order/${orderId}/history`, {
    params: {
      ...params,
      limit: 10,
      nextToken: nextToken,
      sort: SortDirection.DESC,
    },
  }).then(parseListApiResponse);
  return resp;
};

export const useListOrderChangeHistory = ({
  orderId,
  orderType,
}: {
  orderId: string;
  orderType?: EntityType;
}) =>
  useInfiniteQuery<Page<OrderChange>>({
    queryKey: ["orderChangeHistory", orderId, orderType],
    queryFn: ({ pageParam }) =>
      listOrderChangesHistory({
        nextToken: pageParam,
        orderId,
        orderType: orderType!,
      }),
    getNextPageParam: (lastPage) => lastPage.nextToken,
    initialPageParam: null,
    retry: (failureCount, error) => {
      if (error.stack?.includes("status code 400")) return false;
      return failureCount < 3;
    },
  });
