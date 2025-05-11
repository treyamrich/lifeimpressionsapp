import { OrderChange } from "@/API";
import { ListAPIResponse, Page, SortDirection } from "./types";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { apiClient } from "./api";
import { AxiosResponse } from "axios";

const parseListApiResponse = <T>(
  response: AxiosResponse<ListAPIResponse<T>>
): Page<T> => {
  return {
    items: response.data.data.items,
    nextToken: response.data.data.nextToken,
  };
};

const PAGINATION_LIMIT = 100;
const SAFETY_LIMIT = 10;

export const fetchUntilLimitItemsReceived = async <T>({
  nextToken = null,
  queryFn,
  limit = PAGINATION_LIMIT,
}: {
  nextToken: string | null | undefined | unknown; 
  queryFn: (nextToken: string | null | undefined | unknown) => Promise<Page<T>>;
  limit?: number;
}): Promise<Page<T>> => {
  let done = false;
  let result: T[] = [];
  let lastToken = nextToken;
  let i = 0;
  while (!done) {
    const page = await queryFn(lastToken);
    lastToken = page.nextToken;
    result = result.concat(page.items);
    done = !page.nextToken || result.length >= limit;
    i++;
    if (i > SAFETY_LIMIT) {
      console.error("Exceeded safety limit fetching pages");
      break
    }
  }
  return {
    items: result,
    nextToken: lastToken,
  }
};

export const listOrderChangesHistoryAPI = async ({
  nextToken = null,
  limit,
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: EntityType;
  nextToken: string | null | unknown;
  limit: number;
}): Promise<Page<OrderChange>> => {
  let params: any = {};
  if (orderType === EntityType.PurchaseOrder) {
    params.type = "PO";
  } else if (orderType === EntityType.CustomerOrder) {
    params.type = "CO";
  }
  const f = (nextTok: string | null | undefined | unknown) => apiClient
    .get<ListAPIResponse<OrderChange>>(`/order/${orderId}/history`, {
      params: {
        ...params,
        limit: limit,
        nextToken: nextTok,
        sort: SortDirection.DESC,
      },
    })
    .then(parseListApiResponse);

  return fetchUntilLimitItemsReceived<OrderChange>({
    nextToken,
    queryFn: f,
    limit,
  });
};
