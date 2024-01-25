import { TShirt, TShirtOrder, TShirtSize, TShirtType } from "@/API";
import { UpdateOrderTransactionInput } from "@/dynamodb-transactions/update-order-transaction";

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
    tshirt: updatedTShirt
};

export const updateOrderInput: UpdateOrderTransactionInput = {
    reason: "None",
    tshirtTableQtyDelta: 2,
    orderedQtyDelta: 4,
    updatedTShirtOrder: updatedTShirtOrder,
    parentOrderId: "123"
}

export const negativeUpdateOrderInput: UpdateOrderTransactionInput = {
    reason: "None",
    tshirtTableQtyDelta: -2,
    orderedQtyDelta: -4,
    updatedTShirtOrder: updatedTShirtOrder,
    parentOrderId: "123"
}