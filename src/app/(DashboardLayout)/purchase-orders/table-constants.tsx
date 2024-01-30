import { POStatus, PurchaseOrder } from "@/API";
import { toReadableDateTime } from "@/utils/datetimeConversions";
import dayjs from "dayjs";
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
  orderNotes: "",
  status: POStatus.Open,
  changeHistory: [],
  taxRate: 0,
  shipping: 0,
  shippingAddress: "",
  fees: 0,
  discount: 0,
  sentToVendor: false,
  dateExpected: dayjs()
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
      Cell: ({ renderedCellValue, row }) => (
        <>
          {toReadableDateTime(row.original.createdAt)}
        </>
      )
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "updatedAt",
      header: "Last Modified",
      Cell: ({ renderedCellValue, row }) => (
        <>
          {toReadableDateTime(row.original.updatedAt)}
        </>
      )
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "orderNotes",
      header: "Order Notes",
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "taxRate",
      header: "Tax Rate %",
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "shipping",
      header: "Shipping $",
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "shippingAddress",
      header: "Shipping Address",
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "fees",
      header: "Fees $",
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "discount",
      header: "Discount $",
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "dateExpected",
      header: "Expected Date",
    } as MRT_ColumnDef<PurchaseOrder>,
  ];
};

export type ColumnInfo = {
  disabledOnCreate: boolean | undefined;
  disabledOnEdit: boolean | undefined;
  isRequired: boolean | undefined;
  selectFields: undefined | SelectValue[];
  excludeOnCreate: boolean | undefined;
  isDatetimeField: boolean | undefined;
  isPhoneNumField: boolean | undefined;
  isEmailField: boolean | undefined;
  hideInTable: boolean | undefined;
  placeholderText: string | undefined;
  isEditable: boolean | undefined;
  multilineTextInfo: { numRows: number } | undefined;
  isNumberField?: boolean;
  isFloatField?: boolean;
};

export const columnInfo = new Map<string | number | symbol | undefined, ColumnInfo>([
  ["id", { excludeOnCreate: true } as ColumnInfo],
  ["updatedAt", { excludeOnCreate: true } as ColumnInfo],
  ["createdAt", { excludeOnCreate: true } as ColumnInfo],
  ["vendor", { isRequired: true } as ColumnInfo],
  ["status", {
    selectFields: [
      { label: POStatus.Open, value: POStatus.Open },
      { label: "Sent To Vendor", value: POStatus.SentToVendor },
      { label: POStatus.Closed, value: POStatus.Closed },
    ]
  } as ColumnInfo],
  ["orderNumber", { isRequired: true } as ColumnInfo],
  ["orderNotes", { isEditable: true } as ColumnInfo],
  ["taxRate", { isFloatField: true, isEditable: true } as ColumnInfo],
  ["shipping", { isFloatField: true, isEditable: true } as ColumnInfo],
  ["shippingAddress", { isEditable: true } as ColumnInfo],
  ["fees", { isFloatField: true, isEditable: true } as ColumnInfo],
  ["discount", { isFloatField: true, isEditable: true } as ColumnInfo],
  ["dateExpected", { isDatetimeField: true, isEditable: true } as ColumnInfo],
]);

export const getInitialPurchaseOrderFormErrorMap = () =>
  new Map<string, string>(
    Object.keys(initialPurchaseOrderFormState).map((key) => [key, ""])
  );