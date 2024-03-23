export type OrderMinInfo = {
    __typename: 'CustomerOrder' | 'PurchaseOrder';
    id: string;
    isDeleted?: boolean;
    orderNumber: string;
    createdAt: string;
    updatedAt: string;
}