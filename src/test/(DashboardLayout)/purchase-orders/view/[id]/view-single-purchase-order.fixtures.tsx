import { POStatus, PurchaseOrder } from "@/API";

export const validPO: PurchaseOrder = {
    __typename: "PurchaseOrder",
    id: "123",
    orderNumber: "ValidPoOrderNum",
    vendor: "JDS",
    orderedItems: null,
    changeHistory: null,
    status: POStatus.Open,
    isDeleted: false,
    type: "field is only for indexing in dynamodb",
    createdAt: "2023-01-01T10:10:10",
    updatedAt: "2023-01-01T10:10:10",
  };
