"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import React, { SetStateAction, useMemo, useRef, useState } from "react";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_ColumnFiltersState,
  MRT_VisibilityState,
} from "material-react-table";
import { ColumnInfo } from "../../purchase-orders/table-constants";
import TableToolbar from "../Table/TableToolbar";
import { ListAPIResponse } from "@/graphql-helpers/types";
import TableInfoHeader from "../Table/TableInfoHeader";
import { Stack } from "@mui/material";
import { EntityType } from "./CreateOrderPage";

function ViewOrdersPage<T extends Record<any, any>>({
  tableData,
  setTableData,
  onRowClick,
  onAddRow,
  fetchOrdersPaginationFn,
  pageTitle,
  entityType,
  getTableColumns,
  columnInfo,
  columnFiltersState,
  didUpdateFetchFnState,
}: {
  tableData: T[];
  setTableData: React.Dispatch<SetStateAction<T[]>>;
  onRowClick: (row: MRT_Row<T>) => void;
  onAddRow: () => void;
  fetchOrdersPaginationFn: (
    nextToken: string | null | undefined
  ) => Promise<ListAPIResponse<T>>;
  pageTitle: string;
  entityType: EntityType;
  getTableColumns: () => MRT_ColumnDef<T>[];
  columnInfo: Map<string | number | symbol | undefined, ColumnInfo>;
  columnFiltersState: {
    columnFilters: MRT_ColumnFiltersState;
    setColumnFilters: React.Dispatch<SetStateAction<MRT_ColumnFiltersState>>;
  };
  didUpdateFetchFnState?: { 
    updated: boolean;
    setUpdated: React.Dispatch<SetStateAction<boolean>>; 
  }
}) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { columnFilters, setColumnFilters } = columnFiltersState;

  const columns = useMemo<MRT_ColumnDef<T>[]>(() => getTableColumns(), []);

  const hiddenColumns = useRef<() => MRT_VisibilityState>(() => {
    const res = {} as any;
    columns.forEach((col) => {
      const key = col.accessorKey;
      if (columnInfo.get(key)?.hideInTable) res[key as string] = false;
    });
    return res;
  });

  return (
    <PageContainer
      title={`${pageTitle}`}
      description={`this is ${pageTitle} page`}
    >
      <DashboardCard title={`${pageTitle}`}>
        <Stack>
          <TableInfoHeader subheaderText="This table loads records created most recently first."/>
          <MaterialReactTable
            displayColumnDefOptions={{
              "mrt-row-actions": {
                muiTableHeadCellProps: {
                  align: "center",
                },
                size: 120,
              },
            }}
            muiTableBodyRowProps={({ row }: { row: any }) => ({
              onClick: () => {
                onRowClick(row);
              },
              sx: {
                cursor: "pointer", //you might want to change the cursor too when adding an onClick
              },
            })}
            columns={columns}
            data={tableData}
            initialState={{
              showColumnFilters: true,
              columnVisibility: hiddenColumns.current(),
            }}
            editingMode="modal" //default
            enableColumnOrdering
            enableHiding={false}
            enableGlobalFilter={false}
            onColumnFiltersChange={setColumnFilters}
            state={{
              columnFilters,
              isLoading
            }}
            filterFns={{
              noOpFilterFn: (row, id, filterValue) => {
                return true;
              },
            }}
            renderTopToolbarCustomActions={() => (
              <TableToolbar
                pagination={{
                  items: tableData,
                  setItems: setTableData,
                  fetchFunc: fetchOrdersPaginationFn,
                  setIsLoading: setIsLoading,
                  updatedFetchFn: didUpdateFetchFnState
                }}
                addButton={{
                  onAdd: onAddRow,
                }}
              />
            )}
          />
        </Stack>
      </DashboardCard>
    </PageContainer>
  );
}

export default ViewOrdersPage;
