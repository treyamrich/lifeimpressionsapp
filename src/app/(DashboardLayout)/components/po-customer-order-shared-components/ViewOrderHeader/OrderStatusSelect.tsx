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

const OrderStatusSelect = ({ status, onChange, entityType, selectValues }: {
    status: string;
    onChange: (e: any) => void;
    entityType: EntityType;
    selectValues: SelectValue[] | undefined;
}) => {
    const getPOStatusStyle = (status: POStatus) => {
        let bg = "";
        switch (status) {
            case POStatus.Open:
                bg = colors.green
                break;
            case POStatus.Closed:
                bg = colors.red
                break;
            case POStatus.SentToVendor:
                bg = colors.blue
        }
        return bg
    }

    const getCOStatusStyle = (status: CustomerOrderStatus) => {
        let bg = ""
        switch (status) {
            case CustomerOrderStatus.NEW:
                bg = colors.yellow
                break;
            case CustomerOrderStatus.BLOCKED:
                bg = colors.red
                break;
            case CustomerOrderStatus.COMPLETED:
                bg = colors.green
                break;
            case CustomerOrderStatus.IN_PROGRESS:
                bg = colors.blue
                break;
        }
        return bg
    }
    return (
        <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
            <TextField
                id="order-status"
                SelectProps={{
                    sx: {
                        color: "#ffffff",
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                        backgroundColor: entityType === EntityType.PurchaseOrder ?
                            getPOStatusStyle(status as POStatus) :
                            getCOStatusStyle(status as CustomerOrderStatus)
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