"use client";

import {
  TShirt,
  TShirtOrder,
} from "@/API";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Delete, Edit } from "@mui/icons-material";
import { modalTitle, getTableColumns, amountReceivedField, CreateOrderChangeInput } from "./table-constants";
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
import { useDBOperationContext, DBOperation } from "@/contexts/DBErrorContext";
import { EntityType } from "../po-customer-order-shared-components/CreateOrderPage";

interface TShirtOrderTableProps {
  tableData: TShirtOrder[];
  setTableData: React.Dispatch<React.SetStateAction<TShirtOrder[]>>;
  parentOrderId: string | undefined;
  onRowEdit: (
    row: MRT_Row<TShirtOrder>,
    orderChange: CreateOrderChangeInput,
    exitEditingMode: () => void
  ) => void | undefined;
  onRowAdd: (
    newRowValue: TShirtOrder,
  ) => void | undefined;
  entityType: EntityType;
  mode: TableMode;
}

export enum TableMode {
  Create = "create",
  Edit = "edit"
};

type EditMode = {
  show: boolean;
  row: MRT_Row<TShirtOrder> | undefined;
};

const TShirtOrderTable = ({
  tableData,
  setTableData,
  parentOrderId,
  onRowEdit,
  onRowAdd,
  entityType,
  mode
}: TShirtOrderTableProps) => {
  const { rescueDBOperation } = useDBOperationContext();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>({
    show: false,
    row: undefined,
  });
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [tshirtChoices, setTShirtChoices] = useState<TShirt[]>([]);

  const handleCreateNewRow = (values: TShirtOrder) => {
    setTableData([...tableData, values]);
    onRowAdd(values);
  };

  const handleEditRowAudit = (orderChange: CreateOrderChangeInput) => {
    const row = editMode.row;
    if (!row) return;
    onRowEdit(row, orderChange, () => setEditMode({ show: false, row: undefined }));
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

  // These are for editing using Material React Table edit modal component
  const getCommonEditTextFieldProps = useCallback(
    (
      cell: MRT_Cell<TShirtOrder>
    ): MRT_ColumnDef<TShirtOrder>["muiTableBodyCellEditTextFieldProps"] => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
        onBlur: (event) => {
          let isValid = true;
          let errMsg = "";
          switch (cell.column.id) {
            case "quantity":
            case "amountReceived":
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

  const columns = useMemo<MRT_ColumnDef<TShirtOrder>[]>(
    () => getTableColumns(getCommonEditTextFieldProps),
    [getCommonEditTextFieldProps]
  );

  const fetchTShirts = () => {
    const deletedFilter = { isDeleted: { ne: true } };
    rescueDBOperation(
      () => listTShirtAPI(deletedFilter),
      DBOperation.LIST,
      (resp: TShirt[]) => setTShirtChoices(resp)
    );
  };

  useEffect(() => {
    fetchTShirts();
  }, []);

  const hiddenColumns = { id: false } as any;
  if (entityType === EntityType.CustomerOrder || mode === TableMode.Create) {
    hiddenColumns[amountReceivedField] = false;
  }

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
          columnVisibility: hiddenColumns
        }}
        muiTableBodyRowProps={
          ({ row }: { row: any }) => ({
            onClick: () => {
              setEditMode({ show: true, row: row });
            },
            sx: {
              cursor: "pointer", //you might want to change the cursor too when adding an onClick
            },
          })}
        enableEditing={undefined}
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
        tableData={tableData}
        entityType={entityType}
      />
      <EditRowPopup
        open={editMode.show}
        row={editMode.row}
        onSubmit={handleEditRowAudit}
        onClose={() => setEditMode({ show: false, row: undefined })}
        title="Edit"
        parentOrderId={parentOrderId}
        entityType={entityType}
        mode={mode}
      />
    </>
  );
};

export default TShirtOrderTable;

const validateRequired = (value: string) => !!value.length;
const validateQuantity = (qty: number) => {
  return qty >= 0;
};
