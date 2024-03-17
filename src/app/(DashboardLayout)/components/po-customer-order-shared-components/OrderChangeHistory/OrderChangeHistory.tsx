"use client";

import { OrderChange } from "@/API";
import MaterialReactTable, {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
} from "material-react-table";
import { getTableColumns } from "./tabel-constants";
import React, { SetStateAction, useMemo, useState } from "react";
import TableToolbar from "../../Table/TableToolbar";
import { ListAPIResponse } from "@/graphql-helpers/fetch-apis";

const OrderChangeHistory = ({
  changeHistory,
  paginationProps,
  isLoading,
}: {
  changeHistory: OrderChange[];
  paginationProps?: {
    setChangeHistory: React.Dispatch<SetStateAction<OrderChange[]>>;
    fetchChangeHistoryPaginationFn: (
      nextToken: string | null | undefined
    ) => Promise<ListAPIResponse<OrderChange>>;
    setIsLoading: React.Dispatch<SetStateAction<boolean>>;
  };
  isLoading?: boolean
}) => {
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
      data={changeHistory}
      initialState={{
        showColumnFilters: true,
        sorting: [
          {
            id: "createdAt",
            desc: true,
          },
        ],
      }}
      renderTopToolbarCustomActions={
        paginationProps
          ? () => (
              <TableToolbar
                pagination={{
                  items: changeHistory,
                  setItems: paginationProps.setChangeHistory,
                  fetchFunc: paginationProps.fetchChangeHistoryPaginationFn,
                  setIsLoading: paginationProps.setIsLoading,
                }}
              />
            )
          : undefined
      }
      editingMode="modal" //default
      enableColumnOrdering
      enableHiding={false}
      onColumnFiltersChange={setColumnFilters}
      state={{
        columnFilters,
        isLoading
      }}
    />
  );
};

export default OrderChangeHistory;
