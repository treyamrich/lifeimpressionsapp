import { TShirtSize, TShirtType } from "@/API";

export interface SelectValue {
    label: string;
    value: any;
}

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
        [
            { label: "New Born", value: TShirtSize.NB },
            { label: "6 Months", value: TShirtSize.SixMonths },
            { label: "12 Months", value: TShirtSize.TwelveMonths },
            { label: "18 Months", value: TShirtSize.EighteenMonths },
            { label: "2T", value: TShirtSize.TwoT },
            { label: "3T", value: TShirtSize.ThreeT },
            { label: "4T", value: TShirtSize.FourT },
            { label: "5T", value: TShirtSize.FiveT },
            { label: "Youth XS", value: TShirtSize.YXS },
            { label: "Youth S", value: TShirtSize.YS },
            { label: "Youth M", value: TShirtSize.YM },
            { label: "Youth L", value: TShirtSize.YL },
            { label: "Youth XL", value: TShirtSize.YXL },
            { label: "Adult Small", value: TShirtSize.AS },
            { label: "Adult Medium", value: TShirtSize.AM },
            { label: "Adult Large", value: TShirtSize.AL },
            { label: "Adult XL", value: TShirtSize.AXL },
            { label: "2X", value: TShirtSize.TwoX },
            { label: "3X", value: TShirtSize.ThreeX },
            { label: "4X", value: TShirtSize.FourX },
            { label: "5X", value: TShirtSize.FiveX },
        ]
        ,
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