"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import React, { useMemo, useState } from "react";
import {
    type DBOperationError,
    defaultDBOperationError,
    rescueDBOperation,
    DBOperation,
} from "@/app/graphql-helpers/graphql-errors";
import {
    Alert,
    TextField,
    Stack,
    MenuItem,
    Card,
    CardContent,
    Typography,
} from "@mui/material";
import {
    initialPurchaseOrderFormState,
    excludeOnCreateFields,
    selectInputFields,
    type SelectValue,
    getInitialPurchaseOrderFormErrorMap,
    tablePrimaryKey,
    entityName,
    getTableColumns,
    isRequiredField
} from "../table-constants";
import { MRT_ColumnDef } from "material-react-table";
import { PurchaseOrder } from "@/API";
import TShirtOrderTable from "../../components/tshirt-order-table/TShirtOrderTable";

const CreatePurchaseOrderPage = () => {
    const [dbOperationError, setDBOperationError] = useState({
        ...defaultDBOperationError,
    } as DBOperationError);

    return (
        <PageContainer title="Purchase Orders" description="this is Purchase Orders page">
            {dbOperationError.errorMessage !== undefined ? (
                <Alert
                    severity="error"
                    onClose={() => setDBOperationError({ ...defaultDBOperationError })}
                >
                    {dbOperationError.errorMessage}
                </Alert>
            ) : (
                <></>
            )}
            <DashboardCard title="New Purchase Order">
                <CreatePurchaseOrderForm />
            </DashboardCard>
        </PageContainer>
    )
}

export default CreatePurchaseOrderPage;

const CreatePurchaseOrderForm = () => {
    const [values, setValues] = useState<any>(() => {
        return { ...initialPurchaseOrderFormState };
    });
    const [errorMap, setErrorMap] = useState(
        () =>
            new Map<string, string>(
                Object.keys(initialPurchaseOrderFormState).map((key) => [key, ""])
            )
    );

    const resetForm = () => {
        setValues({ ...initialPurchaseOrderFormState });
        setErrorMap(getInitialPurchaseOrderFormErrorMap());
    };

    const handleSubmit = () => {
        //Validate input
        const newErrors = new Map<string, string>(errorMap);
        let allValid = true;
        Object.keys(values).forEach((key) => {
            let errMsg = "";
            let value = values[key];
            if (key === "quantityOnHand" && value < 0) {
                errMsg = "Qty. must be non-negative";
            } else if (isRequiredField(key) && value.toString().length < 1) {
                errMsg = "Field is required";
            }
            newErrors.set(key, errMsg);
            allValid = allValid && errMsg === "";
        });
        setErrorMap(newErrors);

        if (allValid) {
            resetForm();
        }
    };

    const columns = useMemo<MRT_ColumnDef<PurchaseOrder>[]>(
        () => getTableColumns(),
        []
    );

    return (
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
                        (col) =>
                            !excludeOnCreateFields.includes(col.accessorKey as string)
                    )
                    .map((column) => (
                        <TextField
                            select={isSelectInputField(column.accessorKey)}
                            key={column.accessorKey as React.Key}
                            label={column.header}
                            name={column.accessorKey as string}
                            onChange={(e) =>
                                setValues({ ...values, [e.target.name]: e.target.value })
                            }
                            value={values[column.accessorKey as string]}
                            required={isRequiredField(column.accessorKey as string)}
                            error={errorMap.get(column.accessorKey as string) !== ""}
                            helperText={errorMap.get(column.accessorKey as string)}
                        >
                            {isSelectInputField(column.accessorKey) &&
                                selectInputFields
                                    .get(column.accessorKey)
                                    ?.map((selectValue: SelectValue, idx: number) => (
                                        <MenuItem key={idx} value={selectValue.value}>
                                            {selectValue.label}
                                        </MenuItem>
                                    ))}
                        </TextField>
                    ))}
                <TShirtOrderTable
                    tableData={[]}
                    setTableData={() => { }}
                />
            </Stack>
        </form>
    );
}

const validateRequired = (value: string) => !!value.length;
const validateQuantity = (qty: number) => {
    return qty >= 0;
};

const isSelectInputField = (
    fieldName: string | number | symbol | undefined
) => {
    let nameOfField = fieldName ? fieldName.toString() : "";
    return selectInputFields.has(nameOfField);
};