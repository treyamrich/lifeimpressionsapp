import { TShirtOrder } from "@/API";
import { MRT_ColumnDef, MRT_Cell } from "material-react-table";
import { ColumnInfo } from "../../purchase-orders/table-constants";
import { tshirtSizeColumnFilterFn, tshirtSizeToLabel } from "../../inventory/InventoryTable/table-constants";

export const tablePrimaryKey = "id";
export const modalTitle = "Add to Order";
export const amountReceivedField = "amountReceived";

export enum TShirtOrderFields {
    Qty = "quantity",
    AmtReceived = "amountReceived",
    CostPerUnit = "costPerUnit",
    Discount = "discount"
}

export const toTShirtOrderColumnHeaderMap = {
    [TShirtOrderFields.Qty]: "Quantity",
    [TShirtOrderFields.AmtReceived]: "Amt. Received",
    [TShirtOrderFields.CostPerUnit]: "Cost/Unit $",
    [TShirtOrderFields.Discount]: "Discount $"
};

export const numberInputFields = new Set<string>([TShirtOrderFields.Qty, TShirtOrderFields.AmtReceived]);
export const floatInputFields = new Set<string>([TShirtOrderFields.CostPerUnit]) ;

export interface TShirtOrderFormError {
    message: string;
}

export const initialTShirtOrderFormState: any = {
    tshirt: null,
    quantity: 1,
    amountReceived: 0,
    costPerUnit: 0,
    discount: 0,
    tShirtOrderTshirtId: ""
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
            muiTableHeadCellProps: { sx: { color: "green" } },
            Cell: ({ renderedCellValue, row}) => (
                <> {tshirtSizeToLabel[row.original.tshirt.size]}</>
              ),
              filterFn: tshirtSizeColumnFilterFn
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: "tshirt.color",
            header: "Color",
            muiTableHeadCellProps: { sx: { color: "green" } },
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: TShirtOrderFields.Qty,
            header: toTShirtOrderColumnHeaderMap[TShirtOrderFields.Qty],
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: TShirtOrderFields.AmtReceived,
            header: toTShirtOrderColumnHeaderMap[TShirtOrderFields.AmtReceived],
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: TShirtOrderFields.CostPerUnit,
            header: toTShirtOrderColumnHeaderMap[TShirtOrderFields.CostPerUnit],
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: TShirtOrderFields.Discount,
            header: toTShirtOrderColumnHeaderMap[TShirtOrderFields.Discount],
        } as MRT_ColumnDef<TShirtOrder>,
        {
            accessorKey: "id",
            header: "Id",
            enableEditing: false
        } as MRT_ColumnDef<TShirtOrder>
    ];
};

export const columnInfo = new Map<string | number | symbol | undefined, ColumnInfo>([
    ["id", { excludeOnCreate: true } as ColumnInfo],
    ["updatedAt", { excludeOnCreate: true } as ColumnInfo],
    ["createdAt", { excludeOnCreate: true } as ColumnInfo],

    ["tshirt.size", { excludeOnCreate: true } as ColumnInfo],
    ["tshirt.color", { excludeOnCreate: true } as ColumnInfo],
    ["tshirt.styleNumber", { excludeOnCreate: true } as ColumnInfo],

    [TShirtOrderFields.AmtReceived, { excludeOnCreate: true, isEditable: true, isNumberField: true } as ColumnInfo],
    [TShirtOrderFields.Qty, { isEditable: true, isNumberField: true } as ColumnInfo],
    [TShirtOrderFields.CostPerUnit, { isEditable: true, isFloatField: true } as ColumnInfo],
    [TShirtOrderFields.Discount, { isEditable: true, isFloatField: true } as ColumnInfo]
  ]);

export const iterateColumnInfo = (fn: (columnKey: string, colInfo: ColumnInfo) => void) => {
    Array.from(columnInfo.keys()).forEach(key => {
        let item = columnInfo.get(key);
        fn(key as string, item!)
    });
}