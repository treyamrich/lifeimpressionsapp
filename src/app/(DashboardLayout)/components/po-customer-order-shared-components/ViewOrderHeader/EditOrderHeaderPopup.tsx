import { MRT_ColumnDef } from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import { Dayjs } from "dayjs";
import { toAWSDateTime, toTimezoneWithoutAdjustingHours } from "@/utils/datetimeConversions";
import { Button, Dialog, DialogContent, DialogTitle, Grid, MenuItem, Stack, TextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { validateEmail, validatePhoneNumber } from "@/utils/field-validation";
import React from "react";
import MyTelInput from "@/app/(DashboardLayout)/components/inputs/MyTelInput";
import { ColumnInfo, SelectValue } from "@/app/(DashboardLayout)/purchase-orders/table-constants";
import NonNegativeFloatInput from "../NonNegativeFloatInput";
import { EntityType } from "../CreateOrderPage";


function EditOrderHeaderPopup<T extends Record<any, any>>({ open, order, onSubmit, onClose, orderType, getTableColumns, columnInfo }: {
    open: boolean;
    order: T;
    onSubmit: (newOrder: T, resetForm: () => void) => void;
    onClose: () => void;
    orderType: EntityType;
    getTableColumns: () => MRT_ColumnDef<T>[];
    columnInfo: Map<string | number | symbol | undefined, ColumnInfo>;
}) {
    const columns = useMemo<MRT_ColumnDef<T>[]>(
        () => getTableColumns(),
        []
    );
    const getInitialFormState = () => {
        const formState = { ...order } as any;
        Object.keys(formState).forEach((field: string) => {
            if (columnInfo.get(field)?.isDatetimeField) {
                formState[field] = toTimezoneWithoutAdjustingHours(formState[field]);
            } else if (formState[field] === null) {
                formState[field] = "";
            }
        });
        return formState;
    }
    const getInitialOrderFormErrorMap = () =>
        new Map<string, string>(
            Object.keys(order).map((key) => [key, ""])
        );

    // State starts here
    const [values, setValues] = useState<any>(() => getInitialFormState());
    const [errorMap, setErrorMap] = useState(() => getInitialOrderFormErrorMap());

    const resetForm = () => {
        setErrorMap(getInitialOrderFormErrorMap());
        setValues(getInitialFormState());
    }

    useEffect(() => {
        resetForm();
    }, [order])

    const handleSubmit = () => {
        //Validate input
        const newErrors = getInitialOrderFormErrorMap();
        let allValid = true;
        Object.keys(values).forEach((key) => {
            let errMsg = "";
            let value = values[key];

            if (columnInfo.get(key)?.isFloatField && errorMap.get(key) !== "") {
                errMsg = errorMap.get(key)!;
            }
            else if (columnInfo.get(key)?.isRequired) {
                if(typeof value === 'string')
                    values[key] = value.trim();
                if(values[key].length < 1)
                    errMsg = "Field is required";
            }
            else if (columnInfo.get(key)?.isPhoneNumField) {
                const validatedPhoneNum = validatePhoneNumber(values[key]);
                if (validatedPhoneNum === undefined) {
                    errMsg = "Invalid phone number. Area code may be invalid (hint: XXX XXX XXXX).";
                } else {
                    values[key] = validatedPhoneNum;
                }
            }
            else if (columnInfo.get(key)?.isEmailField) {
                const validatedEmail = validateEmail(values[key]);
                if (validatedEmail === undefined) {
                    errMsg = "Invalid email format.";
                } else {
                    values[key] = validatedEmail;
                }
            }
            newErrors.set(key, errMsg);
            allValid = allValid && errMsg === "";
        });
        setErrorMap(newErrors);

        if (allValid) {
            // Convert the datetime that was input with user's timezone to UTC timezone
            const updatedOrder = {} as any;
            Object.keys(values).forEach((key: string) => {
                if (columnInfo.get(key)?.isDatetimeField) {
                    const datetime = values[key] as Dayjs;
                    updatedOrder[key] = toAWSDateTime(datetime);
                }
                // This field had to be optional
                else if (values[key] === "") {
                    updatedOrder[key] = undefined;
                }
                else {
                    updatedOrder[key] = values[key];
                }
            });
            onSubmit(updatedOrder, resetForm);
        }
    };

    const getFormField = (column: MRT_ColumnDef<T>) => {
        const errMsg = errorMap.get(column.accessorKey as string);
        const hasError = errMsg !== "" && errMsg !== undefined;
        const colInfo = columnInfo.get(column.accessorKey);
        if (colInfo?.isDatetimeField) {
            return (
                <DateTimePicker
                    key={column.accessorKey as React.Key}
                    label={column.header}
                    disabled={colInfo?.disabledOnCreate === true}
                    value={values[column.accessorKey as string]}
                    onChange={(newVal) =>
                        setValues({ ...values, [column.accessorKey as string]: newVal })
                    }
                    views={['year', 'month', 'day', 'hours', 'minutes']}
                />
            )
        }
        if (colInfo?.isPhoneNumField) {
            return (
                <MyTelInput
                    value={values[column.accessorKey as string]}
                    onChange={newVal => {
                        if (newVal === "+1") {
                            const newMap = new Map(errorMap);
                            newMap.set(column.accessorKey as string, '');
                            setErrorMap(newMap);
                        }
                        setValues({ ...values, [column.accessorKey as string]: newVal })
                    }}
                    errorMsg={errMsg}
                    label="Customer Phone Number"
                />
            )
        }
        if (colInfo?.isFloatField) {
            return (
                <NonNegativeFloatInput
                    column={column}
                    values={values}
                    setValues={setValues}
                    errorMap={errorMap}
                    setErrorMap={setErrorMap}
                />
            )
        }
        return (
            <TextField
                select={colInfo?.selectFields !== undefined}
                key={column.accessorKey as React.Key}
                label={column.header}
                name={column.accessorKey as string}
                onChange={(e: any) =>
                    setValues({ ...values, [e.target.name]: e.target.value })
                }
                disabled={colInfo?.disabledOnEdit === true}
                value={values[column.accessorKey as string]}
                required={colInfo?.isRequired}
                error={hasError}
                helperText={errMsg}
                placeholder={colInfo?.placeholderText}
                multiline={colInfo?.multilineTextInfo !== undefined}
                rows={colInfo?.multilineTextInfo?.numRows}
            >
                {/* Select field options */}
                {colInfo?.selectFields
                    ?.map((selectValue: SelectValue, idx: number) => (
                        <MenuItem key={idx} value={selectValue.value}>
                            {selectValue.label}
                        </MenuItem>
                    ))}
            </TextField>
        )
    }
    return (
        <Dialog open={open} maxWidth="xs">
            <DialogTitle textAlign="center">Edit {orderType === EntityType.PurchaseOrder ? "Purchase" : "Customer"} {order.orderNumber} Order</DialogTitle>
            <DialogContent style={{ padding: "25px" }}>
                <form onSubmit={(e) => e.preventDefault()}>
                    <Stack
                        sx={{
                            width: "100%",
                            minWidth: { xs: "300px", sm: "360px", md: "400px" },
                            gap: "1.5rem",
                        }}
                    >
                        {columns
                            .filter(
                                (col) => columnInfo.get(col.accessorKey)?.isEditable
                            )
                            .map((column, index) => (
                                <React.Fragment key={index}>
                                    {getFormField(column)}
                                </React.Fragment>))
                        }
                        <Grid container justifyContent={"space-between"}>
                            <Grid item>
                                <Button
                                    color="error"
                                    size="small"
                                    variant="contained"
                                    onClick={() => {
                                        onClose();
                                        resetForm();
                                    }}>
                                    Cancel
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    size="small"
                                    fullWidth
                                    onClick={() => {
                                        handleSubmit();
                                    }}
                                    type="submit"
                                >
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>
                    </Stack>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default EditOrderHeaderPopup;