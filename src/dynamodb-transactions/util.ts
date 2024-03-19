import { fromUTC, getStartOfMonth } from "@/utils/datetimeConversions";
import { PurchaseOrderOrCustomerOrder } from "./partiql-helpers";
import { UpdateOrderTransactionInput } from "./update-tshirt-order/update-tshirt-order-transaction";
import { TShirtOrder } from "@/API";

export const isCO = (order: PurchaseOrderOrCustomerOrder) => order.__typename === 'CustomerOrder';
export const isPO = (order: PurchaseOrderOrCustomerOrder) => order.__typename === 'PurchaseOrder';

export const orderIsAfterStartOfMonth = (
    order: PurchaseOrderOrCustomerOrder
  ): boolean => isAfterStartOfMonth(order.createdAt)

export const isAfterStartOfMonth = (
  dateTimeStr: string
) => fromUTC(dateTimeStr) >= getStartOfMonth(0);