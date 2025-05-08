import {
  CustomerOrder,
  ModelCustomerOrderFilterInput,
  ModelPurchaseOrderFilterInput,
  ModelSortDirection,
  ModelTShirtOrderFilterInput,
  PurchaseOrder,
  TShirtOrder,
} from "@/API";
import { AsyncBatchItem, DBOperation } from "@/contexts/DBErrorContext";
import {
  listCustomerOrderAPI,
  listPurchaseOrderAPI,
  listTShirtOrdersAPI,
} from "@/graphql-helpers/list-apis";
import { datetimeInPlaceSort } from "@/utils/datetimeConversions";
import { FormState } from "./GenerateReportForm";
import { DetailedReportOrder, Order } from "./types";
import { getOrderMinInfoAPI } from "@/graphql-helpers/get-apis";
import { EntityType } from "../components/po-customer-order-shared-components/CreateOrderPage";
import { OrderMinInfo } from "@/my-graphql-queries/types";
import { Page } from "@/api/types";

export type RequestFilters = {
  poFilter: ModelPurchaseOrderFilterInput;
  coFilter: ModelCustomerOrderFilterInput;
};

const getDateRangeFilter = (form: FormState) => {
    const { dateEnd, dateStart } = form;
    const start = dateStart.startOf("day").toISOString();
    const end = dateEnd.endOf("day").toISOString();
    return { between: [start, end] };
}

const getOrderRequestFilters = (form: FormState) => {
  const { includeDeletedCOs, includeDeletedPOs } = form;
  const excludeDeletedFilter = { isDeleted: { ne: true } };
  const createdAtRangeFilter = getDateRangeFilter(form);

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

const getTShirtOrderRequestFilter = (form: FormState) => {
    const updatedAtRangeFilter = getDateRangeFilter(form);
    let filter: ModelTShirtOrderFilterInput = { updatedAt: updatedAtRangeFilter };
    filter.or = [];

    if (form.includeCOs) {
      const f: ModelTShirtOrderFilterInput = { customerOrderOrderedItemsId: { attributeExists: true } };
      if (!form.includeDeletedCOs) {
        f.isDeleted = { ne: true };
      }
      filter.or.push(f);
    }
    if (form.includePOs) {
      const f: ModelTShirtOrderFilterInput = { purchaseOrderOrderedItemsId: { attributeExists: true } };
      if (!form.includeDeletedPOs) {
        f.isDeleted = { ne: true };
      }
      filter.or.push(f);
    }

    if (!form.includeCOs && !form.includePOs) {
      filter.or = undefined;
    }
    return filter
}

export const handleHighLevelReportRequest = async (
  form: FormState,
  rescueDBOperationBatch: <T>(
    batchItems: AsyncBatchItem<T>[],
    customMasterErrMsg?: string
  ) => Promise<void>
): Promise<Order[]> => {
  const { includeCOs, includePOs } = form;
  let resPO: any[] = [];
  let resCO: any[] = [];

  const { coFilter, poFilter, createdAtRangeFilter } =
    getOrderRequestFilters(form);

  const batchItems: AsyncBatchItem<any>[] = [];
  let hadError = false;

  if (includePOs) {
    let item: AsyncBatchItem<Page<PurchaseOrder>> = {
      requestFn: () =>
        listPurchaseOrderAPI({
          doCompletePagination: true,
          filters: poFilter,
          sortDirection: ModelSortDirection.ASC,
          createdAt: createdAtRangeFilter,
        }),
      dbOperation: DBOperation.LIST,
      successHandler: (resp: Page<PurchaseOrder>) => {
        resPO = resPO.concat(resp.items);
      },
      errorHandler: (e) => {
        hadError = true;
      },
    };
    batchItems.push(item);
  }
  if (includeCOs) {
    let item: AsyncBatchItem<Page<CustomerOrder>> = {
      requestFn: () =>
        listCustomerOrderAPI({
          doCompletePagination: true,
          filters: coFilter,
          sortDirection: ModelSortDirection.ASC,
          createdAt: createdAtRangeFilter,
        }),
      dbOperation: DBOperation.LIST,
      successHandler: (resp: Page<CustomerOrder>) => {
        resCO = resCO.concat(resp.items);
      },
      errorHandler: (e) => {
        hadError = true;
      },
    };
    batchItems.push(item);
  }

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

  datetimeInPlaceSort(filteredOrders, (x: Order) => x.updatedAt);
  return filteredOrders;
};

export const handleDetailedReportRequest = async (
    form: FormState,
    rescueDBOperationBatch: <T>(
        batchItems: AsyncBatchItem<T>[],
        customMasterErrMsg?: string
      ) => Promise<void>
  ): Promise<DetailedReportOrder[]> => {
    const filter = getTShirtOrderRequestFilter(form);

    let tshirtOrders: TShirtOrder[] = [];
    await rescueDBOperationBatch([
        {
            requestFn: () =>
                listTShirtOrdersAPI({
                    doCompletePagination: true,
                    filters: filter,
              }),
            dbOperation: DBOperation.LIST,
            successHandler: (resp: Page<TShirtOrder>) => {
                tshirtOrders = resp.items;
            }
        }
    ],
    "Failed to get order items");

    const ordersMap: { [id: string]: {
        orderType: EntityType,
        order?: DetailedReportOrder,
        orderedItems: TShirtOrder[]
    } } = {};
    let transactionsWithNoOrder: TShirtOrder[] = [];
    const notExists = (s: string | null | undefined) => s === null || s === undefined;

    tshirtOrders.forEach(to => {
        const coID = to.customerOrderOrderedItemsId;
        const poID = to.purchaseOrderOrderedItemsId;
        let orderType = coID ? 
            EntityType.CustomerOrder : 
            EntityType.PurchaseOrder;
        
        if (notExists(coID) && notExists(poID)) {
            transactionsWithNoOrder.push(to)
            return;
        }
        
        const orderId = coID ? coID! : poID!;
        if (ordersMap[orderId]) {
            ordersMap[orderId].orderedItems.push(to);
        } else {
            ordersMap[orderId] = { orderType, orderedItems: [to]};
        }
    })
    
    // Get orders for transactions with orders
    let batchItems: AsyncBatchItem<OrderMinInfo>[] = Object.keys(ordersMap).map(id => ({
        requestFn: () => getOrderMinInfoAPI(id, ordersMap[id].orderType),
        dbOperation: DBOperation.GET,
        successHandler: (resp: OrderMinInfo) => {
            ordersMap[id].order = {
                ...resp,
                orderedItems: ordersMap[id].orderedItems
            }
        }
    }));

    await rescueDBOperationBatch(batchItems)
    const collectedOrders = Object.keys(ordersMap).map(id => ordersMap[id].order!);

    // Create dummy orders for transactions without orders
    const dummyOrders: DetailedReportOrder[] = transactionsWithNoOrder.map(to => ({
        __typename: 'Adjustment',
        id: to.id,
        isDeleted: to.isDeleted,
        orderNumber: 'N/A',
        createdAt: to.createdAt,
        updatedAt: to.updatedAt, // Should be same as createdAt
        orderedItems: [to],

    }))
    
    return [...collectedOrders, ...dummyOrders]; 
  }