import { POStatus, PurchaseOrder, TShirt, TShirtSize, TShirtType, UpdatePurchaseOrderInput } from "@/API";

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

export const validTShirts: TShirt[] = [
  {
    __typename: "TShirt",
    id: "123",
    styleNumber: "TShirt Style Num",
    color: "Red",
    size: TShirtSize.NB,
    type: TShirtType.Blend,
    quantityOnHand: 99,
    brand: "Nike",
    isDeleted: false,
    createdAt: "2023-01-01T10:10:10",
    updatedAt: "2023-01-01T10:10:10",
  },
  {
    __typename: "TShirt",
    id: "123",
    styleNumber: "TShirt Style Num",
    color: "Blue",
    size: TShirtSize.AL,
    type: TShirtType.Blend,
    quantityOnHand: 99,
    brand: "Nike",
    isDeleted: false,
    createdAt: "2023-01-01T10:10:10",
    updatedAt: "2023-01-01T10:10:10",
  },
  {
    __typename: "TShirt",
    id: "123",
    styleNumber: "TShirt Style Num",
    color: "Black",
    size: TShirtSize.AXL,
    type: TShirtType.Blend,
    quantityOnHand: 99,
    brand: "Nike",
    isDeleted: false,
    createdAt: "2023-01-01T10:10:10",
    updatedAt: "2023-01-01T10:10:10",
  },
];