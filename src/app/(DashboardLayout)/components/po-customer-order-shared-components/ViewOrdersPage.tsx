"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import React, { SetStateAction, useMemo, useRef } from "react";

import {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_ColumnFiltersState,
  MRT_VisibilityState,
} from "material-react-table";
import { ColumnInfo } from "../../purchase-orders/table-constants";
import TableToolbar from "../Table/TableToolbar";
import TableInfoHeader from "../Table/TableInfoHeader";
import { Stack, Typography } from "@mui/material";
import { UsePaginationReturn } from "@/hooks/use-pagination";
import { MRTable } from "../Table/MRTable";

function ViewOrdersPage<T extends Record<any, any>>({
  usePaginationReturn,
  pageSize,
  onRowClick,
  onAddRow,
  pageTitle,
  getTableColumns,
  columnInfo,
  columnFiltersState,
}: {
  usePaginationReturn: UsePaginationReturn<T>;
  pageSize: number;
  onRowClick: (row: MRT_Row<T>) => void;
  onAddRow: () => void;
  pageTitle: string;
  getTableColumns: () => MRT_ColumnDef<T>[];
  columnInfo: Map<string | number | symbol | undefined, ColumnInfo>;
  columnFiltersState: {
    columnFilters: MRT_ColumnFiltersState;
    setColumnFilters: React.Dispatch<SetStateAction<MRT_ColumnFiltersState>>;
  };
}) {
  const {
    currentPage,
    numRows,
    isLoading,
    error,
    pagination,
    setPagination,
    disabledNextButton,
  } = usePaginationReturn;

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
          <TableInfoHeader subheaderText="This table loads records created most recently first." />
          <MRTable
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
            data={currentPage}
            initialState={{
              showColumnFilters: true,
              columnVisibility: hiddenColumns.current(),
            }}
            editingMode="modal" //default
            enableColumnOrdering
            enableHiding={false}
            enableGlobalFilter={false}
            onColumnFiltersChange={setColumnFilters}
            filterFns={{
              noOpFilterFn: (row, id, filterValue) => {
                return true;
              },
            }}
            renderTopToolbarCustomActions={() => (
              <TableToolbar
                addButton={{
                  onAdd: onAddRow,
                }}
              />
            )}
            muiToolbarAlertBannerProps={
              error
                ? {
                    color: "error",
                    children: (
                      <Typography
                        sx={{
                          color: "#FA896B",
                          fontWeight: "bold",
                        }}
                      >
                        Error loading data
                      </Typography>
                    ),
                  }
                : undefined
            }
            state={{
              columnFilters,
              isLoading,
              pagination,
              showAlertBanner: error != null,
            }}
            manualPagination
            onPaginationChange={setPagination}
            muiTablePaginationProps={{
              rowsPerPageOptions: [pageSize],
              nextIconButtonProps: {
                disabled: disabledNextButton,
              },
            }}
            rowCount={numRows}
          />
        </Stack>
      </DashboardCard>
    </PageContainer>
  );
}

export default ViewOrdersPage;
