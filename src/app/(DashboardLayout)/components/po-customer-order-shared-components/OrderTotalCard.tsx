import { TShirtOrder } from "@/API";
import { CardContent, Grid, Typography } from "@mui/material";
import BlankCard from "../shared/BlankCard";
import { ReactNode } from "react";
import React from "react";
import { OrderTotalModel, calculateOrderTotal } from "@/utils/orderTotal";
import { centsToDollars } from "@/utils/money";

const OrderTotalCard = ({ order, orderedItems }: {
    order: OrderTotalModel;
    orderedItems: TShirtOrder[];
}) => {
    const {
        subtotal,
        taxRate,
        fees,
        shipping,
        tax,
        total
    } = calculateOrderTotal(order, orderedItems);

    const tableRowColor = '#e6e6e6';

    let rowCount = 0
    const getGridRow = (label: string, value: any, color: string = "") => {
        rowCount += 1
        return (<React.Fragment key={`ordertotal-row-${rowCount}`}>
            <Grid item xs={9} style={{ backgroundColor: color }}>
                <Typography variant="body1">{label}</Typography>
            </Grid>
            <Grid item xs={3} style={{ backgroundColor: color }} >
                <Typography variant="body1">{value}</Typography>
            </Grid>
        </React.Fragment>)
    }

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
            qtyHint = ` ($${centsToDollars(tshirtOrder.costPerUnitCents)}) each`
        }
        return `${tshirt.styleNumber} - ${tshirt.color} ${tshirt.size} x ${tshirtOrder.quantity}${qtyHint}`
    }

    const formatTShirtOrderCost = (tshirtItem: TShirtOrder) => {
        const totalCents = tshirtItem.quantity * tshirtItem.costPerUnitCents;
        return `$${centsToDollars(totalCents)}`;
    }

    return (
        <BlankCard>
            <CardContent style={{ height: "338px", overflowY: "auto"}}>
                <Grid container rowSpacing={3}>
                    <GridSection>
                        {getGridRow("Total Qty", orderedItems.length)}
                        {orderedItems.map((item, i) =>
                            getGridRow(formatTShirtDisplay(item), formatTShirtOrderCost(item))
                        )}
                        {getGridRow("Sub Total", `$${subtotal}`, tableRowColor)}
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