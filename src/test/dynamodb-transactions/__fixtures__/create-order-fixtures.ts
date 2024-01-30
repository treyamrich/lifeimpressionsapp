import { CustomerOrder, CustomerOrderStatus, POStatus, PurchaseOrder, TShirt, TShirtOrder, TShirtSize, TShirtType } from "@/API";

export const tshirts: TShirt[] = [
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

export const tshirtOrders: TShirtOrder[] = [
    {
        __typename: "TShirtOrder",
        id: '',
        quantity: 2,
        amountReceived: -1,
        tShirtOrderTshirtId: tshirts[0].id,
        createdAt: '',
        updatedAt: '',
        tshirt: tshirts[0],
        costPerUnit: 52.1
    },
    {
        __typename: "TShirtOrder",
        id: '',
        quantity: 3,
        amountReceived: -1,
        tShirtOrderTshirtId: tshirts[1].id,
        createdAt: '',
        updatedAt: '',
        tshirt: tshirts[1],
        costPerUnit: 52.4
    }
]

export const po: PurchaseOrder = {
    __typename: "PurchaseOrder",
    id: '',
    orderNumber: "123",
    vendor: "Adidas",
    orderedItems: [...tshirtOrders] as any,
    status: POStatus.Open,
    changeHistory: null,
    type: "PurchaseOrder",
    createdAt: '',
    updatedAt: '',
};

export const coWithNulls: CustomerOrder = {
    __typename: "CustomerOrder",
    id: '',
    orderNumber: "123",
    customerName: "Bob",
    customerEmail: "",
    customerPhoneNumber: "",
    dateNeededBy: "1976-01-01",
    orderStatus: CustomerOrderStatus.NEW,
    orderedItems: [...tshirtOrders] as any,
    orderNotes: "",
    changeHistory: null,
    type: "CustomerOrder",
    createdAt: '',
    updatedAt: '',
};

export const co: CustomerOrder = {
    __typename: "CustomerOrder",
    id: '',
    orderNumber: "123",
    customerName: "Bob",
    customerEmail: "bob@gmail.com",
    customerPhoneNumber: "999 111 1111",
    dateNeededBy: "1976-01-01",
    orderStatus: CustomerOrderStatus.NEW,
    orderedItems: [...tshirtOrders] as any,
    orderNotes: "test note",
    changeHistory: null,
    type: "CustomerOrder",
    createdAt: '',
    updatedAt: '',
};