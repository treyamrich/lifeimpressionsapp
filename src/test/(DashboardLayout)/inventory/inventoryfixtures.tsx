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

export const validCreateTShirtInput: CreateTShirtInput = {
  styleNumber: "NewShirtStyleNumber",
  color: "Red",
  size: TShirtSize.NB,
  type: TShirtType.Blend,
  quantityOnHand: 99,
  brand: "Nike",
};
export const validCreateTShirtInputResponse: TShirt = {
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
};

export const invalidCreateTShirtInput: CreateTShirtInput = {
  styleNumber: "",
  color: "",
  size: TShirtSize.NB,
  type: TShirtType.Blend,
  quantityOnHand: -1,
  brand: "",
};

export type ExpectedErrorMessage = {
  times: number;
  message: string;
};

export const expectedErrsForInvalidInput: ExpectedErrorMessage[] = [
  {
    message: "Qty. must be non-negative",
    times: 1,
  },
  {
    message: "Field is required",
    times: 3,
  },
];

export const createTShirtInputDuplicate: CreateTShirtInput = {
  styleNumber: tshirt.styleNumber,
  color: tshirt.color,
  size: tshirt.size,
  type: TShirtType.Blend,
  quantityOnHand: 0,
  brand: "some valid brand",
};

export const expectedErrsDuplicate: ExpectedErrorMessage = {
  message: "Tshirt with style number, size, color already exists",
  times: 3,
};
