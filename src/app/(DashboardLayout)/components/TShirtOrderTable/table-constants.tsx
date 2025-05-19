import { TShirt, TShirtOrder } from "@/API";
import { MRT_ColumnDef } from "material-react-table";
import { ColumnInfo } from "../../purchase-orders/table-constants";
import {
  tshirtSizeColumnFilterFn,
  tshirtSizeToLabel,
} from "../../inventory/InventoryTable/table-constants";
import { centsToDollars } from "@/utils/money";

export const tablePrimaryKey = "id";
export const modalTitle = "Add to Order";
export const amountReceivedField = "amountReceived";

export enum TShirtOrderFields {
  Qty = "quantity",
  AmtReceived = "amountReceived",
  CostPerUnitCents = "costPerUnitCents",
  Receivals = "receivals",
  EarliestTransaction = "earliestTransaction",
  LatestTransaction = "latestTransaction"
}

export const toTShirtOrderColumnHeaderMap = {
  [TShirtOrderFields.Qty]: "Quantity",
  [TShirtOrderFields.AmtReceived]: "Amt. Received",
  [TShirtOrderFields.CostPerUnitCents]: "Cost/Unit $",
};

export const numberInputFields = new Set<string>([
  TShirtOrderFields.Qty,
  TShirtOrderFields.AmtReceived,
]);
export const floatInputFields = new Set<string>([
  TShirtOrderFields.CostPerUnitCents,
]);

export interface TShirtOrderFormError {
  message: string;
}

export type TShirtOrderMoneyAwareForm = {
  tshirt: TShirt | null;
  quantity: number;
  amountReceived: number;
  costPerUnitCents: number;
}

export const initialTShirtOrderFormState: TShirtOrderMoneyAwareForm = {
  tshirt: null,
  quantity: 1,
  amountReceived: 0,
  costPerUnitCents: 0,
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
      Cell: ({ renderedCellValue, row }) => (
        <span> {tshirtSizeToLabel[row.original.tshirt.size]}</span>
      ),
      filterFn: tshirtSizeColumnFilterFn,
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
      accessorKey: TShirtOrderFields.CostPerUnitCents,
      Cell: ({ row }) => {
        return <span>{centsToDollars(row.original.costPerUnitCents)}</span>;
      },
      header: toTShirtOrderColumnHeaderMap[TShirtOrderFields.CostPerUnitCents],
    } as MRT_ColumnDef<TShirtOrder>,
    {
      accessorKey: "id",
      header: "Id",
      enableEditing: false,
    } as MRT_ColumnDef<TShirtOrder>,
  ];
};

export const columnInfo = new Map<
  string | number | symbol | undefined,
  ColumnInfo
>([
  ["id", { excludeOnCreate: true } as ColumnInfo],
  ["updatedAt", { excludeOnCreate: true } as ColumnInfo],
  ["createdAt", { excludeOnCreate: true } as ColumnInfo],

  ["tshirt.size", { excludeOnCreate: true } as ColumnInfo],
  ["tshirt.color", { excludeOnCreate: true } as ColumnInfo],
  ["tshirt.styleNumber", { excludeOnCreate: true } as ColumnInfo],

  [
    TShirtOrderFields.AmtReceived,
    {
      excludeOnCreate: true,
      isEditable: true,
      isNumberField: true,
    } as ColumnInfo,
  ],
  [
    TShirtOrderFields.Qty,
    { isEditable: true, isNumberField: true } as ColumnInfo,
  ],
  [
    TShirtOrderFields.CostPerUnitCents,
    { isEditable: true, isFloatField: true } as ColumnInfo,
  ],
]);

export const iterateColumnInfo = (
  fn: (columnKey: string, colInfo: ColumnInfo) => void
) => {
  Array.from(columnInfo.keys()).forEach((key) => {
    let item = columnInfo.get(key);
    fn(key as string, item!);
  });
};
