import { Box, Button, CardContent, FormGroup, FormLabel, Grid, Stack, Typography } from "@mui/material"
import React, { useEffect, useRef, useState } from "react"
import BlankCard from "../../components/shared/BlankCard";
import { Order } from "../page";
import { getTodayInSetTz, toReadableDateTime } from "@/utils/datetimeConversions";
import dayjs from "dayjs";
import { OrderTotal, calculateOrderTotal } from "@/utils/orderTotal";
import { downloadOrderLevelCSV } from "../util";

enum ViewMode {
    OrderLevel = "Order Level",
    OrderItemLevel = "Order Item Level"
}

const ViewReport = ({ orders }: {
    orders: Order[];
}) => {

    const orderIdToTotal = useRef(new Map<string, OrderTotal>());
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.OrderLevel);

    const switchView = () => {
        setViewMode(prevViewMode => {
            return prevViewMode === ViewMode.OrderLevel ? ViewMode.OrderItemLevel : ViewMode.OrderLevel;
        })
    }

    const downloadCSV = () => {
        if(viewMode === ViewMode.OrderLevel) {
            let today = toReadableDateTime(getTodayInSetTz().toString());
            downloadOrderLevelCSV(orders, orderIdToTotal.current, today)
            return;
        }
        //downloadTShirtLevelCSV(orders, )
    }

    useEffect(() => {
        let hmap = orderIdToTotal.current;
        orders.forEach(order => {
            const total = calculateOrderTotal(order, order.orderedItems);
            hmap.set(order.id, total);
        })
    }, [orders]);

    return (
        <BlankCard>
            <CardContent>
                {orders.length > 0 && (
                    <Stack spacing={2}>
                        <Typography variant="h6" color="textSecondary">
                            Today: {toReadableDateTime(dayjs().toString())}
                        </Typography>
                        <ViewReportControls
                            viewMode={viewMode}
                            switchView={switchView}
                            downloadCSV={downloadCSV}
                        />
                        <ViewReportTable
                            orders={orders}
                            viewMode={viewMode}
                        />
                    </Stack>
                )}
                {orders.length === 0 && (
                    <Box textAlign={"center"} alignItems={"center"}>
                        <Typography color="textSecondary">
                            Empty Report
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </BlankCard>
    )
}

export default ViewReport

const ViewReportControls = ({ viewMode, switchView, downloadCSV }: {
    viewMode: ViewMode;
    switchView: () => void;
    downloadCSV: () => void;
}) => (
    <Stack direction={"row"} alignItems={"center"} spacing={3}>
        <FormLabel component="legend">
            <Typography variant="h6">
                Granularity:
            </Typography>
        </FormLabel>
        <FormGroup>
            <Button
                color="primary"
                variant="contained"
                size="small"
                fullWidth
                onClick={switchView}
                type="submit"
                style={{ minWidth: "100px" }}
            >
                {viewMode}
            </Button>
        </FormGroup>

        <FormGroup>
            <Button
                color="primary"
                variant="contained"
                size="small"
                fullWidth
                onClick={downloadCSV}
                type="submit"
                style={{ minWidth: "100px" }}
            >
                Download CSV
            </Button>
        </FormGroup>
    </Stack>
)

const ViewReportTable = ({ viewMode, orders }: {
    viewMode: ViewMode;
    orders: Order[];
}) => {
    const tableRowColor = '#e6e6e6';
    const OrderLevelRow = ({ order, idx }: { order: Order, idx: number }) => {
        return (
            <React.Fragment key={`row-${idx}`}>
                <Grid item xs={9} style={{ backgroundColor: tableRowColor }}>
                    <Typography variant="body1">{""}</Typography>
                </Grid>
                <Grid item xs={3} style={{ backgroundColor: tableRowColor }} >
                    <Typography variant="body1">{""}</Typography>
                </Grid>
            </React.Fragment>
        )
    }

    const TShirtLevelRow = ({ order, idx }: { order: Order, idx: number }) => {
        return (
            <React.Fragment key={`row-${idx}`}>
            </React.Fragment>
        )
    }

    const GridRow = ({ order, idx }: { order: Order, idx: number }) => {
        return viewMode === ViewMode.OrderLevel ?
            <OrderLevelRow order={order} idx={idx} /> :
            <TShirtLevelRow order={order} idx={idx} />
    }

    return (
        <Grid container rowSpacing={3}>
            {orders.map((order, idx) => <GridRow key={`gridrow-${idx}`} order={order} idx={idx} />)}
        </Grid>
    )
}