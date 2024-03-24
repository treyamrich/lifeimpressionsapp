import { TShirtOrder } from "@/API";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { ReportType } from "@/app/(DashboardLayout)/report-generation/GenerateReportForm";
import dayjs from "dayjs";
import { tshirt } from "../inventory/inventory.fixtures";
import { OrderMinInfo } from "@/my-graphql-queries/types";

export const buildFormState = ({
    dateStart = dayjs('2020-01-01T00:00:00Z'),
    dateEnd = dayjs('2020-01-01T01:00:00Z'),
    includePOs = false,
    includeCOs = false,
    includeDeletedPOs = false,
    includeDeletedCOs = false,
    includeZeroQtyOrders = false,
    reportType = ReportType.HighLevel,
    errMsg = '',
    yearAndMonth = dayjs()
}) => ({
    dateStart,
    dateEnd,
    includePOs,
    includeCOs,
    includeDeletedPOs,
    includeDeletedCOs,
    includeZeroQtyOrders,
    reportType,
    errMsg,
    yearAndMonth
})

export const buildTShirtOrder = (
    order_id: string,
    order_item_id: string,
    order_type?: EntityType
): TShirtOrder => {
    const x: any = {}
    if (order_type === EntityType.PurchaseOrder) {
        x['purchaseOrderOrderedItemsId'] = order_id;
        x['customerOrderOrderedItemsId'] = null;
    } else if (order_type === EntityType.CustomerOrder) {
        x['customerOrderOrderedItemsId'] = order_id;
        x['purchaseOrderOrderedItemsId'] = null;
    } else {
        x['customerOrderOrderedItemsId'] = null;
        x['purchaseOrderOrderedItemsId'] = null;
    }
    return {
        ...x,
        __typename: "TShirtOrder",
        tShirtOrderTshirtId: 'asdf',
        id: order_item_id,
        createdAt: '2020-12-12',
        updatedAt: '2020-12-12',
        costPerUnit: 0,
        quantity: 0,
        tshirt: tshirt
    }
}

export const buildOrderMinInfo = (
    order_id: string,
    entityType: EntityType
): OrderMinInfo => {
    const t = entityType === EntityType.PurchaseOrder ?
        "PurchaseOrder" : "CustomerOrder"
    return {
    __typename: t,
    id: order_id,
    isDeleted: false,
    orderNumber: 'asdf',
    createdAt: 'asdf',
    updatedAt: 'asdf',
}}