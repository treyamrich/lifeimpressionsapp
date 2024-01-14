/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SelectFieldProps, SwitchFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { TShirt } from "../API.ts";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type TShirtUpdateFormInputValues = {
    styleNumber?: string;
    brand?: string;
    color?: string;
    size?: string;
    type?: string;
    quantityOnHand?: number;
    isDeleted?: boolean;
};
export declare type TShirtUpdateFormValidationValues = {
    styleNumber?: ValidationFunction<string>;
    brand?: ValidationFunction<string>;
    color?: ValidationFunction<string>;
    size?: ValidationFunction<string>;
    type?: ValidationFunction<string>;
    quantityOnHand?: ValidationFunction<number>;
    isDeleted?: ValidationFunction<boolean>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type TShirtUpdateFormOverridesProps = {
    TShirtUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    styleNumber?: PrimitiveOverrideProps<TextFieldProps>;
    brand?: PrimitiveOverrideProps<TextFieldProps>;
    color?: PrimitiveOverrideProps<TextFieldProps>;
    size?: PrimitiveOverrideProps<SelectFieldProps>;
    type?: PrimitiveOverrideProps<SelectFieldProps>;
    quantityOnHand?: PrimitiveOverrideProps<TextFieldProps>;
    isDeleted?: PrimitiveOverrideProps<SwitchFieldProps>;
} & EscapeHatchProps;
export declare type TShirtUpdateFormProps = React.PropsWithChildren<{
    overrides?: TShirtUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    tShirt?: TShirt;
    onSubmit?: (fields: TShirtUpdateFormInputValues) => TShirtUpdateFormInputValues;
    onSuccess?: (fields: TShirtUpdateFormInputValues) => void;
    onError?: (fields: TShirtUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: TShirtUpdateFormInputValues) => TShirtUpdateFormInputValues;
    onValidate?: TShirtUpdateFormValidationValues;
} & React.CSSProperties>;
export default function TShirtUpdateForm(props: TShirtUpdateFormProps): React.ReactElement;
