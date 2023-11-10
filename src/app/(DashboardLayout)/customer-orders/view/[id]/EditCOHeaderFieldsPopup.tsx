import { CustomerOrder } from "@/API";
import { MRT_ColumnDef } from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import { SelectValue, columnInfo, getTableColumns } from "../../table-constants";
import { Dayjs } from "dayjs";
import { toAWSDateTime, toDayjs } from "@/utils/datetimeConversions";
import { Button, Dialog, DialogContent, DialogTitle, Grid, MenuItem, Stack, TextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { validatePhoneNumber } from "@/utils/phoneValidation";
import React from "react";
import MyTelInput from "@/app/(DashboardLayout)/components/tel-input/MyTelInput";

type EditCOHeaderFieldsPopupProps = {
    open: boolean;
    co: CustomerOrder;
    onSubmit: (newCo: CustomerOrder) => void;
    onClose: () => void;
}

const EditCOHeaderFieldsPopup = ({ open, co, onSubmit, onClose }: EditCOHeaderFieldsPopupProps) => {
    const columns = useMemo<MRT_ColumnDef<CustomerOrder>[]>(
        () => getTableColumns(),
        []
    );
    const getInitialFormState = () => {
        const formState = { ...co } as any;
        Object.keys(formState).forEach((field: string) => {
            if (columnInfo.get(field)?.isDatetimeField) {
                formState[field] = toDayjs(formState[field]);
                // SOME TIME ZONE SHIT
                console.log(formState[field])
            } else if (formState[field] === null) {
                formState[field] = "";
            }
        });
        return formState;
    }
    const getInitialOrderFormErrorMap = () =>
        new Map<string, string>(
            Object.keys(co).map((key) => [key, ""])
        );

    // State starts here
    const [values, setValues] = useState<any>(() => getInitialFormState());
    const [errorMap, setErrorMap] = useState(() => getInitialOrderFormErrorMap());

    const resetForm = () => {
        setErrorMap(getInitialOrderFormErrorMap());
        setValues(getInitialFormState());
    }

    const handleSubmit = () => {
        //Validate input
        const newErrors = new Map<string, string>(getInitialOrderFormErrorMap());
        let allValid = true;
        Object.keys(values).forEach((key) => {
            let errMsg = "";
            let value = values[key];
            if (columnInfo.get(key)?.isRequired && value.toString().length < 1) {
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
            newErrors.set(key, errMsg);
            allValid = allValid && errMsg === "";
        });
        setErrorMap(newErrors);

        if (allValid) {
            // Convert the datetime that was input with user's timezone to UTC timezone
            const order = {} as any;
            Object.keys(values).forEach((key: string) => {
                if (columnInfo.get(key)?.isDatetimeField) {
                    const datetime = values[key] as Dayjs;
                    order[key] = toAWSDateTime(datetime);
                }
                // This field had to be optional
                else if (values[key] === "") {
                    order[key] = undefined;
                }
                else {
                    order[key] = values[key];
                }
            });
            onSubmit(order);
        }
    };

    useEffect(() => {
        setValues(getInitialFormState());
    }, [co]);
    return (
        <Dialog open={open} maxWidth="xs">
            <DialogTitle textAlign="center">Edit Customer Order {co.orderNumber}</DialogTitle>
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
                            .map((column, index) => {
                                const errMsg = errorMap.get(column.accessorKey as string);
                                const hasError = errMsg !== "" && errMsg !== undefined;
                                const colInfo = columnInfo.get(column.accessorKey);
                                return (<React.Fragment key={index}>
                                    {colInfo?.isDatetimeField && (
                                        <DateTimePicker
                                            key={column.accessorKey as React.Key}
                                            label={column.header}
                                            disabled={colInfo?.disabledOnCreate === true}
                                            value={values[column.accessorKey as string]}
                                            onChange={(newVal) =>
                                                setValues({ ...values, [column.accessorKey as string]: newVal })
                                            }
                                            views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                                        />
                                    )}
                                    {colInfo?.isPhoneNumField && (
                                        <MyTelInput
                                            value={values[column.accessorKey as string]}
                                            onChange={newVal => setValues({ ...values, [column.accessorKey as string]: newVal })}
                                            errorMsg={errMsg}
                                        />
                                    )}
                                    {!colInfo?.isDatetimeField && !colInfo?.isPhoneNumField && (
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
                                    )}
                                </React.Fragment>)
                            })
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
                                        resetForm();
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

export default EditCOHeaderFieldsPopup;