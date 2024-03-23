import {
  CustomerOrder,
  ModelCustomerOrderFilterInput,
  ModelPurchaseOrderFilterInput,
  ModelSortDirection,
  PurchaseOrder,
  TShirtOrder,
} from "@/API";
import { AsyncBatchItem, DBOperation } from "@/contexts/DBErrorContext";
import {
  listCustomerOrderAPI,
  listPurchaseOrderAPI,
} from "@/graphql-helpers/list-apis";
import { ListAPIResponse } from "@/graphql-helpers/types";
import { datetimeInPlaceSort } from "@/utils/datetimeConversions";
import { FormState } from "./GenerateReportForm";
import { Order } from "./page";

export type RequestFilters = {
  poFilter: ModelPurchaseOrderFilterInput;
  coFilter: ModelCustomerOrderFilterInput;
};

export const getOrderRequestFilters = (form: FormState) => {
  const { dateEnd, dateStart, includeDeletedCOs, includeDeletedPOs } = form;
  const excludeDeletedFilter = { isDeleted: { ne: true } };
  const start = dateStart.startOf("day").toISOString();
  const end = dateEnd.endOf("day").toISOString();
  const createdAtRangeFilter = { between: [start, end] };

  let poFilter = undefined;
  let coFilter = undefined;
  if (!includeDeletedPOs) {
    poFilter = excludeDeletedFilter;
  }
  if (!includeDeletedCOs) {
    coFilter = excludeDeletedFilter;
  }
  return { poFilter, coFilter, createdAtRangeFilter };
};

export const handleHighLevelReportRequest = async (
  form: FormState,
  rescueDBOperationBatch: <T>(
    batchItems: AsyncBatchItem<T>[],
    customMasterErrMsg?: string
  ) => void
): Promise<Order[]> => {
  const { includeCOs, includePOs } = form;
  let resPO: any[] = [];
  let resCO: any[] = [];

  const { coFilter, poFilter, createdAtRangeFilter } =
    getOrderRequestFilters(form);

  const batchItems: AsyncBatchItem<any>[] = [];
  let hadError = false;

  if (includePOs) {
    let item: AsyncBatchItem<ListAPIResponse<PurchaseOrder>> = {
      requestFn: () =>
        listPurchaseOrderAPI({
          doCompletePagination: true,
          filters: poFilter,
          sortDirection: ModelSortDirection.ASC,
          createdAt: createdAtRangeFilter,
        }),
      dbOperation: DBOperation.LIST,
      successHandler: (resp: ListAPIResponse<PurchaseOrder>) => {
        resPO = resPO.concat(resp.result);
      },
      errorHandler: (e) => {
        hadError = true;
      },
    };
    batchItems.push(item);
  }
  if (includeCOs) {
    let item: AsyncBatchItem<ListAPIResponse<CustomerOrder>> = {
      requestFn: () =>
        listCustomerOrderAPI({
          doCompletePagination: true,
          filters: coFilter,
          sortDirection: ModelSortDirection.ASC,
          createdAt: createdAtRangeFilter,
        }),
      dbOperation: DBOperation.LIST,
      successHandler: (resp: ListAPIResponse<CustomerOrder>) => {
        resCO = resCO.concat(resp.result);
      },
      errorHandler: (e) => {
        hadError = true;
      },
    };
    batchItems.push(item);
  }

  // This await is necessary
  await rescueDBOperationBatch(batchItems, "Failed to generate report.");

  if (hadError) {
    return [];
  }

  let res = resCO.concat(resPO);

  let newOrders: Order[] = res.map((order: CustomerOrder | PurchaseOrder) => {
    let orderedItems = order.orderedItems?.items ?? [];
    let cleanedItems = orderedItems.filter(
      (item) => item !== null
    ) as TShirtOrder[];
    return { ...order, orderedItems: cleanedItems };
  });

  // Apply additional filters; some filters can't be done via query.
  let filteredOrders = newOrders;
  if (!form.includeZeroQtyOrders) {
    filteredOrders = filteredOrders.filter(
      (order: Order) => order.orderedItems.length > 0
    );
  }

  const orders = await Promise.resolve(filteredOrders);
  datetimeInPlaceSort(orders, (x: Order) => x.updatedAt);
  return orders;
};
