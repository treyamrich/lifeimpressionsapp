import { CustomerOrder, CustomerOrderStatus } from "@/API";
import { MRT_ColumnDef } from "material-react-table";
import { ColumnInfo } from "../purchase-orders/table-constants";
import dayjs from "dayjs";
import { getStartOfDay, getStartOfMonth, getTodayInSetTz, toReadableDateTime } from "@/utils/datetimeConversions";
import { Chip } from "@mui/material";

export interface SelectValue {
  label: string;
  value: any;
}

export const tablePrimaryKey = "id";

export const getInitialCustomerOrderFormState = () => ({
  __typename: "CustomerOrder",
  orderStatus: CustomerOrderStatus.NEW,
  dateNeededBy: getStartOfDay(1),
  orderedItems: [],
  orderNotes: "",
  orderNumber: "",
  customerName: "",
  customerEmail: "",
  customerPhoneNumber: "",
  taxRate: 0,
  discount: 0,
  createdAt: getTodayInSetTz()
});

const coStatusToColor = {
  [CustomerOrderStatus.NEW]: "warning",
  [CustomerOrderStatus.BLOCKED]: "error",
  [CustomerOrderStatus.COMPLETED]: "success",
  [CustomerOrderStatus.IN_PROGRESS]: "info",
};

export const getTableColumns = (): MRT_ColumnDef<CustomerOrder>[] => {
  return [
    {
      accessorKey: "id",
      header: "Id",
      muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "orderNumber",
      header: "Order No.",
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "dateNeededBy",
      header: "Date Needed",
      Cell: ({ renderedCellValue, row }) => (
        <span>{toReadableDateTime(row.original.dateNeededBy)}</span>
      ),
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "orderStatus",
      header: "Status",
      Cell: ({ renderedCellValue, row }) => (
        <Chip
          variant="filled"
          label={coStatusToHeaderMap[row.original.orderStatus]}
          color={coStatusToColor[row.original.orderStatus] as any}
        />
      ),
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "createdAt",
      header: "Date Placed",
      Cell: ({ renderedCellValue, row }) => (
        <span>{toReadableDateTime(row.original.createdAt)}</span>
      ),
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "updatedAt",
      header: "Last Modified",
      Cell: ({ renderedCellValue, row }) => (
        <span>{toReadableDateTime(row.original.updatedAt)}</span>
      ),
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "orderNotes",
      header: "Notes",
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "customerName",
      header: "Customer Name",
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "customerEmail",
      header: "Customer Email",
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "customerPhoneNumber",
      header: "Customer Phone Number",
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "taxRate",
      header: "Tax Rate %",
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "discount",
      header: "Order Discount $",
    } as MRT_ColumnDef<CustomerOrder>,
  ];
};

export const coStatusToHeaderMap = {
  [CustomerOrderStatus.NEW]: "New",
  [CustomerOrderStatus.IN_PROGRESS]: "In Progress",
  [CustomerOrderStatus.BLOCKED]: "Blocked",
  [CustomerOrderStatus.COMPLETED]: "Completed",
} as any;

export const columnInfo = new Map<
  string | number | symbol | undefined,
  ColumnInfo
>([
  ["id", { excludeOnCreate: true } as ColumnInfo],
  ["updatedAt", { excludeOnCreate: true } as ColumnInfo],
  ["createdAt", { dateTimeField: {
    getMaxDateRestriction: () => getTodayInSetTz(),
    getMinDateRestriction: () => getStartOfMonth(0)
  } } as ColumnInfo],
  ["orderNumber", { isRequired: true } as ColumnInfo],
  [
    "orderStatus",
    {
      disabledOnCreate: true,
      selectFields: Object.keys(coStatusToHeaderMap).map((key: string) => {
        return { label: coStatusToHeaderMap[key], value: key };
      }),
    } as ColumnInfo,
  ],
  [
    "orderNotes",
    {
      hideInTable: true,
      isEditable: true,
      multilineTextInfo: {
        numRows: 4,
      },
    } as ColumnInfo,
  ],
  [
    "dateNeededBy",
    {
      isRequired: true,
      dateTimeField: {
        getMinDateRestriction: () => getStartOfDay(0)
      },
      isEditable: true,
    } as ColumnInfo,
  ],
  [
    "customerName",
    {
      hideInTable: true,
      isRequired: true,
      isEditable: true,
    } as ColumnInfo,
  ],
  [
    "customerEmail",
    {
      hideInTable: true,
      placeholderText: "john@gmail.com",
      isEditable: true,
      isEmailField: true,
    } as ColumnInfo,
  ],
  [
    "customerPhoneNumber",
    {
      hideInTable: true,
      isPhoneNumField: true,
      placeholderText: "XXX-XXX-XXXX",
      isEditable: true,
    } as ColumnInfo,
  ],
  [
    "taxRate",
    {
      isFloatField: true,
      isEditable: true,
      hideInTable: true,
    } as ColumnInfo,
  ],
  [
    "discount",
    {
      isFloatField: true,
      isEditable: true,
      hideInTable: true,
    } as ColumnInfo,
  ],
]);
