import { CreateCustomerOrderChangeInput, CreatePurchaseOrderChangeInput, CustomerOrderChange, PurchaseOrderChange, TShirt, TShirtOrder } from "@/API";
import { MRT_ColumnDef, MRT_Cell } from "material-react-table";

export const tablePrimaryKey = "id";
export const modalTitle = "Add to Order";
export const amountReceivedField = "amountReceived";

//Exclude these fields when creating. TShirt style number is hard coded in the form for input
export const excludeOnCreateFields: string[] = ["updatedAt", "createdAt", "id", "tshirt.size", "tshirt.color", "tshirt.styleNumber", amountReceivedField];
export const numberInputFields = new Set<string>(["quantity", amountReceivedField]);
export const floatInputFields = new Set<string>(["costPerUnit"]) ;

export type OrderChange = PurchaseOrderChange | CustomerOrderChange;
export type CreateOrderChangeInput = CreatePurchaseOrderChangeInput | CreateCustomerOrderChangeInput;

export interface TShirtOrderFormError {
    message: string;
}

export const initialTShirtOrderFormState: any = {
    tshirt: null,
    quantity: 1,
    amountReceived: 0,
    costPerUnit: 0
};

export const getInitialTShirtOrderFormErrorMap = () =>
    new Map<string, string>(
        Object.keys(initialTShirtOrderFormState).map((key) => [key, ""])
    );

export const getTableColumns = (): MRT_ColumnDef<TShirtOrder>[] => {
    return [
        {
            accessorKey: "tshirt.styleNumber",
            header: "Style No.",
            muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
            enableEditing: false,
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: "tshirt.size",
            header: "Size",
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: "tshirt.color",
            header: "Color",
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: "quantity",
            header: "Amt. Ordered",
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: "amountReceived",
            header: "Amt. Received",
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: "costPerUnit",
            header: "Cost/Unit $",
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: "id",
            header: "Id",
            enableEditing: false
        } as MRT_ColumnDef<TShirtOrder>
    ];
};