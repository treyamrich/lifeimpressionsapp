import { TShirt, TShirtSize, TShirtType } from "@/API";
import { MRT_ColumnDef, MRT_Cell } from "material-react-table";

export const tshirtPrimaryKey = "styleNumber";
export const entityName = "TShirt";

export const getTableColumns = (
  getCommonEditTextFieldProps: (cell: MRT_Cell<TShirt>) => MRT_ColumnDef<TShirt>["muiTableBodyCellEditTextFieldProps"]
): MRT_ColumnDef<TShirt>[] => {
  return [
    {
      accessorKey: "styleNumber",
      header: "Style No.",
      muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
      enableEditing: false,
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: "quantityOnHand",
      header: "Qty.",
      muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
        ...getCommonEditTextFieldProps(cell),
        type: "number",
      }),
      helperText: "2",
      size: 50,
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
      size: 50
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: "size",
      header: "Size",
      muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
        ...getCommonEditTextFieldProps(cell),
      }),
      size: 50,
      isSelectField: true,
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: "type",
      header: "Type",
      muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
        ...getCommonEditTextFieldProps(cell),
      }),
      size: 50,
      isSelectField: true,
    } as MRT_ColumnDef<TShirt>,
    {
      accessorKey: "updatedAt",
      header: "Last Modified",
      enableEditing: false,
    } as MRT_ColumnDef<TShirt>,
  ];
};