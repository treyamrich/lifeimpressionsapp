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
import { listTShirtAPI } from "@/graphql-helpers/fetch-apis";
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
    callback: (newTShirtOrderId: string) => void
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
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [tshirtChoices, setTShirtChoices] = useState<TShirt[]>([]);

  const handleCreateNewRow = (values: TShirtOrder, closeFormCallback: () => void) => {
    onRowAdd(
      values,
      (newTShirtOrderId: string) => {
        values.id = newTShirtOrderId;
        setTableData([...tableData, values]);
        closeFormCallback();
      }
    );
  };

  const handleEditRowAudit = (orderChange: CreateOrderChangeInput, resetEditFormCallback: () => void) => {
    const row = editMode.row;
    if (!row) return;
    onRowEdit(
      row, 
      orderChange, 
      () => {
        setEditMode({ show: false, row: undefined });
        resetEditFormCallback();
      });
  };

  const columns = useMemo<MRT_ColumnDef<TShirtOrder>[]>(
    () => getTableColumns(),
    []
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
