import { CustomerOrder, CustomerOrderStatus } from "@/API";
import { MRT_ColumnDef } from "material-react-table";
import { ColumnInfo } from "../purchase-orders/table-constants";
import dayjs from "dayjs";

export interface SelectValue {
  label: string;
  value: any;
}

export const tablePrimaryKey = "id";
export const entityName = "Customer Order";

export const initialCustomerOrderFormState: any = {
  __typename: "CustomerOrder",
  orderStatus: CustomerOrderStatus.NEW,
  dateNeededBy: dayjs(),
  orderedItems: [],
  orderNotes: "",
  orderNumber: "",
  customerName: "",
  customerEmail: "",
  customerPhoneNumber: ""
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
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "orderStatus",
      header: "Status",
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "createdAt",
      header: "Created on",
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "updatedAt",
      header: "Last Modified",
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
  ];
};

export const orderStatusMap = {
  [CustomerOrderStatus.NEW]: "New",
  [CustomerOrderStatus.IN_PROGRESS]: "In Progress",
  [CustomerOrderStatus.BLOCKED]: "Blocked",
  [CustomerOrderStatus.COMPLETED]: "Completed",
} as any;


export const columnInfo = new Map<string | number | symbol | undefined, ColumnInfo>([
  ["id", { excludeOnCreate: true } as ColumnInfo],
  ["updatedAt", { excludeOnCreate: true } as ColumnInfo],
  ["createdAt", { excludeOnCreate: true } as ColumnInfo],
  ["orderNumber", { isRequired: true } as ColumnInfo],
  ["orderStatus", {
    disabledOnCreate: true,
    isEditable: true,
    selectFields: Object.keys(orderStatusMap).map((key: string) => {
      return { label: orderStatusMap[key], value: key }
    })
  } as ColumnInfo],
  ["orderNotes", {
    hideInTable: true,
    isEditable: true,
    multilineTextInfo: {
      numRows: 4
    }
  } as ColumnInfo],
  ["dateNeededBy", {
    isRequired: true,
    isDatetimeField: true,
    isEditable: true
  } as ColumnInfo],
  ["customerName", {
    hideInTable: true,
    isRequired: true,
    isEditable: true
  } as ColumnInfo],
  ["customerEmail", {
    hideInTable: true,
    placeholderText: "john@gmail.com",
    isEditable: true,
    isEmailField: true
  } as ColumnInfo],
  ["customerPhoneNumber", {
    hideInTable: true,
    isPhoneNumField: true,
    placeholderText: "XXX-XXX-XXXX",
    isEditable: true
  } as ColumnInfo],
]);
