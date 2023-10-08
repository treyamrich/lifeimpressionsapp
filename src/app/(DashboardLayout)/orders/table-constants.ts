import { CustomerOrder, CustomerOrderStatus } from "@/API";
import { MRT_ColumnDef } from "material-react-table";

export const tablePrimaryKey = "id";
export const entityName = "Customer Order";

export const initialCustomerOrderFormState: any = {
  __typename: "CustomerOrder",
  contact: {},
  orderStatus: CustomerOrderStatus.NEW,
  dateNeededBy: "",
  orderedItems: [],
  orderNotes: ""
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
      isRequired: true,
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "createdAt",
      header: "Created on",
    } as MRT_ColumnDef<CustomerOrder>,
    {
      accessorKey: "updatedAt",
      header: "Last Modified",
    } as MRT_ColumnDef<CustomerOrder>,
  ];
};

//Exclude these fields when creating
export const excludeOnCreateFields: string[] = ["id", "updatedAt", "createdAt"];
const requiredCreateFields: string[] = ["vendor"];
export const isRequiredField = (field: string): boolean =>
  requiredCreateFields.includes(field);

export const getInitialPurchaseOrderFormErrorMap = () =>
  new Map<string, string>(
    Object.keys(initialCustomerOrderFormState).map((key) => [key, ""])
  );

// export const selectInputFields = new Map<
//   string | number | symbol | undefined,
//   SelectValue[]
// >([
//   [
//     "status",
//     [
//       { label: POStatus.Open, value: POStatus.Open },
//       { label: POStatus.Closed, value: POStatus.Closed },
//     ],
//   ],
// ]);
