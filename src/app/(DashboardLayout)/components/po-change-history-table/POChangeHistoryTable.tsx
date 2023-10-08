"use client";

import { PurchaseOrderChange } from "@/API";
import MaterialReactTable, {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
} from "material-react-table";
import { getTableColumns } from "./table-constants";
import { useMemo, useState } from "react";

type POChangeHistoryTableProps = {
  changeHistory: PurchaseOrderChange[];
};

const POChangeHistoryTable = ({ changeHistory }: POChangeHistoryTableProps) => {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const columns = useMemo<MRT_ColumnDef<PurchaseOrderChange>[]>(
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
        sorting: [{
          id: 'createdAt',
          desc: true,
        }]
      }}
      editingMode="modal" //default
      enableColumnOrdering
      enableHiding={false}
      onColumnFiltersChange={setColumnFilters}
      state={{
        columnFilters,
      }}
    />
  );
};

export default POChangeHistoryTable;
