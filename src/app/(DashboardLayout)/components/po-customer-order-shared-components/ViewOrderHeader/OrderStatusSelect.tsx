import { SelectValue } from "@/app/(DashboardLayout)/purchase-orders/table-constants";
import { FormControl, MenuItem, TextField } from "@mui/material";
import { EntityType } from "../CreateOrderPage";
import { CustomerOrderStatus, POStatus } from "@/API";

const colors = {
    green: "#13DEB9",
    red: "#f3704d",
    blue: "#5D87FF",
    yellow: "#FFAE1F"
}

const poStatusToColor = {
    [POStatus.Open]: colors.green,
    [POStatus.Closed]: colors.red,
    [POStatus.SentToVendor]: colors.blue
};

const coStatusToColor = {
    [CustomerOrderStatus.NEW]: colors.yellow,
    [CustomerOrderStatus.BLOCKED]: colors.red,
    [CustomerOrderStatus.COMPLETED]: colors.green,
    [CustomerOrderStatus.IN_PROGRESS]: colors.blue
}

const OrderStatusSelect = ({ status, onChange, entityType, selectValues }: {
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
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                        backgroundColor: entityType === EntityType.PurchaseOrder ?
                            poStatusToColor[status as POStatus] :
                            coStatusToColor[status as CustomerOrderStatus]
                    }
                }}
                select={true}
                size="small"
                onChange={onChange}
                value={status}
            >
                {selectValues?.map((option: SelectValue, i: number) => (
                    <MenuItem
                        key={`order-status-item${i}`}
                        value={option.value}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </TextField>
        </FormControl>
    )
}

export default OrderStatusSelect;