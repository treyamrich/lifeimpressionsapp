import { TShirt, TShirtSize, TShirtType } from "@/API";
import { toReadableDateTime } from "@/utils/datetimeConversions";
import { MRT_ColumnDef } from "material-react-table";
import { ColumnInfo } from "../../purchase-orders/table-constants";

export const tshirtPrimaryKey = "styleNumber";
export const entityName = "TShirt";

export const hiddenColumns = { id: false };

export const tshirtSizeToLabel: any = {
  [TShirtSize.NB]: "New Born",
  [TShirtSize.SixMonths]: "6 Months",
  [TShirtSize.TwelveMonths]: "12 Months",
  [TShirtSize.EighteenMonths]: "18 Months",
  [TShirtSize.TwoT]: "2T",
  [TShirtSize.ThreeT]: "3T",
  [TShirtSize.FourT]: "4T",
  [TShirtSize.FiveT]: "5T",
  [TShirtSize.YXS]: "Youth XS",
  [TShirtSize.YS]: "Youth S",
  [TShirtSize.YM]: "Youth M",
  [TShirtSize.YL]: "Youth L",
  [TShirtSize.YXL]: "Youth XL",
  [TShirtSize.AXS]: "Adult XS",
  [TShirtSize.AS]: "Adult S",
  [TShirtSize.AM]: "Adult M",
  [TShirtSize.AL]: "Adult L",
  [TShirtSize.AXL]: "Adult XL",
  [TShirtSize.TwoX]: "2X",
  [TShirtSize.ThreeX]: "3X",
  [TShirtSize.FourX]: "4X",
  [TShirtSize.FiveX]: "5X",
};

export const tshirtTypeToLabel: any = {
  [TShirtType.Cotton]: "Cotton",
  [TShirtType.Blend]: "Blend",
  [TShirtType.Drifit]: "Dri-Fit",
};

export enum TShirtFields {
  StyleNumber = "styleNumber",
  Brand = "brand",
  Color = "color",
  Size = "size",
  Type = "type",
  QtyOnHand = "quantityOnHand",
}

export const toTShirtColumnHeaderMap = {
  [TShirtFields.StyleNumber]: "Style No.",
  [TShirtFields.Brand]: "Brand",
  [TShirtFields.Color]: "Color",
  [TShirtFields.Size]: "Size",
  [TShirtFields.Type]: "Type",
  [TShirtFields.QtyOnHand]: "Qty."
}

export const getTableColumns = (): MRT_ColumnDef<TShirt>[] => {
  return [
    {
      accessorKey: "id",
      header: "ID",
      enableEditing: false,
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: TShirtFields.StyleNumber,
      header: toTShirtColumnHeaderMap[TShirtFields.StyleNumber],
      muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
      enableEditing: false,
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: TShirtFields.QtyOnHand,
      header: toTShirtColumnHeaderMap[TShirtFields.QtyOnHand],
      size: 50,
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: TShirtFields.Brand,
      header: toTShirtColumnHeaderMap[TShirtFields.Brand],
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: TShirtFields.Color,
      header: toTShirtColumnHeaderMap[TShirtFields.Color],
      size: 50,
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: TShirtFields.Size,
      header: toTShirtColumnHeaderMap[TShirtFields.Size],
      size: 50,
      isSelectField: true,
      Cell: ({ renderedCellValue, row }) => (
        <> {tshirtSizeToLabel[row.original.size]}</>
      ),
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: TShirtFields.Type,
      header: toTShirtColumnHeaderMap[TShirtFields.Type],
      size: 50,
      isSelectField: true,
      Cell: ({ renderedCellValue, row }) => (
        <>{tshirtTypeToLabel[row.original.type]}</>
      ),
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: "updatedAt",
      header: "Last Modified",
      enableEditing: false,
      Cell: ({ renderedCellValue, row }) => (
        <>{toReadableDateTime(row.original.updatedAt)}</>
      ),
    } as MRT_ColumnDef<TShirt>,
  ];
};

export const columnInfo = new Map<
  string | number | symbol | undefined,
  ColumnInfo
>([
  ["id", { excludeOnCreate: true } as ColumnInfo],
  ["updatedAt", { excludeOnCreate: true } as ColumnInfo],
  ["createdAt", { excludeOnCreate: true } as ColumnInfo],

  ["styleNumber", { isRequired: true } as ColumnInfo],

  ["brand", { isEditable: true, isRequired: true } as ColumnInfo],
  ["quantityOnHand", { isEditable: true, isNumberField: true } as ColumnInfo],
  ["color", { isEditable: true, isRequired: true } as ColumnInfo],
  [
    "size",
    {
      isEditable: true,
      selectFields: Object.keys(tshirtSizeToLabel).map((key: string) => {
        return { label: tshirtSizeToLabel[key], value: key };
      }),
    } as ColumnInfo,
  ],
  [
    "type",
    {
      isEditable: true,
      selectFields: Object.keys(tshirtTypeToLabel).map((key: string) => {
        return { label: tshirtTypeToLabel[key], value: key };
      }),
    } as ColumnInfo,
  ],
]);

export const editableTShirtFields = Array.from(columnInfo)
  .filter((keyPair) => keyPair[1].isEditable)
  .map((keyPair) => keyPair[0] as string);
