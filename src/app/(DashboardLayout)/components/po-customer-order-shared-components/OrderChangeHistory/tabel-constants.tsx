import { OrderChange } from "@/API";
import { toReadableDateTime } from "@/utils/datetimeConversions";
import { Box, Stack, Typography } from "@mui/material";
import { MRT_ColumnDef } from "material-react-table";
import { toTShirtOrderColumnHeaderMap, TShirtOrderFields } from "../../TShirtOrderTable/table-constants";
import {
  toTShirtColumnHeaderMap,
  tshirtSizeColumnFilterFn,
  tshirtSizeToLabel,
} from "@/app/(DashboardLayout)/inventory/InventoryTable/table-constants";
import { EntityType } from "../CreateOrderPage";
import { centsToDollars } from "@/utils/money";

export const getTableColumns = (changesHaveParentOrder: boolean): MRT_ColumnDef<OrderChange>[] => {
  return [
    {
      accessorKey: "tshirt.styleNumber",
      header: "Style No.",
      muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
      size: 50,
    } as MRT_ColumnDef<OrderChange>,
    {
      accessorKey: "tshirt.size",
      header: "Size",
      muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
      size: 50,
      Cell: ({ renderedCellValue, row }) => (
        <span>{tshirtSizeToLabel[row.original.tshirt.size]}</span>
      ),
      filterFn: tshirtSizeColumnFilterFn,
    } as MRT_ColumnDef<OrderChange>,
    {
      accessorKey: "tshirt.color",
      header: "Color",
      muiTableHeadCellProps: { sx: { color: "green" } }, //custom props
      size: 50,
    } as MRT_ColumnDef<OrderChange>,
    {
      accessorFn: (orderChange: OrderChange) => {
        let fieldNameToColumnHeaderMap: any = changesHaveParentOrder
          ? toTShirtOrderColumnHeaderMap
          : toTShirtColumnHeaderMap;
        return (
          <Stack>
            {orderChange.fieldChanges.map((fieldChange, idx) => {
              let oldValue = fieldChange.oldValue;
              let newValue = fieldChange.newValue;
              if (fieldChange.fieldName === TShirtOrderFields.CostPerUnitCents) {
                let parsedOldVal = parseInt(fieldChange.oldValue, 10);
                let parsedNewVal = parseInt(fieldChange.newValue, 10);
                // The value could've been '-' if the field was null
                oldValue = isNaN(parsedOldVal) ? fieldChange.oldValue : centsToDollars(parsedOldVal).toString();
                newValue = isNaN(parsedNewVal) ? fieldChange.newValue : centsToDollars(parsedNewVal).toString();
              }
              return (
              <Box key={`order-change-${idx}`}>
                <Typography variant="body1" fontWeight={500}>
                  {fieldNameToColumnHeaderMap[fieldChange.fieldName]}
                </Typography>
                <Typography variant="body2">
                  From: {oldValue} To: {newValue}
                </Typography>
              </Box>
            )})}
          </Stack>
        );
      },
      header: "Change",
    } as MRT_ColumnDef<OrderChange>,
    {
      accessorKey: "reason",
      header: "Reason",
    } as MRT_ColumnDef<OrderChange>,
    {
      accessorKey: "createdAt",
      header: "Date",
      sortingFn: (rowA, rowB, columnId) => {
        const l = new Date(rowA.getValue(columnId));
        const r = new Date(rowB.getValue(columnId));
        if (l < r) return -1;
        if (l > r) return 1;
        return 0;
      },
      Cell: ({ renderedCellValue, row }) => (
        <span>{toReadableDateTime(row.original.createdAt)}</span>
      ),
    } as MRT_ColumnDef<OrderChange>,
  ];
};
