"use client";

import { TShirt, TShirtOrder } from "@/API";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Delete, Edit } from "@mui/icons-material";
import { deleteTShirtOrderAPI } from "@/app/graphql-helpers/delete-apis";
import {
  type DBOperationError,
  defaultDBOperationError,
  rescueDBOperation,
  DBOperation,
} from "@/app/graphql-helpers/graphql-errors";
import { modalTitle, getTableColumns } from "./table-constants";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import {
  MaterialReactTable,
  type MaterialReactTableProps,
  type MRT_ColumnDef,
  type MRT_Cell,
  type MRT_Row,
  type MRT_ColumnFiltersState,
} from "material-react-table";
import { listTShirtAPI } from "@/app/graphql-helpers/fetch-apis";
import CreateTShirtOrderModal from "./CreateTShirtOrderModal";
import EditRowPopup from "./EditRowPopup";

interface TShirtOrderTableProps {
  tableData: TShirtOrder[];
  setTableData: React.Dispatch<React.SetStateAction<TShirtOrder[]>>;
}

const TShirtOrderTable = ({
  tableData,
  setTableData,
}: TShirtOrderTableProps) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [afterEditRowModalOpen, setAfterEditRowModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [dbOperationError, setDBOperationError] = useState({
    ...defaultDBOperationError,
  } as DBOperationError);
  const [tshirtChoices, setTShirtChoices] = useState<TShirt[]>([]);

  const handleCreateNewRow = (values: TShirtOrder) => {
    setTableData([...tableData, values]);
  };

  const handleSaveRowEdits: MaterialReactTableProps<TShirtOrder>["onEditingRowSave"] =
    async ({ exitEditingMode, row, values }) => {
      if (Object.keys(validationErrors).length) return;

      tableData[row.index] = values;
      setTableData([...tableData]);
      exitEditingMode(); //required to exit editing mode and close modal
      setAfterEditRowModalOpen(true);
    };

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const handleEditRowAudit = () => {
    console.log("The user edited this row");
    setAfterEditRowModalOpen(false);
  };

  const handleDeleteRow = useCallback(
    (row: MRT_Row<TShirtOrder>) => {
      if (!confirm(`Are you sure you want to remove from order`)) {
        return;
      }
      tableData.splice(row.index, 1);
      setTableData([...tableData]);
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

  const fetchTShirts = () => {
    const deletedFilter = { isDeleted: { ne: true } };
    rescueDBOperation(
      () => listTShirtAPI(deletedFilter),
      setDBOperationError,
      DBOperation.LIST,
      (resp: TShirt[]) => setTShirtChoices(resp)
    );
  };

  useEffect(() => {
    fetchTShirts();
  }, []);

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
              <IconButton color="error" onClick={() => handleDeleteRow(row)}>
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
            {modalTitle}
          </Button>
        )}
      />
      <CreateTShirtOrderModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
        tshirtChoices={tshirtChoices}
      />
      <EditRowPopup
        open={afterEditRowModalOpen}
        onSubmit={handleEditRowAudit}
        title="Audit editing purchase order"
      />
    </>
  );
};

export default TShirtOrderTable;

const validateRequired = (value: string) => !!value.length;
const validateQuantity = (qty: number) => {
  return qty >= 0;
};
