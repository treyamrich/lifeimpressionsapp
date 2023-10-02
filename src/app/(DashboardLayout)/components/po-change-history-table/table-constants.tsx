import { PurchaseOrderChange } from "@/API";
import { MRT_ColumnDef } from "material-react-table";

export const getTableColumns = (): MRT_ColumnDef<PurchaseOrderChange>[] => {
    return [
      {
        accessorKey: "purchaseOrderChangeTshirtStyleNumber",
        header: "Style No.",
        muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
      } as MRT_ColumnDef<PurchaseOrderChange>,
      {
        accessorKey: "quantityChange",
        header: "Change Amt.",
      } as MRT_ColumnDef<PurchaseOrderChange>,
      {
        accessorKey: "reason",
        header: "Reason",
      } as MRT_ColumnDef<PurchaseOrderChange>,
      {
        accessorKey: "createdAt",
        header: "Date",
      } as MRT_ColumnDef<PurchaseOrderChange>
    ];
  };