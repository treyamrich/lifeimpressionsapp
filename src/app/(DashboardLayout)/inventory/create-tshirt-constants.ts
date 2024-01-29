import { TShirtSize, TShirtType } from "@/API";

export interface SelectValue {
    label: string;
    value: any;
}

export const tshirtSizeToLabel: any = {
    NB: "New Born",
    SixMonths: "6 Months",
    TwelveMonths: "12 Months",
    EighteenMonths: "18 Months",
    TwoT: "2T",
    ThreeT: "3T",
    FourT: "4T",
    FiveT: "5T",
    YXS: "Youth XS",
    YS: "Youth S",
    YM: "Youth M",
    YL: "Youth L",
    YXL: "Youth XL",
    AS: "Adult Small",
    AM: "Adult Medium",
    AL: "Adult Large",
    AXL: "Adult XL",
    TwoX: "2X",
    ThreeX: "3X",
    FourX: "4X",
    FiveX: "5X",
};

export const selectInputFields = new Map<
    string | number | symbol | undefined,
    SelectValue[]
>([
    [
        "type",
        [
            { label: TShirtType.Cotton, value: TShirtType.Cotton },
            { label: TShirtType.Drifit, value: TShirtType.Drifit },
            { label: TShirtType.Blend, value: TShirtType.Blend },
        ],
    ],
    [
        "size",
        Object.keys(tshirtSizeToLabel).map(key => ({ label: tshirtSizeToLabel[key], value: key}))
    ],
]);

export const numberInputFields = new Set<string>(["quantityOnHand"]);

//Exclude these fields when creating
export const excludeOnCreateFields: string[] = ["id", "updatedAt", "createdAt"];

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