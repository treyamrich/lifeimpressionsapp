import { InventoryValueCache, LastItemValue, TShirtOrder } from "@/API";

import {
  datetimeInPlaceSort,
  toReadableDateTime,
} from "@/utils/datetimeConversions";
import { Order } from "./page";
import { CSVHeader, downloadCSV, processCSVCell } from "@/utils/csvGeneration";
import { OrderTotal } from "@/utils/orderTotal";

export const downloadHighLevelReport = (
  orders: Order[],
  orderIdToTotal: Map<string, OrderTotal>,
  todaysDate: string,
  showOrderDeletedColumn: boolean
) => {
  let csvData: any[] = orders;
  const enhancedOrders = csvData.map((order) => {
    const { total, shipping, tax, fees, subtotal } = orderIdToTotal.get(
      order.id
    )!;
    order.total = total;
    order.createdAt = toReadableDateTime(order.createdAt);
    order.updatedAt = toReadableDateTime(order.updatedAt);
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

    { columnKey: "taxRate", headerName: "Tax Rate" },
    { columnKey: "subtotal", headerName: "Sub Total" },

    { columnKey: "shipping", headerName: "Shipping" },
    { columnKey: "fees", headerName: "Fees" },
    { columnKey: "tax", headerName: "Tax" },
    { columnKey: "total", headerName: "Total" },
  ];

  if (!showOrderDeletedColumn) {
    headers = headers.filter((header) => header.columnKey !== "isDeleted");
  }

  const csvName = `LIH-HighLevelReport-${todaysDate}.csv`;
  downloadCSV(csvName, headers, enhancedOrders);
};

export const downloadDetailedReport = (
  orders: Order[],
  todaysDate: string,
  showOrderDeletedColumn: boolean
) => {
  const enhancedOrderItems = orders.flatMap((order: Order) => {
    const orderCreatedAt = toReadableDateTime(order.createdAt);
    const isCO = order.__typename === "CustomerOrder";

    return order.orderedItems.flatMap((orderItem: TShirtOrder) => {
      const transactionGroupId = isCO
        ? ""
        : `${order.id}@${orderItem.tShirtOrderTshirtId}`;

      const get_enhanced_order_item = (
        amountReceived: string,
        orderedQty: string,
        transact_date: string
      ) => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderIsDeleted: order.isDeleted,
        __typename: order.__typename,
        orderDatePlaced: orderCreatedAt,
        transactionGroupId,

        sortKey: transact_date, // ONLY USED FOR SORTING

        orderItemTransactionDate: toReadableDateTime(transact_date),
        tshirtStyleNumber: orderItem.tshirt.styleNumber,
        tshirtColor: orderItem.tshirt.color,
        tshirtSize: orderItem.tshirt.size,

        amountReceived: amountReceived,
        orderedQuantity: orderedQty,
        costPerUnit: orderItem.costPerUnit,
      });

      const originalOrderItemQty = orderItem.quantity.toString();
      if (isCO)
        return [
          get_enhanced_order_item(
            "N/A",
            originalOrderItemQty,
            orderItem.updatedAt
          ),
        ];

      const receivals = orderItem.receivals ?? [];
      return [
        get_enhanced_order_item("0", originalOrderItemQty, orderItem.updatedAt),
        ...receivals.map((recv) =>
          get_enhanced_order_item(recv.quantity.toString(), "0", recv.timestamp)
        ),
      ];
    });
  });

  // Sort the transactions by updated at
  datetimeInPlaceSort(enhancedOrderItems, (x: any) => x.sortKey);

  let headers: CSVHeader[] = [
    { columnKey: "orderId", headerName: "Order ID" },
    { columnKey: "orderNumber", headerName: "Order #" },
    { columnKey: "__typename", headerName: "Order Type" },
    { columnKey: "orderIsDeleted", headerName: "Order Deleted?" },
    { columnKey: "orderDatePlaced", headerName: "Order Date Placed" },

    { columnKey: "transactionGroupId", headerName: "Transaction Group ID" },

    {
      columnKey: "orderItemTransactionDate",
      headerName: "Order Item: Transaction Date",
    },
    { columnKey: "tshirtStyleNumber", headerName: "Style No." },
    { columnKey: "tshirtColor", headerName: "Color" },
    { columnKey: "tshirtSize", headerName: "Size" },
    { columnKey: "orderedQuantity", headerName: "Qty" },
    { columnKey: "amountReceived", headerName: "Amt. Received" },
    { columnKey: "costPerUnit", headerName: "Cost Per Unit ($/unit)" },
  ];

  if (!showOrderDeletedColumn) {
    headers = headers.filter((header) => header.columnKey !== "orderIsDeleted");
  }

  const titleHeader = [
    `Report generated on ${todaysDate}`,
    "",
    "Info: An Order Item aka Order Transaction consists of cost/unit, qty, and item SKU",
    "",
    `Info: Transactions are sorted by the "Order Item: Transaction Date" column`,
    "",
    'Info: The column "Transaction Group ID" assumes the form <Order_ID>@<Item_ID>',
    "The transaction group id is used to group modifications to an order which have spanned over multiple months.",
    "For example, if a PO was placed in March but was marked as received in April.",
    "New items were available for sale in April, but are a part of the same transaction.",
    "Thus in the inventory value report, the value is calculated based on items available during the month.",
  ]
    .map(processCSVCell)
    .join(",\n");

  const csvName = `LIH-DetailedReport-${todaysDate}.csv`;
  downloadCSV(csvName, headers, enhancedOrderItems, titleHeader);
};

export const downloadInventoryValueCSV = (
  inventoryValue: InventoryValueCache
) => {
  const { createdAt, updatedAt, lastItemValues } = inventoryValue;

  let rows = lastItemValues.map((itemValue: LastItemValue) => ({
    ...itemValue,
    earliestUnsold: toReadableDateTime(itemValue.earliestUnsold),
  }));

  let headers: CSVHeader[] = [
    { columnKey: "itemId", headerName: "Item ID" },

    { columnKey: "tshirtStyleNumber", headerName: "Style No." },
    { columnKey: "tshirtColor", headerName: "Color" },
    { columnKey: "tshirtSize", headerName: "Size" },

    { columnKey: "aggregateValue", headerName: "Total Value" },
    { columnKey: "earliestUnsold", headerName: "Earliest Unsold Item Date" },
    { columnKey: "numUnsold", headerName: "# Unsold" },
    {
      columnKey: "inventoryQty",
      headerName: "Inventory Qty. as of Report Generation Date",
    },
  ];

  const reportDate = createdAt.split("-");
  const month = reportDate[1];
  const year = reportDate[0];
  const formattedDate = `${month}/${year}`;

  const titleHeader = [
    `Report for ${formattedDate}`,
    `Report generated on ${toReadableDateTime(updatedAt)}`,
    "",
    "Warning: the item value is calculated based on items marked as received in purchase orders",
    'If you would like the calculation to be done based on the "Quantity Ordered" in a purchase order,',
    'you may opt to use the "Quantity Ordered" from the earliest entry in the transaction group.',
    'The earliest entry in a Transaction Group will have the oldest "Order Date Placed" date',
    'For more info on Transaction Groups, read the header of the "Detailed Report".',
    "",
    `Warning: inventory quantity is shown as of the report generation date NOT report date.`,
    "",
    'Info: "# Unsold" is expected to be equal to the inventory quantity when the report generation date was this past month',
    "",
    'Info: "Total Value" column will have values = 0 even if the "No. of Unsold" was negative ie. inventory was oversold.',
    "It's not possible to get the cost/unit of the over sold item; however, those customer orders will consume from the next arrived purchase order",
  ]
    .map(processCSVCell)
    .join(",\n");

  const csvName = `LIH-Inventory-Value-Report-${formattedDate}.csv`;
  downloadCSV(csvName, headers, rows, titleHeader);
};
