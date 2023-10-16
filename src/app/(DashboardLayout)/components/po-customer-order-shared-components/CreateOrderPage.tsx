"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import React, { useMemo, useState } from "react";
import {
    DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";
import { TextField, Stack, MenuItem, Box, Button } from "@mui/material";

import { MRT_ColumnDef, MRT_Row } from "material-react-table";
import { TShirtOrder } from "@/API";
import TShirtOrderTable, { TableMode } from "../../components/tshirt-order-table/TShirtOrderTable";
import { PurchaseOrderOrCustomerOrder, createTShirtOrderAPI } from "@/app/graphql-helpers/create-apis";
import ConfirmPopup from "../../components/forms/confirm-popup/ConfirmPopup";
import { useRouter } from "next/navigation";
import { ColumnInfo, SelectValue } from "../../purchase-orders/table-constants";
import { DateTimePicker } from "@mui/x-date-pickers";
import { getStartOfTomorrow, toAWSDateTime } from "@/utils/datetimeConversions";
import { Dayjs } from "dayjs";

export enum EntityType {
    CustomerOrder = "customer",
    PurchaseOrder = "purchase"
}

function CreateOrderPage<T extends Record<any, any>>({
    entityType,
    initialOrderFormState,
    getTableColumns,
    columnInfo,
    handleCreateOrder
}: {
    entityType: EntityType,
    initialOrderFormState: any
    getTableColumns: () => MRT_ColumnDef<T>[],
    columnInfo: Map<string | number | symbol | undefined, ColumnInfo>,
    handleCreateOrder: (order: T,
        createTShirtOrders: (order: PurchaseOrderOrCustomerOrder,
            orderedItems: TShirtOrder[]) => void
    ) => void
}) {
    const { rescueDBOperation } = useDBOperationContext();
    const { push } = useRouter();
    const getInitialOrderFormErrorMap = () =>
        new Map<string, string>(
            Object.keys(initialOrderFormState).map((key) => [key, ""])
        );
    const getInitialFormState = () => {
        const formState = {} as any;
        Object.keys(initialOrderFormState).forEach(field => {
            if (columnInfo.get(field)?.isDatetimeField) {
                formState[field] = getStartOfTomorrow();
            } else {
                formState[field] = initialOrderFormState[field];
            }
        });
        return formState;
    }
    // State starts here
    const [values, setValues] = useState<any>(() => getInitialFormState());
    const [errorMap, setErrorMap] = useState(() => getInitialOrderFormErrorMap());
    const [showContinue, setShowContinue] = useState<boolean>(false);

    const resetForm = () => {
        setValues(getInitialFormState());
        setErrorMap(getInitialOrderFormErrorMap());
    };

    const handleCreateTShirtOrders = (
        order: PurchaseOrderOrCustomerOrder,
        orderedItems: TShirtOrder[]
    ) => {
        rescueDBOperation(
            () => createTShirtOrderAPI(order, orderedItems),
            DBOperation.CREATE,
            () => {
                // All operations (create PO or CustomerOrder and all TShirtOrders) were a success
                setShowContinue(true);
                resetForm();
            }
        );
    };

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
            else if (columnInfo.get(key)?.isPhoneNumField && value !== "") {
                const dashSplit = value.split('-');
                const whitespaceSplit = value.split(' ');
                if(dashSplit.length !== 3 && whitespaceSplit.length !== 3)
                    errMsg = "Phone Number format must conform to either: xxx-xxx-xxxx or xxx xxx xxxx"
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
                else if (columnInfo.get(key)?.isPhoneNumField && values[key] !== "") {
                    order[key] = "+1" + values[key];
                }
                // This field had to be optional
                else if (values[key] === "") {
                    order[key] = undefined;
                }
                else {
                    order[key] = values[key];
                }
            });
            handleCreateOrder(order, handleCreateTShirtOrders);
        }
    };

    const columns = useMemo<MRT_ColumnDef<T>[]>(
        () => getTableColumns(),
        []
    );

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
                            .map((column) => {
                                const errMsg = errorMap.get(column.accessorKey as string);
                                const hasError = errMsg !== "" && errMsg !== undefined;
                                const colInfo = columnInfo.get(column.accessorKey);
                                return colInfo?.isDatetimeField ? (
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
                                ) : (
                                    <TextField
                                        select={colInfo?.selectFields !== undefined}
                                        key={column.accessorKey as React.Key}
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
                            })
                        }
                        <TShirtOrderTable
                            tableData={values.orderedItems}
                            setTableData={(newValues) =>
                                setValues({ ...values, orderedItems: newValues })
                            }
                            parentOrderId={undefined}
                            onRowEdit={(
                                row: MRT_Row<TShirtOrder>,
                                orderChange: any,
                                exitEditingMode: () => void
                            ) => {
                                const tableData = values.orderedItems;
                                const prevTShirtOrder = row.original;
                                const prevAmtReceived = prevTShirtOrder.amountReceived ? prevTShirtOrder.amountReceived : 0;
                                tableData[row.index] = {
                                    ...prevTShirtOrder, 
                                    quantity: prevTShirtOrder.quantity + orderChange.orderedQuantityChange, 
                                    amountReceived: prevAmtReceived + orderChange.quantityChange
                                } as TShirtOrder;
                                setValues({...values, orderedItems: [...tableData]});
                                exitEditingMode();
                            }}
                            onRowAdd={() => { }}
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