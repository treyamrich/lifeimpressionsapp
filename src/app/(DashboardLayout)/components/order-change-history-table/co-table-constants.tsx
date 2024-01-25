import { CustomerOrderChange } from "@/API";
import { toDateObj, toReadableDateTime } from "@/utils/datetimeConversions";
import { MRT_ColumnDef } from "material-react-table";

export const getTableColumns = (): MRT_ColumnDef<CustomerOrderChange>[] => {
    return [
      {
        accessorKey: "tshirt.styleNumber",
        header: "Style No.",
        muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
        size: 50,
      } as MRT_ColumnDef<CustomerOrderChange>,
      {
        accessorKey: "tshirt.size",
        header: "Size",
        muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
        size: 50,
      } as MRT_ColumnDef<CustomerOrderChange>,
      {
        accessorKey: "tshirt.color",
        header: "Color",
        muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
        size: 50,
      } as MRT_ColumnDef<CustomerOrderChange>,
      {
        accessorKey: "orderedQuantityChange",
        header: "Amt. Ordered Change",
      } as MRT_ColumnDef<CustomerOrderChange>,
      {
        accessorKey: "reason",
        header: "Reason",
      } as MRT_ColumnDef<CustomerOrderChange>,
      {
        accessorKey: "createdAt",
        header: "Date",
        sortingFn: (rowA, rowB, columnId) => {
          const l= toDateObj(rowA.getValue(columnId));
          const r = toDateObj(rowB.getValue(columnId));
          if(l < r) return -1;
          if(l > r) return 1;
          return 0;
        },
        Cell: ({ renderedCellValue, row }) => (
          <>
            {toReadableDateTime(row.original.createdAt)}
          </>
        )
      } as MRT_ColumnDef<CustomerOrderChange>
    ];
  };