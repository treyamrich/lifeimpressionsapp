import { POStatus, PurchaseOrder } from "@/API";
import { MRT_ColumnDef } from "material-react-table";

export interface SelectValue {
  label: string;
  value: any;
}

export const tablePrimaryKey = "id";
export const entityName = "Purchase Order";

export const initialPurchaseOrderFormState: any = {
  __typename: "PurchaseOrder",
  orderNumber: "",
  vendor: "",
  orderedItems: [],
  status: POStatus.Open,
  changeHistory: [],
};

export const getTableColumns = (): MRT_ColumnDef<PurchaseOrder>[] => {
  return [
    {
      accessorKey: "id",
      header: "Id",
      muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "orderNumber",
      header: "PO number",
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "vendor",
      header: "Vendor"
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "status",
      header: " Status",
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "createdAt",
      header: "Created on",
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "updatedAt",
      header: "Last Modified",
    } as MRT_ColumnDef<PurchaseOrder>,
  ];
};

export type ColumnInfo = {
  disabledOnCreate: boolean | undefined;
  isRequired: boolean | undefined;
  selectFields: undefined | SelectValue[];
  excludeOnCreate: boolean | undefined;
  isDatetimeField: boolean | undefined;
  isPhoneNumField: boolean | undefined;
  hideInTable: boolean | undefined;
  placeholderText: string | undefined;
};

export const columnInfo = new Map<string | number | symbol | undefined, ColumnInfo>([
  ["id", { excludeOnCreate: true } as ColumnInfo],
  ["updatedAt", { excludeOnCreate: true } as ColumnInfo],
  ["createdAt", { excludeOnCreate: true } as ColumnInfo],
  ["vendor", { isRequired: true } as ColumnInfo],
  ["status", {
    selectFields: [
      { label: POStatus.Open, value: POStatus.Open },
      { label: POStatus.Closed, value: POStatus.Closed },
    ]
  } as ColumnInfo],
]);

export const getInitialPurchaseOrderFormErrorMap = () =>
  new Map<string, string>(
    Object.keys(initialPurchaseOrderFormState).map((key) => [key, ""])
  );