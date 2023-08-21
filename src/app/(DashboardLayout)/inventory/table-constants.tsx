import { TShirt, TShirtSize, TShirtType } from "@/API";
import { MRT_ColumnDef, MRT_Cell } from "material-react-table";

export const tablePrimaryKey = "styleNumber";
export const entityName = "TShirt";

export interface SelectValue {
  label: string;
  value: any;
}

export const selectInputFields = new Map<
  string | number | symbol | undefined,
  SelectValue[]
>([
  [
    "type",
    [
      { label: TShirtType.Cotton, value: TShirtType.Cotton },
      { label: TShirtType.Drifit, value: TShirtType.Drifit },
      { label: TShirtType.Blend, value: TShirtType.Blend },
    ],
  ],
  [
    "size",
    [
      { label: TShirtSize.NB, value: TShirtSize.NB },
      { label: TShirtSize.SixMonths, value: TShirtSize.SixMonths },
      { label: TShirtSize.TwelveMonths, value: TShirtSize.TwelveMonths },
      { label: TShirtSize.EighteenMonths, value: TShirtSize.EighteenMonths },
      { label: TShirtSize.TwoT, value: TShirtSize.TwoT },
      { label: TShirtSize.ThreeT, value: TShirtSize.ThreeT },
      { label: TShirtSize.FourT, value: TShirtSize.FourT },
      { label: TShirtSize.FiveT, value: TShirtSize.FiveT },
      { label: TShirtSize.YXS, value: TShirtSize.YXS },
      { label: TShirtSize.YS, value: TShirtSize.YS },
      { label: TShirtSize.YM, value: TShirtSize.YM },
      { label: TShirtSize.YL, value: TShirtSize.YL },
      { label: TShirtSize.YXL, value: TShirtSize.YXL },
      { label: TShirtSize.AS, value: TShirtSize.AS },
      { label: TShirtSize.AM, value: TShirtSize.AM },
      { label: TShirtSize.AL, value: TShirtSize.AL },
      { label: TShirtSize.AXL, value: TShirtSize.AXL },
      { label: TShirtSize.TwoX, value: TShirtSize.TwoX },
      { label: TShirtSize.ThreeX, value: TShirtSize.ThreeX },
      { label: TShirtSize.FourX, value: TShirtSize.FourX },
      { label: TShirtSize.FiveX, value: TShirtSize.FiveX },
    ],
  ],
]);

//Exclude these fields when creating
export const excludeOnCreateFields: string[] = ["updatedAt", "createdAt"];

export interface TShirtFormError {
  message: string;
}

export const initialTShirtFormState: any = {
  styleNumber: "",
  brand: "",
  color: "",
  size: TShirtSize.NB,
  type: TShirtType.Cotton,
  quantityOnHand: 0,
};
export const getInitialTShirtFormErrorMap = () =>
  new Map<string, string>(
    Object.keys(initialTShirtFormState).map((key) => [key, ""])
  );

export const getTableColumns = (
  getCommonEditTextFieldProps: (cell: MRT_Cell<TShirt>) => MRT_ColumnDef<TShirt>["muiTableBodyCellEditTextFieldProps"]
): MRT_ColumnDef<TShirt>[] => {
  return [
    {
      accessorKey: "styleNumber",
      header: "Style No.",
      muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
      enableEditing: false,
      helperText: "1",
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: "quantityOnHand",
      header: "Qty.",
      muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
        ...getCommonEditTextFieldProps(cell),
        type: "number",
      }),
      helperText: "2",
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: "brand",
      header: "Brand",
      muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
        ...getCommonEditTextFieldProps(cell),
      }),
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: "color",
      header: "Color",
      muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
        ...getCommonEditTextFieldProps(cell),
      }),
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: "size",
      header: "Size",
      muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
        ...getCommonEditTextFieldProps(cell),
      }),
      isSelectField: true,
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: "type",
      header: "Type",
      muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
        ...getCommonEditTextFieldProps(cell),
      }),
      isSelectField: true,
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: "updatedAt",
      header: "Last Modified",
      enableEditing: false,
    } as MRT_ColumnDef<TShirt>,
  ];
};
export const mockData: TShirt[] = [
  {
    __typename: "TShirt",
    id: "John",
    styleNumber: "100",
    brand: "adidas",
    color: "red",
    size: TShirtSize.AL,
    type: TShirtType.Blend,
    quantityOnHand: 1,
    createdAt: "any",
    updatedAt: "any",
  },
  {
    __typename: "TShirt",
    id: "Man",
    styleNumber: "1234",
    brand: "adidas",
    color: "red",
    size: TShirtSize.AL,
    type: TShirtType.Blend,
    quantityOnHand: 1,
    createdAt: "any",
    updatedAt: "any",
  },
  {
    __typename: "TShirt",
    id: "Jan",
    styleNumber: "1234",
    brand: "adidas",
    color: "red",
    size: TShirtSize.AL,
    type: TShirtType.Blend,
    quantityOnHand: 1,
    createdAt: "any",
    updatedAt: "any",
  },
];
