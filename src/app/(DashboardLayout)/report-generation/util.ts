import { CustomerOrder, ModelCustomerOrderFilterInput, ModelPurchaseOrderFilterInput, ModelSortDirection, PurchaseOrder, TShirtOrder } from "@/API";
import { AsyncBatchItem, DBOperation } from "@/contexts/DBErrorContext";
import { listCustomerOrderAPI, listPurchaseOrderAPI } from "@/graphql-helpers/fetch-apis";
import { toAWSDateTime, toReadableDateTime } from "@/utils/datetimeConversions";
import { FormState } from "./GenerateReportForm";
import { Order } from "./page";
import { CSVHeader, generateCSV } from "@/utils/csvGeneration";
import { OrderTotal } from "@/utils/orderTotal";

export type RequestFilters = {
    poFilter: ModelPurchaseOrderFilterInput;
    coFilter: ModelCustomerOrderFilterInput;
};

export const getFilters = (form: FormState) => {
    const { dateEnd, dateStart, includeDeletedCOs, includeDeletedPOs } = form;
    const excludeDeletedFilter = { isDeleted: { ne: true } };
    const dateFilter = { between: [toAWSDateTime(dateStart), toAWSDateTime(dateEnd)]};
    let poFilter = undefined;
    let coFilter = undefined;
    if (!includeDeletedPOs) {
        poFilter = excludeDeletedFilter
    }
    if (!includeDeletedCOs) {
        coFilter = excludeDeletedFilter
    }
    return { poFilter, coFilter, dateFilter }
}

export const handleReportRequest = async (
    form: FormState,
    rescueDBOperationBatch: <T>(batchItems: AsyncBatchItem<T>[], customMasterErrMsg?: string) => void
): Promise<Order[]> => {
    const { includeCOs, includePOs } = form;
    let resPO: any[] = [];
    let resCO: any[] = []

    const { coFilter, poFilter, dateFilter } = getFilters(form);

    const batchItems: AsyncBatchItem<any>[] = [];
    let hadError = false;

    if (includePOs) {
        let item: AsyncBatchItem<PurchaseOrder[]> = {
            requestFn: () => listPurchaseOrderAPI(poFilter, ModelSortDirection.ASC, dateFilter),
            dbOperation: DBOperation.LIST,
            successHandler: (resp: PurchaseOrder[]) => {
                resPO = resPO.concat(resp);
            },
            errorHandler: e => {
                hadError = true
            }
        }
        batchItems.push(item);
    }
    if (includeCOs) {
        let item: AsyncBatchItem<CustomerOrder[]> = {
            requestFn: () => listCustomerOrderAPI(coFilter, ModelSortDirection.ASC, dateFilter),
            dbOperation: DBOperation.LIST,
            successHandler: (resp: CustomerOrder[]) => {
                resCO = resCO.concat(resp);
            },
            errorHandler: e => {
                hadError = true
            }
        }
        batchItems.push(item);
    }

    await rescueDBOperationBatch(batchItems, "Failed to generate report.");

    if (hadError) {
        return [];
    }

    let res = resCO.concat(resPO)
    let newOrders: Order[] = res.map((order: CustomerOrder | PurchaseOrder) => {
        let orderedItems = order.orderedItems?.items ?? [];
        let cleanedItems = orderedItems.filter(item => item !== null) as TShirtOrder[];
        return { ...order, orderedItems: cleanedItems }
    });

    return Promise.resolve(newOrders);
}

export const downloadOrderLevelCSV = (orders: Order[], orderIdToTotal: Map<string, OrderTotal>, todaysDate: string) => {
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
        { columnKey: "createdAt", headerName: "Date" },
        { columnKey: "updatedAt", headerName: "Updated At" },

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

    const csvName = `Report-${todaysDate}.csv`;
    generateCSV(csvName, headers, enhancedOrders);
}