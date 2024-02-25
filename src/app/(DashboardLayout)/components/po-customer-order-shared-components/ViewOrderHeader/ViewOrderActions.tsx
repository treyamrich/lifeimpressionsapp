import { CustomerOrder, PurchaseOrder } from "@/API";
import { Box, Button, Grid } from "@mui/material";
import dayjs from "dayjs";

const ViewOrderActions = ({
  onEdit,
  onDelete,
  order,
}: {
  onEdit: () => void;
  onDelete: () => void;
  order: PurchaseOrder | CustomerOrder;
}) => {
  const getButtonField = ({
    text,
    onClick,
    color,
    id,
    columnSize,
    disabled,
  }: {
    text: string;
    onClick: () => void;
    color: string;
    id: string;
    columnSize: number;
    disabled?: boolean;
  }) => (
    <Grid item xs={columnSize}>
      <Box display="flex" justifyContent="flex-end">
        <Button
          id={id}
          color={color as any}
          variant="contained"
          size="small"
          onClick={onClick}
          disabled={disabled}
        >
          {text}
        </Button>
      </Box>
    </Grid>
  );

  const isOrderFromLastMonth =
    dayjs.utc(order.createdAt) < dayjs.utc().startOf("month");

  return (
    <Grid container style={{ marginBottom: "15px" }} justifyContent="flex-end">
      {getButtonField({
        text: "Edit Order Details",
        onClick: onEdit,
        color: "success",
        id: "edit-order-button",
        columnSize: 2,
      })}
      {getButtonField({
        text: "Delete Order",
        onClick: onDelete,
        color: "error",
        id: "delete-order-button",
        columnSize: 2,
        disabled: isOrderFromLastMonth,
      })}
    </Grid>
  );
};

export default ViewOrderActions;
