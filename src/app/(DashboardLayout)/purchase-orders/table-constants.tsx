import { POStatus, PurchaseOrder } from "@/API";
import { getStartOfMonth, getTodayInSetTz, toReadableDateTime } from "@/utils/datetimeConversions";
import { Chip } from "@mui/material";
import { Dayjs } from "dayjs";
import { MRT_ColumnDef } from "material-react-table";
import { getStartOfDay } from "@/utils/datetimeConversions";

export interface SelectValue {
  label: string;
  value: any;
}

export const tablePrimaryKey = "id";

export const getInitialPurchaseOrderState = () => ({
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
  sentToVendor: false,
  dateExpected: getStartOfDay(1),
  createdAt: getTodayInSetTz()
});

const poStatusToColor = {
  [POStatus.Open]: "success",
  [POStatus.Closed]: "error",
  [POStatus.SentToVendor]: "info",
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
      header: "Vendor",
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "status",
      header: "Status",
      Cell: ({ renderedCellValue, row }) => (
        <Chip
          variant="filled"
          label={poStatusToHeaderMap[row.original.status]}
          color={poStatusToColor[row.original.status] as any}
        />
      ),
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "dateExpected",
      header: "Expected Date",
      Cell: ({ renderedCellValue, row }) => (
        <span>{toReadableDateTime(row.original.dateExpected)}</span>
      ),
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "createdAt",
      header: "Date Placed",
      Cell: ({ renderedCellValue, row }) => (
        <span>{toReadableDateTime(row.original.createdAt)}</span>
      ),
    } as MRT_ColumnDef<PurchaseOrder>,
    {
      accessorKey: "updatedAt",
      header: "Last Modified",
      Cell: ({ renderedCellValue, row }) => (
        <span>{toReadableDateTime(row.original.updatedAt)}</span>
      ),
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
  ];
};

export const poStatusToHeaderMap = {
  [POStatus.Open]: "Open",
  [POStatus.SentToVendor]: "Sent To Vendor",
  [POStatus.Closed]: "Closed",
} as any;

export type ColumnInfo = {
  disabledOnCreate: boolean | undefined;
  disabledOnEdit: boolean | undefined;
  isRequired: boolean | undefined;
  selectFields: undefined | SelectValue[];
  excludeOnCreate: boolean | undefined;
  dateTimeField: {
    getMinDateRestriction?: () => Dayjs;
    getMaxDateRestriction?: () => Dayjs;
  } | undefined;
  isPhoneNumField: boolean | undefined;
  isEmailField: boolean | undefined;
  hideInTable: boolean | undefined;
  placeholderText: string | undefined;
  isEditable: boolean | undefined;
  multilineTextInfo: { numRows: number } | undefined;
  isNumberField?: boolean;
  isFloatField?: boolean;
};

export const columnInfo = new Map<
  string | number | symbol | undefined,
  ColumnInfo
>([
  ["id", { excludeOnCreate: true } as ColumnInfo],
  ["updatedAt", { excludeOnCreate: true } as ColumnInfo],
  ["createdAt", { 
    dateTimeField: {
      getMaxDateRestriction: () => getTodayInSetTz(),
      getMinDateRestriction: () => getStartOfMonth(0)
      
    }
  } as ColumnInfo],
  ["vendor", { isRequired: true, isEditable: true } as ColumnInfo],
  [
    "status",
    {
      selectFields: Object.keys(poStatusToHeaderMap).map((key: string) => {
        return { label: poStatusToHeaderMap[key], value: key };
      }),
    } as ColumnInfo,
  ],
  ["orderNumber", { isRequired: true } as ColumnInfo],
  ["orderNotes", { isEditable: true, hideInTable: true } as ColumnInfo],
  [
    "taxRate",
    { isFloatField: true, isEditable: true, hideInTable: true } as ColumnInfo,
  ],
  [
    "shipping",
    { isFloatField: true, isEditable: true, hideInTable: true } as ColumnInfo,
  ],
  ["shippingAddress", { isEditable: true, hideInTable: true } as ColumnInfo],
  [
    "fees",
    { isFloatField: true, isEditable: true, hideInTable: true } as ColumnInfo,
  ],
  ["dateExpected", { 
    dateTimeField: {
      getMinDateRestriction: () => getStartOfDay(0)
    }, 
    isEditable: true 
  } as ColumnInfo],
]);