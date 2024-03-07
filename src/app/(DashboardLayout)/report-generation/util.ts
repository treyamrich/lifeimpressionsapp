import {
  CustomerOrder,
  InventoryValueCache,
  LastItemValue,
  ModelCustomerOrderFilterInput,
  ModelPurchaseOrderFilterInput,
  ModelSortDirection,
  PurchaseOrder,
  TShirtOrder,
} from "@/API";
import { AsyncBatchItem, DBOperation } from "@/contexts/DBErrorContext";
import {
  ListAPIResponse,
  listCustomerOrderAPI,
  listPurchaseOrderAPI,
} from "@/graphql-helpers/fetch-apis";
import { toReadableDateTime } from "@/utils/datetimeConversions";
import { FormState } from "./GenerateReportForm";
import { Order } from "./page";
import { CSVHeader, downloadCSV, processCSVCell } from "@/utils/csvGeneration";
import { OrderTotal } from "@/utils/orderTotal";
import dayjs from "dayjs";

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

export const handleOrderReportRequest = async (
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

  return Promise.resolve(filteredOrders);
};

export const downloadHighLevelReport = (
  orders: Order[],
  orderIdToTotal: Map<string, OrderTotal>,
  todaysDate: string,
  showOrderDeletedColumn: boolean
) => {
  let csvData: any[] = orders;
  const enhancedOrders = csvData.map((order) => {
    const {
      total,
      shipping,
      tax,
      fees,
      itemDiscounts,
      totalDiscounts,
      subtotal,
    } = orderIdToTotal.get(order.id)!;
    order.total = total;
    order.createdAt = toReadableDateTime(order.createdAt);
    order.updatedAt = toReadableDateTime(order.updatedAt);
    order.totalDiscounts = totalDiscounts;
    order.itemDiscounts = itemDiscounts;
    order.tax = tax;
    order.shipping = shipping;
    order.fees = fees;
    order.subtotal = subtotal;
    return order;
  });

  let headers: CSVHeader[] = [
    { columnKey: "id", headerName: "Order ID" },
    { columnKey: "__typename", headerName: "Order Type" },

    { columnKey: "orderNumber", headerName: "Order #" },
    { columnKey: "isDeleted", headerName: "Order Deleted" },
    { columnKey: "createdAt", headerName: "Order Date" },
    { columnKey: "updatedAt", headerName: "Last Modified" },

    { columnKey: "itemDiscounts", headerName: "Item Discounts" },
    { columnKey: "discount", headerName: "Full Order Discounts" },
    { columnKey: "totalDiscounts", headerName: "Total Discounts" },

    { columnKey: "taxRate", headerName: "Tax Rate" },
    { columnKey: "subtotal", headerName: "Sub Total" },

    { columnKey: "shipping", headerName: "Shipping" },
    { columnKey: "fees", headerName: "Fees" },
    { columnKey: "tax", headerName: "Tax" },
    { columnKey: "total", headerName: "Total" },
  ];

  if(!showOrderDeletedColumn) {
    headers = headers.filter(header => header.columnKey !== "isDeleted");
  }

  const csvName = `LIH-HighLevelReport-${todaysDate}.csv`;
  downloadCSV(csvName, headers, enhancedOrders);
};

export const downloadDetailedReport = (
  orders: Order[],
  todaysDate: string,
  showOrderDeletedColumn: boolean
) => {
  let csvData: any[] = orders;
  const enhancedOrderItems = csvData.flatMap((order) => {
    const orderCreatedAt = toReadableDateTime(order.createdAt);
    // const updatedAt = toReadableDateTime(order.updatedAt);
    return order.orderedItems.map((orderItem: TShirtOrder) => {
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderIsDeleted: order.isDeleted,
        __typename: order.__typename,
        createdAt: orderCreatedAt,
        transactionGroupId: `${order.id}@${orderItem.tShirtOrderTshirtId}`,

        sortKey: orderItem.updatedAt, // ONLY USED FOR SORTING

        updatedAt: toReadableDateTime(orderItem.updatedAt),
        tshirtStyleNumber: orderItem.tshirt.styleNumber,
        tshirtColor: orderItem.tshirt.color,
        tshirtSize: orderItem.tshirt.size,

        orderedQuantity: orderItem.quantity,
        costPerUnit: orderItem.costPerUnit,
        itemDiscounts: orderItem.discount,
      };
    });
  });

  // Sort the order items by updated at
  enhancedOrderItems.sort((a, b) => {
    let l = dayjs(a.sortKey);
    let r = dayjs(b.sortKey);
    if (l.isBefore(r)) return -1;
    if (l.isAfter(r)) return 1;
    return 0;
  });

  let headers: CSVHeader[] = [
    { columnKey: "orderId", headerName: "Order ID" },
    { columnKey: "orderNumber", headerName: "Order #" },
    { columnKey: "__typename", headerName: "Order Type" },
    { columnKey: "orderIsDeleted", headerName: "Order Deleted?"},
    { columnKey: "createdAt", headerName: "Order Date Placed" },

    { columnKey: "transactionGroupId", headerName: "Transaction Group ID"},

    { columnKey: "updatedAt", headerName: "Order Item: Last Modified" },
    { columnKey: "tshirtStyleNumber", headerName: "Style No." },
    { columnKey: "tshirtColor", headerName: "Color" },
    { columnKey: "tshirtSize", headerName: "Size" },
    { columnKey: "orderedQuantity", headerName: "Qty" },
    { columnKey: "costPerUnit", headerName: "Cost Per Unit ($/unit)" },
    { columnKey: "itemDiscounts", headerName: "Item Discounts" },
  ];

  if(!showOrderDeletedColumn) {
    headers = headers.filter(header => header.columnKey !== "orderIsDeleted");
  }

  const csvName = `LIH-DetailedReport-${todaysDate}.csv`;
  downloadCSV(csvName, headers, enhancedOrderItems);
};

export const downloadInventoryValueCSV = (inventoryValue: InventoryValueCache) => {
  const { createdAt, updatedAt, lastItemValues } = inventoryValue;

  let rows = lastItemValues.map((itemValue: LastItemValue) => 
    ({...itemValue, earliestUnsold: toReadableDateTime(itemValue.earliestUnsold)}));

  let headers: CSVHeader[] = [
    { columnKey: "itemId", headerName: "Item ID" },

    { columnKey: "tshirtStyleNumber", headerName: "Style No." },
    { columnKey: "tshirtColor", headerName: "Color" },
    { columnKey: "tshirtSize", headerName: "Size" },

    { columnKey: "aggregateValue", headerName: "Total Value" },
    { columnKey: "earliestUnsold", headerName: "Earliest Unsold Item Date" },
    { columnKey: "numUnsold", headerName: "# Unsold" },
    { columnKey: "inventoryQty", headerName: "Inventory Qty. as of Report Generation Date"}
  ];

  const reportDate = createdAt.split('-');
  const month = reportDate[1];
  const year = reportDate[0];
  const formattedDate = `${month}/${year}`;

  const titleHeader = [
    `Report for ${formattedDate}`,
    `Report generated on ${toReadableDateTime(updatedAt)}`,
    `Warning: Inventory Qty is shown as of the report generation date NOT report date.`,
    'Info: "# Unsold" is expected to be equal to the inventory quantity when the report generation date was this past month',
    'Info: "Total Value" column will have values = 0 even if the "No. of Unsold" was negative ie. inventory was oversold.',
    'It\'s not possible to get the cost/unit of the over sold item; however, those customer orders will consume from the next arrived purchase order',
  ].map(processCSVCell).join(',\n');

  const csvName = `LIH-Inventory-Value-Report-${formattedDate}.csv`;
  downloadCSV(csvName, headers, rows, titleHeader);
}