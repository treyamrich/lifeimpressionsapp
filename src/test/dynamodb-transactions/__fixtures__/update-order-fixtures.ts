import { TShirt, TShirtOrder, TShirtSize, TShirtType } from "@/API";
import { UpdateOrderTransactionInput } from "@/dynamodb-transactions/update-tshirt-order/update-tshirt-order-transaction";
import { co, po } from "./create-order-fixtures";

export const updatedTShirt: TShirt = {
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
}

export const updatedTShirtOrder: TShirtOrder = {
    __typename: "TShirtOrder",
    id: '',
    quantity: 2,
    amountReceived: -1,
    tShirtOrderTshirtId: updatedTShirt.id,
    createdAt: '',
    updatedAt: '',
    tshirt: updatedTShirt,
    costPerUnitCents: 0,
    earliestTransaction: '',
    latestTransaction: ''
};

export const updateOrderInput: UpdateOrderTransactionInput = {
    createOrderChangeInput: {
        reason: "",
        fieldChanges: [],
        orderChangeTshirtId: ""
    },
    inventoryQtyDelta: 2,
    updatedTShirtOrder: updatedTShirtOrder,
    parentOrder: co,
    shouldUpdateOrderTable: true,
}

export const negativeUpdateOrderInput: UpdateOrderTransactionInput = {
    createOrderChangeInput: {
        reason: "",
        fieldChanges: [],
        orderChangeTshirtId: ""
    },
    inventoryQtyDelta: -2,
    updatedTShirtOrder: updatedTShirtOrder,
    parentOrder: po,
    shouldUpdateOrderTable: true,
}