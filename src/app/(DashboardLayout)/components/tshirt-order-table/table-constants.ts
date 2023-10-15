import { CreateCustomerOrderChangeInput, CreatePurchaseOrderChangeInput, CustomerOrderChange, PurchaseOrderChange, TShirtOrder } from "@/API";
import { MRT_ColumnDef, MRT_Cell } from "material-react-table";

export const tablePrimaryKey = "id";
export const modalTitle = "Add to Order";
export const amountReceivedField = "amountReceived";

//Exclude these fields when creating. TShirt style number is hard coded in the form for input
export const excludeOnCreateFields: string[] = ["tShirtOrderTshirtStyleNumber", "updatedAt", "createdAt", "id"];
export const numberInputFields = new Set<string>(["quantity", amountReceivedField]); 

export type OrderChange = PurchaseOrderChange | CustomerOrderChange;
export type CreateOrderChangeInput = CreatePurchaseOrderChangeInput | CreateCustomerOrderChangeInput;

export interface TShirtOrderFormError {
    message: string;
}

export const initialTShirtOrderFormState: any = {
    tShirtOrderTshirtStyleNumber: "", // associated tshirt
    quantity: 0,
    amountReceived: 0
};

export const getInitialTShirtOrderFormErrorMap = () =>
    new Map<string, string>(
        Object.keys(initialTShirtOrderFormState).map((key) => [key, ""])
    );

export const getTableColumns = (
    getCommonEditTextFieldProps: (cell: MRT_Cell<TShirtOrder>) => MRT_ColumnDef<TShirtOrder>["muiTableBodyCellEditTextFieldProps"]
): MRT_ColumnDef<TShirtOrder>[] => {
    return [
        {
            accessorKey: "tShirtOrderTshirtStyleNumber",
            header: "Style No.",
            muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
            enableEditing: false,
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: "quantity",
            header: "Amt. Ordered",
            muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
                ...getCommonEditTextFieldProps(cell),
                type: "number",
            }),
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: "amountReceived",
            header: "Amt. Received",
            muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
                ...getCommonEditTextFieldProps(cell),
                type: "number",
            }),
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: "id",
            header: "Id"
        } as MRT_ColumnDef<TShirtOrder>
    ];
};