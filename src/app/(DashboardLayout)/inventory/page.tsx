"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { TShirt, UpdateTShirtInput } from "@/API";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Delete, Edit } from "@mui/icons-material";
import { createTShirtAPI } from "@/graphql-helpers/create-apis";
import { listTShirtAPI } from "@/graphql-helpers/fetch-apis";
import { updateTShirtAPI } from "@/graphql-helpers/update-apis";

import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";
import {
  tshirtPrimaryKey,
  entityName,
  getTableColumns,
  hiddenColumns,
} from "./table-constants";
import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import {
  MaterialReactTable,
  type MaterialReactTableProps,
  type MRT_ColumnDef,
  type MRT_Cell,
  type MRT_Row,
  type MRT_ColumnFiltersState,
} from "material-react-table";
import CreateTShirtModal from "./CreateTShirtModal";
import TableToolbar from "../components/Table/TableToolbar";
import TableInfoHeader from "../components/Table/TableInfoHeader";
import EditTShirtModal from "./EditTShirtModal";
import TableRowActions from "../components/Table/TableRowActions";

type EditRowState = {
  showEditPopup: boolean;
  row: MRT_Row<TShirt> | undefined;
};

const Inventory = () => {
  const { rescueDBOperation } = useDBOperationContext();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editRowState, setEditRowState] = useState<EditRowState>({
    showEditPopup: false,
    row: undefined,
  });
  const [tableData, setTableData] = useState<TShirt[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );

  const resetEditFormState = () =>
    setEditRowState({ row: undefined, showEditPopup: false });

  const handleCreateNewRow = (values: TShirt) => {
    rescueDBOperation(
      () => createTShirtAPI(values),
      DBOperation.CREATE,
      (resp: TShirt) => {
        setTableData([...tableData, resp]);
      }
    );
  };

  const handleUpdateTShirt = (
    newTShirtInput: UpdateTShirtInput,
    originalRow: MRT_Row<TShirt>,
    resetForm: () => void
  ) => {
    let hasChanged = Object.keys(newTShirtInput).reduce((prev, curr) => 
      prev || newTShirtInput[curr as keyof UpdateTShirtInput] !== originalRow.getValue(curr), false);

    if(!hasChanged) {
      resetEditFormState();
      resetForm();
      return;
    }

    rescueDBOperation(
      () => updateTShirtAPI(newTShirtInput),
      DBOperation.UPDATE,
      (resp: TShirt) => {
        tableData[originalRow.index] = resp;
        setTableData([...tableData]);
        resetEditFormState();
        resetForm();
      }
    );
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

  const columns = useMemo<MRT_ColumnDef<TShirt>[]>(() => getTableColumns(), []);

  const fetchTShirtsPaginationFn = (nextToken: string | null | undefined) => {
    const deletedFilter = { isDeleted: { ne: true } };
    return listTShirtAPI({ filters: deletedFilter, nextToken: nextToken });
  };

  return (
    <PageContainer title="Inventory" description="this is Inventory">
      <DashboardCard title="Inventory">
        <Stack rowGap={2}>
          <TableInfoHeader subheaderText="This table loads records with the lowest quantity first." />
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
            initialState={{
              showColumnFilters: true,
              sorting: [
                {
                  id: "quantityOnHand",
                  desc: false,
                },
              ],
            }}
            enableColumnOrdering
            onColumnFiltersChange={setColumnFilters}
            state={{
              columnFilters,
              columnVisibility: hiddenColumns,
            }}
            enableEditing
            renderRowActions={({ row, table }) => (
              <TableRowActions
                onEdit={()=>setEditRowState({ showEditPopup: true, row: row })}
                onDelete={() => handleDeleteRow(row)}
                showEditButton
                showDeleteButton
              />
            )}
            renderTopToolbarCustomActions={() => (
              <TableToolbar
                paginationProps={{
                  items: tableData,
                  setItems: setTableData,
                  fetchFunc: fetchTShirtsPaginationFn,
                }}
                onAdd={() => setCreateModalOpen(true)}
                showPaginationButton={true}
                showAddButton={true}
              />
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
          <EditTShirtModal
            open={editRowState.showEditPopup}
            row={editRowState.row}
            onSubmit={handleUpdateTShirt}
            onClose={() => resetEditFormState()}
            getTableColumns={getTableColumns}
          />
        </Stack>
      </DashboardCard>
    </PageContainer>
  );
};

export default Inventory;

const validateRequired = (value: string) => !!value.length;
const validateQuantity = (qty: number) => {
  return qty >= 0;
};
