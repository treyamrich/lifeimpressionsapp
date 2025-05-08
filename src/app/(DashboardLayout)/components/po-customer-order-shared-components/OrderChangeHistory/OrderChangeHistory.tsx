"use client";

import { OrderChange } from "@/API";
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
} from "material-react-table";
import { getTableColumns } from "./tabel-constants";
import React, { useMemo, useState } from "react";
import { useListOrderChangeHistory } from "@/api/hooks/list-hooks";
import { usePagination } from "@/hooks/use-pagination";
import Typography from "@mui/material/Typography";
import { EntityType } from "../CreateOrderPage";
import { MRTable } from "../../Table/MRTable";

export const dummyOrderIdForInventoryAdjustment = "adc3b3b0-0b3b-4b3b-8b3b-0b3b3b3b3b3b";
const uiPageSize = 20;
const fetchPageSize = 100;

const OrderChangeHistory = ({
  entityType,
  orderId,
}: {
  entityType: EntityType | undefined;
  orderId?: string;
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
        orderType: entityType,
        orderId: orderId ?? dummyOrderIdForInventoryAdjustment,
        limit: fetchPageSize,
      }),
    pageSize: uiPageSize,
  });

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const columns = useMemo<MRT_ColumnDef<OrderChange>[]>(
    () => getTableColumns(entityType !== undefined),
    []
  );

  return (
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
        rowsPerPageOptions: [uiPageSize],
        nextIconButtonProps: {
          disabled: disabledNextButton,
        },
      }}
      rowCount={numRows}
    />
  );
};

export default OrderChangeHistory;
