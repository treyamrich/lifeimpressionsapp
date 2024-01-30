import { TShirtOrder } from "@/API";
import { CardContent, Grid, Typography } from "@mui/material";
import BlankCard from "../shared/BlankCard";
import { ReactNode } from "react";

export interface OrderTotalModel {
    taxRate: number;
    shipping?: number;
    fees?: number;
    discount: number;
}

const OrderTotalCard = ({ order, orderedItems }: {
    order: OrderTotalModel;
    orderedItems: TShirtOrder[];
}) => {

    const subtotal = orderedItems
        .map(item => item.costPerUnit * item.quantity)
        .reduce((prev, curr) => prev + curr, 0);

    const fullOrderDiscounts = order.discount;
    const tshirtDiscounts = orderedItems
        .map(item => item.discount)
        .reduce((prev, curr) => prev + curr, 0);
    const totalDiscounts = fullOrderDiscounts + tshirtDiscounts;

    const discountsApplied = Math.max(0, subtotal - totalDiscounts);

    const taxRate = order.taxRate / 100;
    const fees = order.fees ?? 0;
    const shipping = order.shipping ?? 0;

    const tax = taxRate * discountsApplied;

    const total = discountsApplied + tax + shipping + fees;
    const tableRowColor = '#e6e6e6';

    const getGridRow = (label: string, value: any, color: string = "") => (
        <>
            <Grid item xs={9} style={{ backgroundColor: color }} key={label + "-label"}>
                <Typography variant="body1">{label}</Typography>
            </Grid>
            <Grid item xs={3} style={{ backgroundColor: color }} key={value + "-label"}>
                <Typography variant="body1">{value}</Typography>
            </Grid>
        </>
    )

    const GridSection = ({ children }: { children: ReactNode }) => (
        <Grid item xs={12}>
            <Grid container>
                {children} </Grid>
        </Grid>
    )

    const formatTShirtDisplay = (tshirtOrder: TShirtOrder) => {
        const tshirt = tshirtOrder.tshirt;
        let qtyHint = ''
        if (tshirtOrder.quantity > 1) {
            qtyHint = ` ($${tshirtOrder.costPerUnit}) each`
        }
        return `${tshirt.styleNumber} - ${tshirt.color} ${tshirt.size} x ${tshirtOrder.quantity}${qtyHint}`
    }

    const formatTShirtOrderCost = (tshirtItem: TShirtOrder) => {
        const total = tshirtItem.quantity * tshirtItem.costPerUnit;
        return `$${total}`
    }

    return (
        <BlankCard>
            <CardContent>
                <Grid container rowSpacing={3}>
                    <GridSection>
                        {getGridRow("Total Qty", orderedItems.length)}
                        {orderedItems.map((item, i) =>
                            getGridRow(formatTShirtDisplay(item), formatTShirtOrderCost(item))
                        )}
                        {getGridRow("Sub Total", `$${subtotal}`, tableRowColor)}
                    </GridSection>

                    <GridSection>
                        {getGridRow("Per Item Discounts", `-$${tshirtDiscounts}`)}
                        {getGridRow("Full Order Discounts", `-$${fullOrderDiscounts}`)}
                        {getGridRow("Total Discounts", `-$${totalDiscounts}`, tableRowColor)}
                    </GridSection>

                    <GridSection>
                        {getGridRow("Tax Rate", `${taxRate * 100}%`)}
                        {getGridRow("Tax", `$${tax.toFixed(2)}`)}
                        {getGridRow("Fees", `$${fees}`)}
                        {getGridRow("Shipping", `$${shipping}`)}
                        {getGridRow("Total", `$${total.toFixed(2)}`, tableRowColor)}
                    </GridSection>
                </Grid>
            </CardContent>
        </BlankCard>
    )
}
export default OrderTotalCard;