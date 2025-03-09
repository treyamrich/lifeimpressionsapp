"use client";

import { OrderChange } from "@/API";
import MaterialReactTable, {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
} from "material-react-table";
import { getTableColumns } from "./tabel-constants";
import React, { SetStateAction, useEffect, useMemo, useState } from "react";
import { useListOrderChangeHistory } from "@/api/list-apis";
import { usePagination } from "@/hooks/use-pagination";
import Typography from "@mui/material/Typography";

const OrderChangeHistory = ({
  changeHistory,
  setEditHistory,
}: {
  changeHistory: OrderChange[];
  setEditHistory: React.Dispatch<SetStateAction<OrderChange[]>>;
}) => {
  const {
    pagination,
    setPagination,
    currentPage,
    numRows,
    isLoading,
    disabledNextButton,
    error,
  } = usePagination<OrderChange>({
    query: () =>
      useListOrderChangeHistory({
        orderId: "adc3b3b0-0b3b-4b3b-8b3b-!0b3b3b3b3b3b", // can be any uuid since we list all order changes
      }),
    pageSize: 10,
    setData: setEditHistory,
  });

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const columns = useMemo<MRT_ColumnDef<OrderChange>[]>(
    () => getTableColumns(),
    []
  );

  return (
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
      data={currentPage}
      initialState={{
        showColumnFilters: true,
        sorting: [
          {
            id: "createdAt",
            desc: true,
          },
        ],
      }}
      editingMode="modal" //default
      enableColumnOrdering
      enableHiding={false}
      onColumnFiltersChange={setColumnFilters}
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
        nextIconButtonProps: {
          disabled: disabledNextButton,
        },
      }}
      rowCount={numRows}
    />
  );
};

export default OrderChangeHistory;
