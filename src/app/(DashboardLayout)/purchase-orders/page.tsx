"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { PurchaseOrder } from "@/API";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Delete, Edit } from "@mui/icons-material";
//import { createPurchaseOrderAPI } from "@/app/graphql-helpers/create-apis";
//import { listPurchaseOrderAPI } from "@/app/graphql-helpers/fetch-apis";
//import { updatePurchaseOrderAPI } from "@/app/graphql-helpers/update-apis";
import { toReadableDateTime } from "@/utils/datetimeConversions";

import {
  type DBOperationError,
  defaultDBOperationError,
  rescueDBOperation,
  DBOperation,
} from "@/app/graphql-helpers/graphql-errors";
import {
  initialPurchaseOrderFormState,
  excludeOnCreateFields,
  tablePrimaryKey,
  entityName,
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
  const [tableData, setTableData] = useState<PurchaseOrder[]>([]);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [dbOperationError, setDBOperationError] = useState({
    ...defaultDBOperationError,
  } as DBOperationError);

  const handleCreateNewRow = (values: PurchaseOrder) => {
    rescueDBOperation(
      () => createPurchaseOrderAPI(values),
      setDBOperationError,
      DBOperation.CREATE,
      (resp: PurchaseOrder) => setTableData([...tableData, resp])
    );
  };

  const handleDeleteRow = useCallback(
    (row: MRT_Row<PurchaseOrder>) => {
      if (
        !confirm(
          `Are you sure you want to delete ${row.getValue(tablePrimaryKey)}`
        )
      ) {
        return;
      }
      const deletedPurchaseOrder = { ...row.original, isDeleted: true };
      rescueDBOperation(
        () => updatePurchaseOrderAPI(deletedPurchaseOrder),
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

  const columns = useMemo<MRT_ColumnDef<PurchaseOrder>[]>(
    () => getTableColumns(),
    []
  );

  const fetchPurchaseOrders = () => {
    const deletedFilter = { isDeleted: { ne: true } };
    rescueDBOperation(
      () => listPurchaseOrderAPI(deletedFilter),
      setDBOperationError,
      DBOperation.LIST,
      (resp: PurchaseOrder[]) => {
        setTableData(
          resp.map((PurchaseOrder: PurchaseOrder) => {
            return {
              ...PurchaseOrder,
              updatedAt: toReadableDateTime(PurchaseOrder.updatedAt),
            };
          })
        );
      }
    );
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);
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
            state={{
              columnFilters,
            }}
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
            records={tableData}
          />
        </>
      </DashboardCard>
    </PageContainer>
  );
};

export default Inventory;

interface CreateModalProps<PurchaseOrder extends Record<string, any>> {
  columns: MRT_ColumnDef<PurchaseOrder>[];
  onClose: () => void;
  onSubmit: (values: PurchaseOrder) => void;
  open: boolean;
  entityName: String;
  records: PurchaseOrder[];
}

const CreateModal = <PurchaseOrder extends Record<string, any>>({
  open,
  columns,
  onClose,
  onSubmit,
  entityName,
  records,
}: CreateModalProps<PurchaseOrder>) => {
  //Initial PurchaseOrder values
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
