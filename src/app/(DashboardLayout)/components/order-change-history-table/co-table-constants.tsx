import { CustomerOrderChange } from "@/API";
import { toDateObj } from "@/utils/datetimeConversions";
import { MRT_ColumnDef } from "material-react-table";

export const getTableColumns = (): MRT_ColumnDef<CustomerOrderChange>[] => {
    return [
      {
        accessorKey: "customerOrderChangeTshirtStyleNumber",
        header: "Style No.",
        muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
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
        }
      } as MRT_ColumnDef<CustomerOrderChange>
    ];
  };