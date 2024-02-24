/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SelectFieldProps, SwitchFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
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
export declare type TShirtCreateFormInputValues = {
    styleNumber?: string;
    brand?: string;
    color?: string;
    size?: string;
    type?: string;
    quantityOnHand?: number;
    isDeleted?: boolean;
    indexField?: string;
};
export declare type TShirtCreateFormValidationValues = {
    styleNumber?: ValidationFunction<string>;
    brand?: ValidationFunction<string>;
    color?: ValidationFunction<string>;
    size?: ValidationFunction<string>;
    type?: ValidationFunction<string>;
    quantityOnHand?: ValidationFunction<number>;
    isDeleted?: ValidationFunction<boolean>;
    indexField?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type TShirtCreateFormOverridesProps = {
    TShirtCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    styleNumber?: PrimitiveOverrideProps<TextFieldProps>;
    brand?: PrimitiveOverrideProps<TextFieldProps>;
    color?: PrimitiveOverrideProps<TextFieldProps>;
    size?: PrimitiveOverrideProps<SelectFieldProps>;
    type?: PrimitiveOverrideProps<SelectFieldProps>;
    quantityOnHand?: PrimitiveOverrideProps<TextFieldProps>;
    isDeleted?: PrimitiveOverrideProps<SwitchFieldProps>;
    indexField?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type TShirtCreateFormProps = React.PropsWithChildren<{
    overrides?: TShirtCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: TShirtCreateFormInputValues) => TShirtCreateFormInputValues;
    onSuccess?: (fields: TShirtCreateFormInputValues) => void;
    onError?: (fields: TShirtCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: TShirtCreateFormInputValues) => TShirtCreateFormInputValues;
    onValidate?: TShirtCreateFormValidationValues;
} & React.CSSProperties>;
export default function TShirtCreateForm(props: TShirtCreateFormProps): React.ReactElement;
