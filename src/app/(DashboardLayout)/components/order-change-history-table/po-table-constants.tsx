import { PurchaseOrderChange } from "@/API";
import { toReadableDateTime } from "@/utils/datetimeConversions";
import { MRT_ColumnDef } from "material-react-table";

export const getTableColumns = (): MRT_ColumnDef<PurchaseOrderChange>[] => {
    return [
      {
        accessorKey: "tshirt.styleNumber",
        header: "Style No.",
        muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
        size: 50
      } as MRT_ColumnDef<PurchaseOrderChange>,
      {
        accessorKey: "tshirt.size",
        header: "Size",
        muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
        size: 50
      } as MRT_ColumnDef<PurchaseOrderChange>,
      {
        accessorKey: "tshirt.color",
        header: "Color",
        muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
        size: 50
      } as MRT_ColumnDef<PurchaseOrderChange>,
      {
        accessorKey: "orderedQuantityChange",
        header: "Amt. Ordered Change",
      } as MRT_ColumnDef<PurchaseOrderChange>,
      {
        accessorKey: "quantityChange",
        header: "Amt. On Hand Change",
      } as MRT_ColumnDef<PurchaseOrderChange>,
      {
        accessorKey: "reason",
        header: "Reason",
      } as MRT_ColumnDef<PurchaseOrderChange>,
      {
        accessorKey: "createdAt",
        header: "Date",
        sortingFn: (rowA, rowB, columnId) => {
          const l = new Date(rowA.getValue(columnId));
          const r = new Date(rowB.getValue(columnId));
          if(l < r) return -1;
          if(l > r) return 1;
          return 0;
        },
        Cell: ({ renderedCellValue, row }) => (
          <>
            {toReadableDateTime(row.original.createdAt)}
          </>
        )
      } as MRT_ColumnDef<PurchaseOrderChange>
    ];
  };