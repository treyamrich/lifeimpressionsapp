import { GetCustomerOrderQuery, GetPurchaseOrderQuery } from "@/API";

export type OrderMinInfo = {
    __typename: 'CustomerOrder' | 'PurchaseOrder';
    id: string;
    isDeleted?: boolean;
    orderNumber: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderMinInfoQuery extends GetPurchaseOrderQuery, GetCustomerOrderQuery {};