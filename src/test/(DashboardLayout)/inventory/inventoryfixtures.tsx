import { CreateTShirtInput, TShirt, TShirtSize, TShirtType } from "@/API";

export const tshirt: TShirt = {
    __typename: "TShirt",
    id: "123",
    styleNumber: "123",
    color: "Red",
    size: TShirtSize.NB,
    type: TShirtType.Blend,
    quantityOnHand: 10,
    brand: "Nike",
    isDeleted: false,
    createdAt: "2023-01-01T10:10:10",
    updatedAt: "2023-01-01T10:10:10",
};

export const createTShirtInput: CreateTShirtInput = {
    styleNumber: "NewShirtStyleNumber",
    color: "Red",
    size: TShirtSize.NB,
    type: TShirtType.Blend,
    quantityOnHand: 99,
    brand: "Nike",
};
export const createdTShirt: TShirt = {
    __typename: "TShirt",
    id: "123",
    styleNumber: "NewShirtStyleNumber",
    color: "Red",
    size: TShirtSize.NB,
    type: TShirtType.Blend,
    quantityOnHand: 99,
    brand: "Nike",
    isDeleted: false,
    createdAt: "2023-01-01T10:10:10",
    updatedAt: "2023-01-01T10:10:10",
}