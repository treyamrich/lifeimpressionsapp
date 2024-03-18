import { fromUTC, getStartOfMonth } from "@/utils/datetimeConversions";
import { PurchaseOrderOrCustomerOrder } from "./partiql-helpers";
import { UpdateOrderTransactionInput } from "./update-tshirt-order/update-tshirt-order-transaction";
import { TShirtOrder } from "@/API";

export const isCO = (order: PurchaseOrderOrCustomerOrder) => order.__typename === 'CustomerOrder';
export const isPO = (order: PurchaseOrderOrCustomerOrder) => order.__typename === 'PurchaseOrder';

export const orderIsAfterStartOfMonth = (
    order: PurchaseOrderOrCustomerOrder
  ): boolean => fromUTC(order.createdAt) >= getStartOfMonth(0)

export const isReceivingPOItem = (
  input: UpdateOrderTransactionInput
): boolean => isPO(input.parentOrder) && input.inventoryQtyDelta > 0;

export const isAddingNewPOItem = (
  input: UpdateOrderTransactionInput,
  updateTShirtOrderResp: TShirtOrder | undefined
) => isPO(input.parentOrder) && input.updatedTShirtOrder.id !== updateTShirtOrderResp?.id;