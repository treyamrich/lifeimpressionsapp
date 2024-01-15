"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { TShirt } from "@/API";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Delete, Edit } from "@mui/icons-material";
import { createTShirtAPI } from "@/graphql-helpers/create-apis";
import { listTShirtAPI } from "@/graphql-helpers/fetch-apis";
import { updateTShirtAPI } from "@/graphql-helpers/update-apis";
import { toReadableDateTime } from "@/utils/datetimeConversions";

import {
  DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";
import {
  tshirtPrimaryKey,
  entityName,
  getTableColumns,
} from "./table-constants";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  MaterialReactTable,
  type MaterialReactTableProps,
  type MRT_ColumnDef,
  type MRT_Cell,
  type MRT_Row,
  type MRT_ColumnFiltersState
} from "material-react-table";
import CreateTShirtModal from "../components/forms/create-entity-forms/tshirt/CreateTShirtModal";

const Inventory = () => {
  const { rescueDBOperation } = useDBOperationContext();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState<TShirt[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );

  const handleCreateNewRow = (values: TShirt) => {
    rescueDBOperation(
      () => createTShirtAPI(values),
      DBOperation.CREATE,
      (resp: TShirt) => setTableData([...tableData, resp])
    );
  };

  const handleSaveRowEdits: MaterialReactTableProps<TShirt>["onEditingRowSave"] =
    async ({ exitEditingMode, row, values }) => {
      if (!Object.keys(validationErrors).length) {
        rescueDBOperation(
          () => updateTShirtAPI(values),
          DBOperation.UPDATE,
          (resp: TShirt) => {
            tableData[row.index] = resp;
            setTableData([...tableData]);
          }
        );
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
          `Are you sure you want to delete ${row.getValue(tshirtPrimaryKey)}`
        )
      ) {
        return;
      }
      const deletedTShirt = { ...row.original, isDeleted: true };
      rescueDBOperation(
        () => updateTShirtAPI(deletedTShirt),
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
      cell: MRT_Cell<TShirt>
    ): MRT_ColumnDef<TShirt>["muiTableBodyCellEditTextFieldProps"] => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
        onBlur: (event) => {
          let isValid = true;
          let errMsg = "";
          switch (cell.column.id) {
            case "quantityOnHand":
              isValid = isValid && validateQuantity(+event.target.value);
              errMsg = "must be non-negative";
              break;
            default:
              isValid = isValid && validateRequired(event.target.value);
              errMsg = "is required";
          }
          if (!isValid) {
            //set validation error for cell if invalid
            setValidationErrors({
              ...validationErrors,
              [cell.id]: `${cell.column.columnDef.header} ${errMsg}`,
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

  const fetchTShirts = () => {
    const deletedFilter = { isDeleted: { ne: true } };
    rescueDBOperation(
      () => listTShirtAPI(deletedFilter),
      DBOperation.LIST,
      (resp: TShirt[]) => {
        setTableData(
          resp.map((tshirt: TShirt) => {
            return {
              ...tshirt,
              updatedAt: toReadableDateTime(tshirt.updatedAt),
            };
          })
        );
      }
    );
  };

  useEffect(() => {
    fetchTShirts();
  }, []);
  return (
    <PageContainer title="Inventory" description="this is Inventory">
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
                color="primary"
                onClick={() => setCreateModalOpen(true)}
                variant="contained"
              >
                Add New Item
              </Button>
            )}
          />
          <CreateTShirtModal
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

const validateRequired = (value: string) => !!value.length;
const validateQuantity = (qty: number) => {
  return qty >= 0;
};