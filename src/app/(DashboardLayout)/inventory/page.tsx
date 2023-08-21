"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { TShirt } from "@/API";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Delete, Edit } from "@mui/icons-material";
import { createTShirtAPI } from "@/app/graphql-helpers/create-apis";
import { listTShirtAPI } from "@/app/graphql-helpers/fetch-apis";
import {
  type DBOperationError,
  DBOperation,
  defaultDbOperationError,
} from "@/app/graphql-helpers/graphql-errors";
import {
  tablePrimaryKey,
  entityName,
  selectInputFields,
  excludeOnCreateFields,
  mockData,
  type SelectValue,
  TShirtFormError,
  initialTShirtFormState,
  getInitialTShirtFormErrorMap,
  getTableColumns,
} from "./table-constants";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  MenuItem,
} from "@mui/material";
import {
  MaterialReactTable,
  type MaterialReactTableProps,
  type MRT_ColumnDef,
  type MRT_Cell,
  type MRT_Row,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";

const Inventory = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState<TShirt[]>(() => mockData);
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [dbOperationError, setDbOperationError] = useState({
    ...defaultDbOperationError,
  } as DBOperationError);

  const handleCreateNewRow = async (values: TShirt): Promise<void> => {
    const resp = await createTShirtAPI(values);
    "operationName" in resp ? setDbOperationError(resp) :
    setTableData([...tableData, resp]);
  };

  const handleSaveRowEdits: MaterialReactTableProps<TShirt>["onEditingRowSave"] =
    async ({ exitEditingMode, row, values }) => {
      if (!Object.keys(validationErrors).length) {
        tableData[row.index] = values;
        //send/receive api updates here, then refetch or update local table data for re-render
        setTableData([...tableData]);
        exitEditingMode(); //required to exit editing mode and close modal
      }
    };

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const handleDeleteRow = useCallback(
    (row: MRT_Row<TShirt>) => {
      if (
        !confirm(
          `Are you sure you want to delete ${row.getValue(tablePrimaryKey)}`
        )
      ) {
        return;
      }
      //send api delete request here, then refetch or update local table data for re-render
      tableData.splice(row.index, 1);
      setTableData([...tableData]);
    },
    [tableData]
  );

  const getCommonEditTextFieldProps = useCallback(
    (
      cell: MRT_Cell<TShirt>
    ): MRT_ColumnDef<TShirt>["muiTableBodyCellEditTextFieldProps"] => {
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

  const columns = useMemo<MRT_ColumnDef<TShirt>[]>(
    () => getTableColumns(getCommonEditTextFieldProps),
    [getCommonEditTextFieldProps]
  );

  const fetchTShirts = async () => {
    const resp = await listTShirtAPI();
    "operationName" in resp ? setDbOperationError(resp) : setTableData(resp);
  };

  useEffect(() => {
    fetchTShirts();
  }, []);
  return (
    <PageContainer title="Inventory" description="this is Inventory">
      {dbOperationError.errorMessage !== undefined ? (
        <Alert
          severity="error"
          onClose={() => setDbOperationError({ ...defaultDbOperationError })}
        >
          {dbOperationError.errorMessage}
        </Alert>
      ) : (
        <></>
      )}
      <DashboardCard title="Inventory">
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
            state={{ columnFilters }}
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
                Create New {entityName}
              </Button>
            )}
          />
          <CreateModal
            columns={columns}
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={handleCreateNewRow}
            entityName={entityName}
          />
        </>
      </DashboardCard>
    </PageContainer>
  );
};

export default Inventory;

interface CreateModalProps<TShirt extends Record<string, any>> {
  columns: MRT_ColumnDef<TShirt>[];
  onClose: () => void;
  onSubmit: (values: TShirt) => void;
  open: boolean;
  entityName: String;
}

const CreateModal = <TShirt extends Record<string, any>>({
  open,
  columns,
  onClose,
  onSubmit,
  entityName,
}: CreateModalProps<TShirt>) => {
  //Initial TShirt values
  const [values, setValues] = useState<any>(() => {
    return { ...initialTShirtFormState };
  });
  const [errorMap, setErrorMap] = useState(
    () =>
      new Map<string, string>(
        Object.keys(initialTShirtFormState).map((key) => [key, ""])
      )
  );

  const resetForm = () => {
    setValues({ ...initialTShirtFormState });
    setErrorMap(getInitialTShirtFormErrorMap());
  };
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const newErrors = new Map<string, string>(errorMap);
    let allValid = true;
    Object.keys(values).forEach((key) => {
      let errMsg = validateFormFieldValue(key, values[key]).message;
      newErrors.set(key, errMsg);
      allValid = allValid && errMsg === "";
    });

    if (!allValid) {
      setErrorMap(newErrors);
      return;
    }

    onSubmit(values);
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">Create New {entityName}</DialogTitle>
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
                  value={values[column.accessorKey]}
                  required={true}
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
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: "1.25rem" }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button color="secondary" onClick={handleSubmit} variant="contained">
          Create New {entityName}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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

const validateFormFieldValue = (
  columnName: string,
  value: any
): TShirtFormError => {
  let errMsg = "";
  if (columnName === "quantityOnHand" && value < 0) {
    errMsg = "Qty. must be non-negative";
  } else if (value.toString().length < 1) {
    errMsg = "Field is required";
  }
  return { message: errMsg };
};
