"use client";

import {
  CreateOrderChangeInput,
  TShirt,
  TShirtOrder,
} from "@/API";
import React, { useMemo, useState, useEffect } from "react";
import { modalTitle, getTableColumns, TShirtOrderFields } from "./table-constants";
import { Button } from "@mui/material";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_ColumnFiltersState,
} from "material-react-table";
import { ListAPIResponse, listTShirtAPI } from "@/graphql-helpers/fetch-apis";
import CreateTShirtOrderModal from "./CreateTShirtOrder/CreateTShirtOrderModal";
import EditRowPopup from "./EditTShirtOrder/EditTShirtOrderPopup";
import { useDBOperationContext, DBOperation } from "@/contexts/DBErrorContext";
import { EntityType } from "../po-customer-order-shared-components/CreateOrderPage";
import TableToolbar from "../Table/TableToolbar";
import TableRowActions from "../Table/TableRowActions";

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
    orderChange: CreateOrderChangeInput,
    closeFormCallback: () => void
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
      () => listTShirtAPI({
        filters: deletedFilter,
        doCompletePagination: true
      }),
      DBOperation.LIST,
      (resp: ListAPIResponse<TShirt>) => setTShirtChoices(resp.result)
    );
  };

  useEffect(() => {
    fetchTShirts();
  }, []);

  const hiddenColumns = { id: false } as any;
  if (entityType === EntityType.CustomerOrder || mode === TableMode.Create) {
    hiddenColumns[TShirtOrderFields.AmtReceived] = false;
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
        enableEditing
        renderRowActions={({ row, table }) => (
          <TableRowActions
            onEdit={()=>setEditMode({ show: true, row: row })}
            showEditButton
          />
        )}
        renderTopToolbarCustomActions={() => (
          <TableToolbar 
            showAddButton={true}
            onAdd={() => setCreateModalOpen(true)}
          />
        )}
      />
      <CreateTShirtOrderModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={onRowAdd}
        tshirtChoices={tshirtChoices}
        tableData={tableData}
        entityType={entityType}
        parentOrderId={parentOrderId}
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
