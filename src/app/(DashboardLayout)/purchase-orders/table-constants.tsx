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
      header: "Vendor",
      isRequired: true,
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

//Exclude these fields when creating
export const excludeOnCreateFields: string[] = ["id", "updatedAt", "createdAt"];
const requiredCreateFields: string[] = ["vendor"];
export const isRequiredField = (field: string): boolean =>
  requiredCreateFields.includes(field);

export const getInitialPurchaseOrderFormErrorMap = () =>
  new Map<string, string>(
    Object.keys(initialPurchaseOrderFormState).map((key) => [key, ""])
  );

export const selectInputFields = new Map<
  string | number | symbol | undefined,
  SelectValue[]
>([
  [
    "status",
    [
      { label: POStatus.Open, value: POStatus.Open },
      { label: POStatus.Closed, value: POStatus.Closed },
    ],
  ],
]);
