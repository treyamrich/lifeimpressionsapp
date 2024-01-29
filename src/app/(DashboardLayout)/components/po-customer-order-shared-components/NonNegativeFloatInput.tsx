import { MRT_ColumnDef } from "material-react-table";
import NumberInput from "../inputs/NumberInput";
import { SetStateAction } from "react";

function NonNegativeFloatInput<T extends Record<any, any>>({
    column,
    values,
    setValues,
    errorMap,
    setErrorMap,
}: {
    column: MRT_ColumnDef<T>;
    values: any;
    setValues: React.Dispatch<SetStateAction<any>>;
    errorMap: Map<string, string>;
    setErrorMap: React.Dispatch<SetStateAction<Map<string, string>>>;
}) {
    return (
        <NumberInput
            label={column.header}
            initialValue={values[column.accessorKey as string]}
            isFloat
            name={column.accessorKey as string}
            placeholder="4.57"
            isValidFn={(newValue: number) => {
                let err = newValue < 0 ? "Input cannot be negative" : "";
                let newErrors = new Map(errorMap);
                newErrors.set(column.accessorKey as string, err);
                setErrorMap(newErrors);
                setValues({ ...values, [column.accessorKey as string]: newValue })
                return err
            }}
            onChange={(newValue: number, hasError: boolean) => {
                let newErrors = new Map(errorMap);
                let err = hasError ? "some error" : "";
                newErrors.set(column.accessorKey as string, err);
                setErrorMap(newErrors);
                if (!hasError) {
                    setValues({ ...values, [column.accessorKey as string]: newValue })
                }
            }}
        />)
}
export default NonNegativeFloatInput;