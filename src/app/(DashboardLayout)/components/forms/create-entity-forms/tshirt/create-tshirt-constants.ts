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
            { label: TShirtSize.NB, value: TShirtSize.NB },
            { label: TShirtSize.SixMonths, value: TShirtSize.SixMonths },
            { label: TShirtSize.TwelveMonths, value: TShirtSize.TwelveMonths },
            { label: TShirtSize.EighteenMonths, value: TShirtSize.EighteenMonths },
            { label: TShirtSize.TwoT, value: TShirtSize.TwoT },
            { label: TShirtSize.ThreeT, value: TShirtSize.ThreeT },
            { label: TShirtSize.FourT, value: TShirtSize.FourT },
            { label: TShirtSize.FiveT, value: TShirtSize.FiveT },
            { label: TShirtSize.YXS, value: TShirtSize.YXS },
            { label: TShirtSize.YS, value: TShirtSize.YS },
            { label: TShirtSize.YM, value: TShirtSize.YM },
            { label: TShirtSize.YL, value: TShirtSize.YL },
            { label: TShirtSize.YXL, value: TShirtSize.YXL },
            { label: TShirtSize.AS, value: TShirtSize.AS },
            { label: TShirtSize.AM, value: TShirtSize.AM },
            { label: TShirtSize.AL, value: TShirtSize.AL },
            { label: TShirtSize.AXL, value: TShirtSize.AXL },
            { label: TShirtSize.TwoX, value: TShirtSize.TwoX },
            { label: TShirtSize.ThreeX, value: TShirtSize.ThreeX },
            { label: TShirtSize.FourX, value: TShirtSize.FourX },
            { label: TShirtSize.FiveX, value: TShirtSize.FiveX },
        ],
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