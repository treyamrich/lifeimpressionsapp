"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import React, { useMemo, useState } from "react";
import { TextField, Stack, MenuItem, Box, Button, Typography } from "@mui/material";

import { MRT_ColumnDef, MRT_Row } from "material-react-table";
import { CreateOrderChangeInput, TShirtOrder } from "@/API";
import TShirtOrderTable, { EditTShirtOrderResult, TableMode } from "../TShirtOrderTable/TShirtOrderTable";
import ConfirmPopup from "../../components/forms/confirm-popup/ConfirmPopup";
import { useRouter } from "next/navigation";
import { ColumnInfo, SelectValue } from "../../purchase-orders/table-constants";
import { DateTimePicker } from "@mui/x-date-pickers";
import { toAWSDateTime } from "@/utils/datetimeConversions";
import { Dayjs } from "dayjs";
import MyTelInput from "../inputs/MyTelInput";
import { validateEmail, validatePhoneNumber } from "@/utils/field-validation";
import NonNegativeFloatInput from "./NonNegativeFloatInput";

export enum EntityType {
    CustomerOrder = "customer",
    PurchaseOrder = "purchase"
}

function CreateOrderPage<T extends Record<any, any>>({
    entityType,
    getTableColumns,
    columnInfo,
    handleCreateOrder,
    getInitialFormState
}: {
    entityType: EntityType,
    getInitialFormState: () => any,
    getTableColumns: () => MRT_ColumnDef<T>[],
    columnInfo: Map<string | number | symbol | undefined, ColumnInfo>,
    handleCreateOrder: (
        order: T,
        callback: () => void
    ) => void
}) {
    const { push } = useRouter();
    const getInitialOrderFormErrorMap = () =>
        new Map<string, string>(
            Object.keys(getInitialFormState()).map((key) => [key, ""])
        );

    // State starts here
    const [values, setValues] = useState<any>(() => getInitialFormState());
    const [errorMap, setErrorMap] = useState(() => getInitialOrderFormErrorMap());
    const [showContinue, setShowContinue] = useState<boolean>(false);

    const resetForm = () => {
        setValues(getInitialFormState());
        setErrorMap(getInitialOrderFormErrorMap());
    };

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
            const order = {} as any;
            Object.keys(values).forEach((key: string) => {
                if (columnInfo.get(key)?.dateTimeField) {
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
            handleCreateOrder(
                order,
                () => {
                    setShowContinue(true);
                    resetForm();
                });
        }
    };

    const columns = useMemo<MRT_ColumnDef<T>[]>(
        () => getTableColumns(),
        []
    );

    const getFormField = (column: MRT_ColumnDef<T>) => {
        const errMsg = errorMap.get(column.accessorKey as string);
        const hasError = errMsg !== "" && errMsg !== undefined;
        const colInfo = columnInfo.get(column.accessorKey);
        if (colInfo?.dateTimeField) {
            const getMaxDate = colInfo?.dateTimeField.getMaxDateRestriction;
            // NEED TO ADD BACK
            const getMinDate = () => undefined; // colInfo?.dateTimeField.getMinDateRestriction;
            return (
                <DateTimePicker
                    label={column.header}
                    disabled={colInfo?.disabledOnCreate === true}
                    value={values[column.accessorKey as string]}
                    onChange={(newVal: any) =>
                        setValues({ ...values, [column.accessorKey as string]: newVal })
                    }
                    views={['year', 'month', 'day', 'hours', 'minutes']}
                    maxDateTime={getMaxDate ? getMaxDate() : undefined}
                    minDateTime={getMinDate ? getMinDate() : undefined}
                />)
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
                        setValues({ ...values, [column.accessorKey as string]: newVal });
                    }}
                    errorMsg={errMsg}
                    label="Customer Phone Number"
                />)
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
                label={column.header}
                name={column.accessorKey as string}
                onChange={(e: any) =>
                    setValues({ ...values, [e.target.name]: e.target.value })
                }
                disabled={colInfo?.disabledOnCreate === true}
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

    const uppercaseEntityType = entityType === EntityType.CustomerOrder ? "Customer" : "Purchase";
    
    return (
        <PageContainer
            title={`New ${uppercaseEntityType} Order`}
            description={`this is New ${uppercaseEntityType} Order page`}
        >
            <DashboardCard title={`New ${uppercaseEntityType} Order`}>
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
                                (col) => !columnInfo.get(col.accessorKey)?.excludeOnCreate
                            )
                            .map((column, index) => (
                                <React.Fragment key={index}> {getFormField(column)} </React.Fragment>
                            ))
                        }
                        <Typography variant="h6" color="textSecondary">
                            T-Shirts
                        </Typography>
                        <TShirtOrderTable
                            tableData={values.orderedItems}
                            setTableData={(newValues) =>
                                setValues({ ...values, orderedItems: newValues })
                            }
                            parentOrder={undefined}
                            onRowEdit={(res: EditTShirtOrderResult) => {
                                const { row, orderChange, exitEditingMode } = res;
                                const tableData = values.orderedItems;
                                orderChange.fieldChanges.forEach(fieldChange => {
                                    tableData[row.index][fieldChange.fieldName] = fieldChange.newValue;
                                })
                                    setValues({ ...values, orderedItems: [...tableData] });
                                exitEditingMode();
                            }}
                            onRowAdd={(newTShirtOrder: TShirtOrder, orderChange: CreateOrderChangeInput, closeFormCallback: () => void) => {
                                const tableData = values.orderedItems;
                                setValues({ ...values, orderedItems: [...tableData, newTShirtOrder] })
                                closeFormCallback();
                            }}
                            entityType={entityType}
                            mode={TableMode.Create}
                        />
                        <Box>
                            <Button
                                color="primary"
                                variant="contained"
                                size="large"
                                fullWidth
                                onClick={handleSubmit}
                                type="submit"
                            >
                                Submit
                            </Button>
                        </Box>

                        <ConfirmPopup
                            confirmationMsg={`Your ${entityType} order was created. Would you like to continue creating ${entityType} orders?`}
                            submitButtonMsg="Yes"
                            cancelButtonMsg="No"
                            title={`Continue Creating ${uppercaseEntityType} Orders?`}
                            onClose={() => {
                                setShowContinue(false);
                                push(`/${entityType}-orders`);
                            }}
                            onSubmit={() => setShowContinue(false)}
                            open={showContinue}
                        />
                    </Stack>
                </form>
            </DashboardCard>
        </PageContainer>
    );
};

export default CreateOrderPage;