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

    const totalItemCost = orderedItems
        .map(item => item.costPerUnit * item.quantity)
        .reduce((prev, curr) => prev + curr, 0);

    const taxRate = order.taxRate / 100;
    const fees = order.fees ?? 0;
    const shipping = order.shipping ?? 0;

    let fullOrderDiscounts = order.discount;
    let tshirtDiscounts = orderedItems
        .map(item => item.discount)
        .reduce((prev, curr) => prev + curr, 0);
    const totalDiscounts = fullOrderDiscounts + tshirtDiscounts;

    let subtotal = (totalItemCost - totalDiscounts + fees + shipping);
    subtotal = subtotal >= 0 ? subtotal : 0;

    const total = subtotal * (1 + taxRate);
    const tax = taxRate * subtotal;
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
        if(tshirtOrder.quantity > 1) {
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
                        {getGridRow("TShirt Discounts", `$${tshirtDiscounts}`)}
                        {getGridRow("Full Order Discounts", `$${fullOrderDiscounts}`)}
                        {getGridRow("Total Discounts", `$${totalDiscounts}`, tableRowColor)}
                    </GridSection>

                    <GridSection>
                        {getGridRow("Total Qty", orderedItems.length)}
                        {orderedItems.map((item, i) =>
                            getGridRow(formatTShirtDisplay(item), formatTShirtOrderCost(item))
                        )}
                        {getGridRow("Sub Total", `$${totalItemCost}`, tableRowColor)}
                    </GridSection>

                    <GridSection>
                        {getGridRow("Fees", `$${fees}`)}
                        {getGridRow("Shipping", `$${shipping}`)}
                        {getGridRow("Tax Rate", `${taxRate * 100}%`)}
                        {getGridRow("Tax", `$${tax.toFixed(2)}`)}
                        {getGridRow("Total", `$${total.toFixed(2)}`, tableRowColor)}
                    </GridSection>
                </Grid>
            </CardContent>
        </BlankCard>
    )
}
export default OrderTotalCard;