import { POStatus, PurchaseOrder, TShirtSize, TShirtType } from "@/API";
import { MRT_ColumnDef } from "material-react-table";

export interface SelectValue {
  label: string;
  value: any;
}

export const tablePrimaryKey = "id"
export const entityName = "PurchaseOrder"

export const initialPurchaseOrderFormState: any = {
  orderNumber: "",
  vendor: "",
  orderedItems: [],
  status: POStatus.Open,
  changeHistory: []
}

export const getTableColumns = (): MRT_ColumnDef<PurchaseOrder>[] => {
    return [
      {
        accessorKey: "id",
        header: "Id",
        muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
        enableEditing: false,
        helperText: "1",
      } as MRT_ColumnDef<PurchaseOrder>,
      {
        accessorKey: "vendor",
        header: "Vendor",
        helperText: "2",
      } as MRT_ColumnDef<PurchaseOrder>,
      {
        accessorKey: "createdAt",
        header: "Created on",
      } as MRT_ColumnDef<PurchaseOrder>,
      {
        accessorKey: "updatedAt",
        header: "Last Modified",
        enableEditing: false,
      } as MRT_ColumnDef<PurchaseOrder>,
    ];
  };

//Exclude these fields when creating
export const excludeOnCreateFields: string[] = ["updatedAt", "createdAt"];

export const getInitialPurchaseOrderFormErrorMap = () =>
  new Map<string, string>(
    Object.keys(initialPurchaseOrderFormState).map((key) => [key, ""])
  );

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