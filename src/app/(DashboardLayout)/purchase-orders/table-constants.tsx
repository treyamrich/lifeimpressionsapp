import { PurchaseOrder } from "@/API";
import { MRT_ColumnDef } from "material-react-table";

export const tablePrimaryKey = "id"
export const entityName = "PurchaseOrder"

export const getTableColumns = (): MRT_ColumnDef<PurchaseOrder>[] => {
    return [
      {
        accessorKey: "id",
        header: "Id",
        muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
        enableEditing: false,
        helperText: "1",
      } as MRT_ColumnDef<PurchaseOrder>,
      {
        accessorKey: "vendor",
        header: "Vendor",
        helperText: "2",
      } as MRT_ColumnDef<PurchaseOrder>,
      {
        accessorKey: "createdAt",
        header: "Created on",
      } as MRT_ColumnDef<PurchaseOrder>,
      {
        accessorKey: "updatedAt",
        header: "Last Modified",
        enableEditing: false,
      } as MRT_ColumnDef<PurchaseOrder>,
    ];
  };