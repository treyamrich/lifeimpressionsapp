import { TShirtOrder } from "@/API";
import { CardContent, Grid, Stack, Typography } from "@mui/material";
import BlankCard from "../shared/BlankCard";
import { EntityType } from "./CreateOrderPage";
import { PurchaseOrderOrCustomerOrder } from "@/dynamodb-transactions/partiql-helpers";

const OrderTotalCard = ({ order, orderedItems }: {
    order: PurchaseOrderOrCustomerOrder;
    orderedItems: TShirtOrder[];
}) => {
    const subtotal = orderedItems
        .map(item => item.costPerUnit * item.quantity)
        .reduce((prev, curr) => prev + curr, 0);
    const taxRate = 0.04075;
    const fees = 0;
    const discounts = 0;
    const shipping = 0;
    const subsubTotal = (subtotal - discounts + fees + shipping);
    const total = subsubTotal * (1 + taxRate);
    const tax = taxRate * subsubTotal;
    const tableRowColor = '#e6e6e6';

    const getGridRow = (label: string, value: any, color: string = "") => (
        <>
            <Grid item xs={6} style={{ backgroundColor: color }}>
                <Typography variant="body1">{label}</Typography>
            </Grid>
            <Grid item xs={6} style={{ backgroundColor: color }}>
                <Typography variant="body1">{value}</Typography>
            </Grid>
        </>
    )
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
                <Typography variant="h6" color="textSecondary">
                    Order Total
                </Typography>
            </div>
            <div>
                <BlankCard>
                    <CardContent>
                        <Grid container>
                            {getGridRow("Total Qty", orderedItems.length, tableRowColor)}
                            {getGridRow("Tax Rate", `${taxRate * 100}%`)}
                            {getGridRow("Sub Total", `$${subtotal}`, tableRowColor)}
                            {getGridRow("Discounts", `$${discounts}`)}
                            {getGridRow("Fees", `$${fees}`, tableRowColor)}
                            {getGridRow("Shipping", `$${shipping}`)}
                            {getGridRow("Tax", `$${tax.toFixed(2)}`, tableRowColor)}
                            {getGridRow("Total", `$${total.toFixed(2)}`)}
                        </Grid>
                    </CardContent>
                </BlankCard>
            </div>
        </div>

    )
}
export default OrderTotalCard;