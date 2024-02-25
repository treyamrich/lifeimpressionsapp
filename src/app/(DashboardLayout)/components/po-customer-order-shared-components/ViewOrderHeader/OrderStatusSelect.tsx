import { SelectValue } from "@/app/(DashboardLayout)/purchase-orders/table-constants";
import { FormControl, MenuItem, TextField } from "@mui/material";
import { EntityType } from "../CreateOrderPage";
import { CustomerOrderStatus, POStatus } from "@/API";

export enum OrderStatusColors {
  Green = "#13DEB9",
  Red = "#f3704d",
  Blue = "#5D87FF",
  Yellow = "#FFAE1F",
}

const poStatusToColor = {
  [POStatus.Open]: OrderStatusColors.Green,
  [POStatus.Closed]: OrderStatusColors.Red,
  [POStatus.SentToVendor]: OrderStatusColors.Blue,
};

const coStatusToColor = {
  [CustomerOrderStatus.NEW]: OrderStatusColors.Yellow,
  [CustomerOrderStatus.BLOCKED]: OrderStatusColors.Red,
  [CustomerOrderStatus.COMPLETED]: OrderStatusColors.Green,
  [CustomerOrderStatus.IN_PROGRESS]: OrderStatusColors.Blue,
};

const OrderStatusSelect = ({
  status,
  onChange,
  entityType,
  selectValues,
}: {
  status: POStatus | CustomerOrderStatus;
  onChange: (e: any) => void;
  entityType: EntityType;
  selectValues: SelectValue[] | undefined;
}) => {
  return (
    <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
      <TextField
        id="order-status"
        SelectProps={{
          sx: {
            color: "#ffffff",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            backgroundColor:
              entityType === EntityType.PurchaseOrder
                ? poStatusToColor[status as POStatus]
                : coStatusToColor[status as CustomerOrderStatus],
          },
        }}
        select={true}
        size="small"
        onChange={onChange}
        value={status}
      >
        {selectValues?.map((option: SelectValue, i: number) => (
          <MenuItem key={`order-status-item${i}`} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </FormControl>
  );
};

export default OrderStatusSelect;
