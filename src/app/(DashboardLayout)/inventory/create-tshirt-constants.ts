import { TShirtSize, TShirtType } from "@/API";

export interface SelectValue {
  label: string;
  value: any;
}

export interface TShirtFormError {
  message: string;
}

export const initialTShirtFormState: any = {
  styleNumber: "",
  brand: "",
  color: "",
  size: TShirtSize.NB,
  type: TShirtType.Cotton,
  quantityOnHand: 0,
};
export const getInitialTShirtFormErrorMap = () =>
  new Map<string, string>(
    Object.keys(initialTShirtFormState).map((key) => [key, ""])
  );
