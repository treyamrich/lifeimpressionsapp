"use client";

import { TShirt, TShirtOrder } from "@/API";
import React, { useMemo, useState, useCallback } from "react";
import { Delete, Edit } from "@mui/icons-material";
import { deleteTShirtOrderAPI } from "@/app/graphql-helpers/delete-apis";
import {
    type DBOperationError,
    defaultDBOperationError,
    rescueDBOperation,
    DBOperation,
} from "@/app/graphql-helpers/graphql-errors";
import {
    tablePrimaryKey,
    modalTitle,
    excludeOnCreateFields,
    initialTShirtOrderFormState,
    getInitialTShirtOrderFormErrorMap,
    getTableColumns,
    numberInputFields
} from "./table-constants";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Autocomplete,
    Tooltip,
} from "@mui/material";
import {
    MaterialReactTable,
    type MaterialReactTableProps,
    type MRT_ColumnDef,
    type MRT_Cell,
    type MRT_Row,
    type MRT_ColumnFiltersState,
} from "material-react-table";
import { mockData } from "../../inventory/table-constants";

interface TShirtOrderTableProps {
    tableData: TShirtOrder[],
    setTableData: React.Dispatch<React.SetStateAction<TShirtOrder[]>>
}

const TShirtOrderTable = ({ tableData, setTableData }: TShirtOrderTableProps) => {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{
        [cellId: string]: string;
    }>({});
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
        []
    );
    const [dbOperationError, setDBOperationError] = useState({
        ...defaultDBOperationError,
    } as DBOperationError);

    const handleCreateNewRow = (values: TShirtOrder) => {
        setTableData([...tableData, values]);
    };

    const handleSaveRowEdits: MaterialReactTableProps<TShirtOrder>["onEditingRowSave"] =
        async ({ exitEditingMode, row, values }) => {
            if (!Object.keys(validationErrors).length) {
                tableData[row.index] = values;
                setTableData([...tableData]);
                exitEditingMode(); //required to exit editing mode and close modal
            }
        };

    const handleCancelRowEdits = () => {
        setValidationErrors({});
    };

    const handleDeleteRow = useCallback(
        (row: MRT_Row<TShirtOrder>) => {
            if (
                !confirm(
                    `Are you sure you want to delete ${row.getValue(tablePrimaryKey)}`
                )
            ) {
                return;
            }
            rescueDBOperation(
                () => deleteTShirtOrderAPI({ id: row.original.id }),
                setDBOperationError,
                DBOperation.DELETE,
                () => {
                    tableData.splice(row.index, 1);
                    setTableData([...tableData]);
                }
            );
        },
        [tableData]
    );

    const getCommonEditTextFieldProps = useCallback(
        (
            cell: MRT_Cell<TShirtOrder>
        ): MRT_ColumnDef<TShirtOrder>["muiTableBodyCellEditTextFieldProps"] => {
            return {
                error: !!validationErrors[cell.id],
                helperText: validationErrors[cell.id],
                onBlur: (event) => {
                    let isValid = true;
                    switch (cell.column.id) {
                        case "quantityOnHand":
                            isValid = isValid && validateQuantity(+event.target.value);
                            break;
                        default:
                            isValid = isValid && validateRequired(event.target.value);
                    }
                    if (!isValid) {
                        //set validation error for cell if invalid
                        setValidationErrors({
                            ...validationErrors,
                            [cell.id]: `${cell.column.columnDef.header} is required`,
                        });
                    } else {
                        //remove validation error for cell if valid
                        delete validationErrors[cell.id];
                        setValidationErrors({
                            ...validationErrors,
                        });
                    }
                },
            };
        },
        [validationErrors]
    );

    const columns = useMemo<MRT_ColumnDef<TShirtOrder>[]>(
        () => getTableColumns(getCommonEditTextFieldProps),
        [getCommonEditTextFieldProps]
    );

    return (
        <>
            <MaterialReactTable
                displayColumnDefOptions={{
                    "mrt-row-actions": {
                        muiTableHeadCellProps: {
                            align: "center",
                        },
                        size: 120,
                    },
                }}
                columns={columns}
                data={tableData}
                initialState={{ showColumnFilters: true }}
                editingMode="modal" //default
                enableColumnOrdering
                onColumnFiltersChange={setColumnFilters}
                state={{
                    columnFilters,
                }}
                enableEditing
                onEditingRowSave={handleSaveRowEdits}
                onEditingRowCancel={handleCancelRowEdits}
                renderRowActions={({ row, table }) => (
                    <Box sx={{ display: "flex", gap: "1rem" }}>
                        <Tooltip arrow placement="left" title="Edit">
                            <IconButton onClick={() => table.setEditingRow(row)}>
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="right" title="Delete">
                            <IconButton
                                color="error"
                                onClick={() => handleDeleteRow(row)}
                            >
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                renderTopToolbarCustomActions={() => (
                    <Button
                        color="secondary"
                        onClick={() => setCreateModalOpen(true)}
                        variant="contained"
                    >
                        {modalTitle}
                    </Button>
                )}
            />
            <CreateTShirtOrderModal
                columns={columns}
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreateNewRow}
                records={tableData}
            />
        </>
    );
};

export default TShirtOrderTable;

interface CreateTShirtOrderModal<TShirtOrder extends Record<string, any>> {
    columns: MRT_ColumnDef<TShirtOrder>[];
    onClose: () => void;
    onSubmit: (values: TShirtOrder) => void;
    open: boolean;
    records: TShirtOrder[];
}

const CreateTShirtOrderModal = <TShirtOrder extends Record<string, any>>({
    open,
    columns,
    onClose,
    onSubmit,
    records,
}: CreateTShirtOrderModal<TShirtOrder>) => {
    //Initial TShirtOrder values
    const [values, setValues] = useState<any>(() => {
        return { ...initialTShirtOrderFormState };
    });
    const [errorMap, setErrorMap] = useState(
        () =>
            new Map<string, string>(
                Object.keys(initialTShirtOrderFormState).map((key) => [key, ""])
            )
    );
    const [autoCompleteInputVal, setAutoCompleteInputVal] = useState('');


    const resetForm = () => {
        setValues({ ...initialTShirtOrderFormState });
        setErrorMap(getInitialTShirtOrderFormErrorMap());
    };
    const handleClose = () => {
        resetForm();
        onClose();
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
            } else if (value.toString().length < 1) {
                errMsg = "Field is required";
            } else if (
                key === "styleNumber" &&
                records.reduce(
                    (prev, curr) => prev || curr.styleNumber === value,
                    false
                )
            ) {
                //Enforce primary key attribute
                errMsg = "Duplicate style numbers not allowed";
            }
            newErrors.set(key, errMsg);
            allValid = allValid && errMsg === "";
        });
        setErrorMap(newErrors);

        if (allValid) {
            onSubmit(values);
            resetForm();
            onClose();
        }
    };

    return (
        <Dialog open={open}>
            <DialogTitle textAlign="center">{modalTitle}</DialogTitle>
            <DialogContent style={{ padding: "25px" }}>
                <form onSubmit={(e) => e.preventDefault()}>
                    <Stack
                        sx={{
                            width: "100%",
                            minWidth: { xs: "300px", sm: "360px", md: "400px" },
                            gap: "1.5rem",
                        }}
                    >
                        {columns.filter(
                            (col) =>
                                !excludeOnCreateFields.includes(col.accessorKey as string)
                        ).map((column) => (
                            <TextField
                                key={column.accessorKey as React.Key}
                                label={column.header}
                                name={column.accessorKey as string}
                                onChange={(e) =>
                                    setValues({ ...values, [e.target.name]: e.target.value })
                                }
                                type={isNumberInputField(column.accessorKey) ? "number" : undefined}
                                variant="standard"
                                value={values[column.accessorKey]}
                                required={true}
                                error={errorMap.get(column.accessorKey as string) !== ""}
                                helperText={errorMap.get(column.accessorKey as string)}
                            />
                        ))}
                        <Autocomplete
                            id="auto-complete"
                            options={mockData}
                            getOptionLabel={(option: TShirt) => option.styleNumber}
                            autoComplete
                            renderInput={(params) => (
                                <TextField {...params} label="TShirt Style No." variant="standard" />
                            )}
                        />
                    </Stack>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: "1.25rem" }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button color="secondary" onClick={handleSubmit} variant="contained">
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const validateRequired = (value: string) => !!value.length;
const validateQuantity = (qty: number) => {
    return qty >= 0;
};

const isNumberInputField = (
    fieldName: string | number | symbol | undefined
  ) => {
    let nameOfField = fieldName ? fieldName.toString() : "";
    return numberInputFields.has(nameOfField);
  }