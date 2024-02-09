import { CustomerOrder, ModelCustomerOrderFilterInput, ModelPurchaseOrderFilterInput, ModelSortDirection, PurchaseOrder, TShirtOrder } from "@/API";
import { AsyncBatchItem, DBOperation } from "@/contexts/DBErrorContext";
import { ListAPIResponse, listCustomerOrderAPI, listPurchaseOrderAPI } from "@/graphql-helpers/fetch-apis";
import { toReadableDateTime } from "@/utils/datetimeConversions";
import { FormState } from "./GenerateReportForm";
import { Order } from "./page";
import { CSVHeader, downloadCSV } from "@/utils/csvGeneration";
import { OrderTotal } from "@/utils/orderTotal";
import dayjs from "dayjs";

export type RequestFilters = {
    poFilter: ModelPurchaseOrderFilterInput;
    coFilter: ModelCustomerOrderFilterInput;
};

export const getOrderRequestFilters = (form: FormState) => {
    const { dateEnd, dateStart, includeDeletedCOs, includeDeletedPOs } = form;
    const excludeDeletedFilter = { isDeleted: { ne: true } };
    const createdAtRangeFilter = { between: [dateStart.startOf('day').toISOString(), dateEnd.endOf('day').toISOString()]};
    let poFilter = undefined;
    let coFilter = undefined;
    if (!includeDeletedPOs) {
        poFilter = excludeDeletedFilter
    }
    if (!includeDeletedCOs) {
        coFilter = excludeDeletedFilter
    }
    return { poFilter, coFilter, createdAtRangeFilter }
}

export const handleReportRequest = async (
    form: FormState,
    rescueDBOperationBatch: <T>(batchItems: AsyncBatchItem<T>[], customMasterErrMsg?: string) => void
): Promise<Order[]> => {
    const { includeCOs, includePOs } = form;
    let resPO: any[] = [];
    let resCO: any[] = []

    const { coFilter, poFilter, createdAtRangeFilter } = getOrderRequestFilters(form);

    const batchItems: AsyncBatchItem<any>[] = [];
    let hadError = false;

    if (includePOs) {
        let item: AsyncBatchItem<ListAPIResponse<PurchaseOrder>> = {
            requestFn: () => listPurchaseOrderAPI({
                doCompletePagination: true,
                filters: poFilter,
                sortDirection: ModelSortDirection.ASC,
                createdAt: createdAtRangeFilter
            }),
            dbOperation: DBOperation.LIST,
            successHandler: (resp: ListAPIResponse<PurchaseOrder>) => {
                resPO = resPO.concat(resp.result);
            },
            errorHandler: e => {
                hadError = true
            }
        }
        batchItems.push(item);
    }
    if (includeCOs) {
        let item: AsyncBatchItem<ListAPIResponse<CustomerOrder>> = {
            requestFn: () => listCustomerOrderAPI({
                doCompletePagination: true,
                filters: coFilter,
                sortDirection: ModelSortDirection.ASC,
                createdAt: createdAtRangeFilter
            }),
            dbOperation: DBOperation.LIST,
            successHandler: (resp: ListAPIResponse<CustomerOrder>) => {
                resCO = resCO.concat(resp.result);
            },
            errorHandler: e => {
                hadError = true
            }
        }
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
        let cleanedItems = orderedItems.filter(item => item !== null) as TShirtOrder[];
        return { ...order, orderedItems: cleanedItems }
    });

    // Apply additional filters; some filters can't be done via query.
    let filteredOrders = newOrders
    if(!form.includeZeroQtyOrders) {
        filteredOrders = filteredOrders.filter((order: Order) => order.orderedItems.length > 0) 
    }

    if(!form.includeZeroQtyOrderItems) {
        filteredOrders.forEach((order: Order) => {
            order.orderedItems = order.orderedItems
                .filter((item: TShirtOrder) => item.quantity > 0);
        })
    }

    return Promise.resolve(filteredOrders);
}

export const downloadHighLevelReport = (orders: Order[], orderIdToTotal: Map<string, OrderTotal>, todaysDate: string) => {
    let csvData: any[] = orders;
    const enhancedOrders = csvData.map(order => {
        const { total, shipping, tax, fees, itemDiscounts, totalDiscounts, subtotal } = orderIdToTotal.get(order.id)!;
        order.total = total;
        order.createdAt = toReadableDateTime(order.createdAt);
        order.updatedAt = toReadableDateTime(order.updatedAt);
        order.totalDiscounts = totalDiscounts;
        order.itemDiscounts = itemDiscounts;
        order.tax = tax;
        order.shipping = shipping;
        order.fees = fees;
        order.subtotal = subtotal;
        return order
    });


    const headers: CSVHeader[] = [
        { columnKey: "id", headerName: "Order ID" },
        { columnKey: "__typename", headerName: "Order Type" },
        
        { columnKey: "orderNumber", headerName: "Order #" },
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
        { columnKey: "total", headerName: "Total" }
    ];

    const csvName = `LIH-HighLevelReport-${todaysDate}.csv`;
    downloadCSV(csvName, headers, enhancedOrders);
}

export const downloadDetailedReport = (orders: Order[], todaysDate: string) => {
    let csvData: any[] = orders;
    const enhancedOrderItems = csvData.flatMap(order => {
        const orderCreatedAt = toReadableDateTime(order.createdAt);
        // const updatedAt = toReadableDateTime(order.updatedAt);
        return order.orderedItems.map((orderItem: TShirtOrder) => {
            return {
                orderId: order.id,
                orderNumber: order.orderNumber,
                __typename: order.__typename,
                createdAt: orderCreatedAt,

                sortKey: orderItem.updatedAt, // ONLY USED FOR SORTING

                updatedAt: toReadableDateTime(orderItem.updatedAt),
                tshirtStyleNumber: orderItem.tshirt.styleNumber,
                tshirtColor: orderItem.tshirt.color,
                tshirtSize: orderItem.tshirt.size,
                
                orderedQuantity: orderItem.quantity,
                costPerUnit: orderItem.costPerUnit,
                itemDiscounts: orderItem.discount,
            }
        })
    });

    // Sort the order items by updated at
    enhancedOrderItems.sort((a, b) => {
        let l = dayjs(a.sortKey)
        let r = dayjs(b.sortKey)
        if(l.isBefore(r)) return -1;
        if(l.isAfter(r)) return 1;
        return 0;
    })


    const headers: CSVHeader[] = [
        { columnKey: "orderId", headerName: "Order ID" },
        { columnKey: "orderNumber", headerName: "Order #" },
        { columnKey: "__typename", headerName: "Order Type" },
        { columnKey: "createdAt", headerName: "Order Date Placed" },
        
        { columnKey: "updatedAt", headerName: "Order Item: Last Modified" },
        { columnKey: "tshirtStyleNumber", headerName: "Style No."},
        { columnKey: "tshirtColor", headerName: "Color"},
        { columnKey: "tshirtSize", headerName: "Size"},
        { columnKey: "orderedQuantity", headerName: "Qty"},
        { columnKey: "costPerUnit", headerName: "Cost Per Unit ($/unit)"},
        { columnKey: "itemDiscounts", headerName: "Item Discounts" },
    ];
    const csvName = `LIH-DetailedReport-${todaysDate}.csv`;
    downloadCSV(csvName, headers, enhancedOrderItems);
}