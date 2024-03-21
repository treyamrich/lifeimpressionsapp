/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
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
export declare type CacheExpirationCreateFormInputValues = {
    id?: string;
    earliestExpiredDate?: string;
};
export declare type CacheExpirationCreateFormValidationValues = {
    id?: ValidationFunction<string>;
    earliestExpiredDate?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type CacheExpirationCreateFormOverridesProps = {
    CacheExpirationCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    id?: PrimitiveOverrideProps<TextFieldProps>;
    earliestExpiredDate?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type CacheExpirationCreateFormProps = React.PropsWithChildren<{
    overrides?: CacheExpirationCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: CacheExpirationCreateFormInputValues) => CacheExpirationCreateFormInputValues;
    onSuccess?: (fields: CacheExpirationCreateFormInputValues) => void;
    onError?: (fields: CacheExpirationCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: CacheExpirationCreateFormInputValues) => CacheExpirationCreateFormInputValues;
    onValidate?: CacheExpirationCreateFormValidationValues;
} & React.CSSProperties>;
export default function CacheExpirationCreateForm(props: CacheExpirationCreateFormProps): React.ReactElement;
