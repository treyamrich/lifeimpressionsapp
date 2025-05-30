"use client";

import { CreateOrderChangeInput, CustomerOrder, PurchaseOrder, TShirt, TShirtOrder } from "@/API";
import React, { useMemo, useState, useEffect } from "react";
import { getTableColumns, TShirtOrderFields, TShirtOrderMoneyAwareForm } from "./table-constants";
import {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_ColumnFiltersState,
} from "material-react-table";
import CreateTShirtOrderModal from "./CreateTShirtOrder/CreateTShirtOrderModal";
import EditRowPopup from "./EditTShirtOrder/EditTShirtOrderPopup";
import { useDBOperationContext } from "@/contexts/DBErrorContext";
import { EntityType } from "../po-customer-order-shared-components/CreateOrderPage";
import TableToolbar from "../Table/TableToolbar";
import TableRowActions from "../Table/TableRowActions";
import { fetchAllNonDeletedTShirts } from "../../inventory/util";
import { Dayjs } from "dayjs";
import { Page } from "@/api/types";
import { MRTable } from "../Table/MRTable";

export type EditTShirtOrderResult = {
  row: MRT_Row<TShirtOrder>;
  updatedTShirtOrder: TShirtOrder;
  orderChange: CreateOrderChangeInput;
  exitEditingMode: () => void;
  poItemDateReceived?: Dayjs;
}

interface TShirtOrderTableProps {
  tableData: TShirtOrder[];
  setTableData: React.Dispatch<React.SetStateAction<TShirtOrder[]>>;
  parentOrder: PurchaseOrder | CustomerOrder | undefined;
  onRowEdit: (res: EditTShirtOrderResult) => void | undefined;
  onRowAdd: (
    newRowValue: TShirtOrderMoneyAwareForm,
    orderChange: CreateOrderChangeInput,
    closeFormCallback: () => void
  ) => void | undefined;
  onRowDelete?: (row: MRT_Row<TShirtOrder>) => void;
  onReceiveAllItems?: () => void;
  receiveAllDisabled?: boolean;
  entityType: EntityType;
  mode: TableMode;
}

export enum TableMode {
  Create = "create",
  Edit = "edit",
}

type EditMode = {
  show: boolean;
  row: MRT_Row<TShirtOrder> | undefined;
};

const TShirtOrderTable = ({
  tableData,
  setTableData,
  parentOrder,
  onRowEdit,
  onRowAdd,
  onRowDelete,
  onReceiveAllItems,
  receiveAllDisabled,
  entityType,
  mode,
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

  const handleEditRowAudit = (
    orderChange: CreateOrderChangeInput,
    newTShirtOrder: TShirtOrder,
    resetEditFormCallback: () => void,
    poItemDateReceived?: Dayjs,
  ) => {
    const row = editMode.row;
    if (!row) return;
    onRowEdit({
      row, 
      updatedTShirtOrder: newTShirtOrder,
      orderChange, 
      exitEditingMode: () => {
        setEditMode({ show: false, row: undefined });
        resetEditFormCallback();
      },
      poItemDateReceived: poItemDateReceived?.set('second', 0)
    });
  };

  const columns = useMemo<MRT_ColumnDef<TShirtOrder>[]>(
    () => getTableColumns(),
    []
  );

  const fetchTShirts = () =>
    fetchAllNonDeletedTShirts(
      rescueDBOperation,
      (resp: Page<TShirt>) => setTShirtChoices(resp.items)
    );

  useEffect(() => {
    fetchTShirts();
  }, []);

  const hiddenColumns = { id: false } as any;
  if (entityType === EntityType.CustomerOrder || mode === TableMode.Create) {
    hiddenColumns[TShirtOrderFields.AmtReceived] = false;
  }

  // As of now, COs aren't concerned with these fields
  if (entityType === EntityType.CustomerOrder) {
    hiddenColumns[TShirtOrderFields.CostPerUnitCents] = false;
  }

  return (
    <>
      <MRTable
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
        editingMode="modal" //default
        enableColumnOrdering
        onColumnFiltersChange={setColumnFilters}
        state={{
          columnFilters,
          columnVisibility: hiddenColumns,
        }}
        muiTableBodyRowProps={({ row }: { row: MRT_Row<TShirtOrder> }) => {
          const amtRecv = row.original.amountReceived ?? 0;
          const amtOrdered = row.original.quantity;
          let bg = undefined;
          let inventoryQtyField = amtOrdered;
          if (
            entityType === EntityType.PurchaseOrder &&
            mode === TableMode.Edit
          ) {
            inventoryQtyField = amtRecv;
            bg =
              amtRecv >= amtOrdered && amtRecv + amtOrdered > 0
                ? "#DDFFCE"
                : undefined;
          }
          return {
            sx: {
              opacity: inventoryQtyField <= 0 ? "50%" : "100%",
              backgroundColor: bg,
            },
          };
        }}
        initialState={{
          showColumnFilters: true,
          sorting: [
            {
              id: "quantity",
              desc: true,
            },
          ],
        }}
        enableEditing
        renderRowActions={({ row, table }) => (
          <TableRowActions
            onEdit={() => setEditMode({ show: true, row: row })}
            onDelete={() => {
              if (onRowDelete) {
                onRowDelete(row);
              }
            }}
            showDeleteButton={onRowDelete !== undefined}
            showEditButton
          />
        )}
        renderTopToolbarCustomActions={() => (
          <TableToolbar
            addButton={{
              onAdd: () => setCreateModalOpen(true),
            }}
            receiveAllItemsButton={ onReceiveAllItems !== undefined ? { 
              onReceiveAllItems: onReceiveAllItems, 
              isDisabled: receiveAllDisabled } : undefined }
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
        parentOrderId={parentOrder?.id}
      />
      <EditRowPopup
        open={editMode.show}
        row={editMode.row}
        onSubmit={handleEditRowAudit}
        onClose={() => setEditMode({ show: false, row: undefined })}
        title="Edit"
        parentOrder={parentOrder}
        entityType={entityType}
        mode={mode}
      />
    </>
  );
};

export default TShirtOrderTable;
