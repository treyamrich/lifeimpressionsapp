import { CustomerOrder, CustomerOrderStatus } from "@/API";
import { MRT_ColumnDef } from "material-react-table";
import { ColumnInfo, SelectValue } from "../purchase-orders/table-constants";
import dayjs from "dayjs";

export const tablePrimaryKey = "id";
export const entityName = "Customer Order";

export const initialCustomerOrderFormState: any = {
  __typename: "CustomerOrder",
  contact: {},
  orderStatus: CustomerOrderStatus.NEW,
  dateNeededBy: dayjs(),
  orderedItems: [],
  orderNotes: "",
  orderNumber: ""
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
      accessorKey: "contact",
      header: "Customer Contact",
    } as MRT_ColumnDef<CustomerOrder>,
  ];
};

export const columnInfo = new Map<string | number | symbol | undefined, ColumnInfo>([
  ["id", { excludeOnCreate: true } as ColumnInfo],
  ["updatedAt", { excludeOnCreate: true } as ColumnInfo],
  ["createdAt", { excludeOnCreate: true } as ColumnInfo],
  ["orderNumber", { isRequired: true } as ColumnInfo],
  ["orderStatus", { disabledOnCreate: true } as ColumnInfo],
  ["orderNotes", { hideInTable: true } as ColumnInfo],
  ["dateNeededBy", { isRequired: true, isDatetimeField: true } as ColumnInfo],
  ["contact", { hideInTable: true } as ColumnInfo],
]);