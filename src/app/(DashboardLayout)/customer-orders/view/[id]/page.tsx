"use client";

import {
    CreateCustomerOrderChangeInput,
    CustomerOrder,
    CustomerOrderChange,
    TShirt,
    TShirtOrder,
    UpdateTShirtInput,
    UpdateTShirtOrderInput,
} from "@/API";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import TShirtOrderTable from "@/app/(DashboardLayout)/components/tshirt-order-table/TShirtOrderTable";
import { getCustomerOrderAPI } from "@/app/graphql-helpers/fetch-apis";
import {
    DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";

import { Typography, Grid, CardContent } from "@mui/material";
import { useState, useEffect } from "react";

import { toReadableDateTime } from "@/utils/datetimeConversions";
import { createCustomerOrderChangeAPI, createTShirtOrderAPI } from "@/app/graphql-helpers/create-apis";
import { MRT_Row } from "material-react-table";
import {
    updateTShirtAPI,
    updateTShirtOrderAPI,
} from "@/app/graphql-helpers/update-apis";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import ViewCOHeaderFields from "./ViewCOHeaderFields";
import COChangeHistoryTable from "@/app/(DashboardLayout)/components/order-change-history-table/COChangeHistoryTable";
import { CreateOrderChangeInput } from "@/app/(DashboardLayout)/components/tshirt-order-table/table-constants";

type ViewCustomerOrderProps = {
    params: { id: string };
};

const ViewCustomerOrder = ({ params }: ViewCustomerOrderProps) => {
    const { id } = params;
    const { rescueDBOperation } = useDBOperationContext();
    const [co, setCo] = useState<CustomerOrder>({} as CustomerOrder);
    const [editHistory, setEditHistory] = useState<CustomerOrderChange[]>([]);
    const [updatedOrderedItems, setUpdatedOrderedItems] = useState<TShirtOrder[]>(
        () => {
            return co.orderedItems ? (co.orderedItems.items as TShirtOrder[]) : [];
        }
    );

    const fetchCustomerOrder = () => {
        rescueDBOperation(
            () => getCustomerOrderAPI({ id }),
            DBOperation.GET,
            (res: CustomerOrder) => {
                // const changeHistory = res.changeHistory?.items;
                // if (changeHistory) {
                //     const newChangeHistory: CustomerOrderChange[] = changeHistory.map((change) => {
                //         if (change) {
                //             change = {
                //                 ...change,
                //                 createdAt: toReadableDateTime(change.createdAt),
                //             };
                //         }
                //         return change;
                //     }) as CustomerOrderChange[];
                //     setEditHistory(newChangeHistory);
                // }
                setCo({
                    ...res,
                    createdAt: toReadableDateTime(res.createdAt),
                    updatedAt: toReadableDateTime(res.updatedAt),
                    dateNeededBy: toReadableDateTime(res.dateNeededBy)
                });
                const orderedItems = res.orderedItems ? res.orderedItems.items : [];
                setUpdatedOrderedItems(orderedItems.filter(v => v !== null) as TShirtOrder[]);
            }
        );
    };

    useEffect(() => {
        fetchCustomerOrder();
    }, []);

    if (co.__typename === undefined)
        return (<></>);

    return (
        <PageContainer
            title="View Customer Order"
            description="this is View Customer Order"
        >
            <DashboardCard title={`Customer Order: ${co.orderNumber}`}>
                <Grid container spacing={3} direction="column" padding={2}>
                    <Grid item>
                        <ViewCOHeaderFields co={co} setCo={setCo} />
                    </Grid>
                    <Grid item>
                        <Grid container direction="column" spacing={1}>
                            <Grid item>
                                <Typography variant="h6" color="textSecondary">
                                    Ordered Items
                                </Typography>
                            </Grid>
                            <Grid item>
                                <OrderedItemsTable
                                    tableData={updatedOrderedItems}
                                    setTableData={setUpdatedOrderedItems}
                                    parentCustomerOrder={co}
                                    changeHistory={editHistory}
                                    setChangeHistory={setEditHistory}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Grid container direction="column" spacing={1}>
                            <Grid item>
                                <Typography variant="h6" color="textSecondary">
                                    Change History
                                </Typography>
                            </Grid>
                            <Grid item>
                                <ChangeHistoryTable changeHistory={editHistory} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </DashboardCard>
        </PageContainer>
    );
};

export default ViewCustomerOrder;

type OrderedItemsTableProps = {
    tableData: TShirtOrder[];
    setTableData: React.Dispatch<React.SetStateAction<TShirtOrder[]>>;
    parentCustomerOrder: CustomerOrder;
    changeHistory: CustomerOrderChange[];
    setChangeHistory: React.Dispatch<React.SetStateAction<CustomerOrderChange[]>>;
};

const OrderedItemsTable = ({
    tableData,
    setTableData,
    parentCustomerOrder,
    changeHistory,
    setChangeHistory,
}: OrderedItemsTableProps) => {
    const { rescueDBOperation } = useDBOperationContext();
    const handleAfterRowEdit = (
        row: MRT_Row<TShirtOrder>,
        orderChange: CreateOrderChangeInput,
        exitEditingMode: () => void
    ) => {
        const coChange = orderChange as CreateCustomerOrderChangeInput;
        const prevTShirtOrder = row.original;
        const prevAmtOrdered = prevTShirtOrder.quantity ? prevTShirtOrder.quantity : 0;
        const newAmtOrdered = coChange.orderedQuantityChange + prevAmtOrdered;

        // Update inventory
        const newTShirt: UpdateTShirtInput = {
            styleNumber: prevTShirtOrder.tShirtOrderTshirtStyleNumber,
            quantityOnHand: newAmtOrdered,
        };
        rescueDBOperation(
            () => updateTShirtAPI(newTShirt),
            DBOperation.UPDATE,
            (_: TShirt) => {
                // Update TShirtOrder DB table
                const newTShirtOrder: UpdateTShirtOrderInput = {
                    id: prevTShirtOrder.id,
                    quantity: newAmtOrdered
                };
                rescueDBOperation(
                    () => updateTShirtOrderAPI(newTShirtOrder),
                    DBOperation.UPDATE,
                    (resp: TShirtOrder) => {
                        // Update local TShirtOrder table
                        tableData[row.index] = resp;
                        setTableData([...tableData]);
                    }
                );
                // Update CO change DB table
                rescueDBOperation(
                    () => createCustomerOrderChangeAPI(coChange),
                    DBOperation.CREATE,
                    (coChangeResp: CustomerOrderChange) => {
                        // Update local CO change history table
                        const changeCo = {
                            ...coChangeResp,
                            createdAt: toReadableDateTime(coChangeResp.createdAt),
                        };
                        setChangeHistory([changeCo, ...changeHistory]);
                    }
                );
            }
        );
        exitEditingMode();
    };

    const handleAfterRowAdd = (newTShirtOrder: TShirtOrder) => {
        if (newTShirtOrder.id) return; // Only create new tshirt orders

        // Update the purchase order with the new added item
        rescueDBOperation(
            () => createTShirtOrderAPI(parentCustomerOrder, [newTShirtOrder]),
            DBOperation.CREATE,
            (resp: TShirtOrder) => {}
        )
    };

    return (
        <BlankCard>
            <CardContent>
                <TShirtOrderTable
                    tableData={tableData}
                    setTableData={setTableData}
                    parentOrderId={parentCustomerOrder.id}
                    onRowEdit={handleAfterRowEdit}
                    onRowAdd={handleAfterRowAdd}
                    entityType={EntityType.CustomerOrder}
                />
            </CardContent>
        </BlankCard>
    );
};

type ChangeHistoryTableProps = {
    changeHistory: CustomerOrderChange[];
};

const ChangeHistoryTable = ({ changeHistory }: ChangeHistoryTableProps) => {
    return (
        <BlankCard>
            <CardContent>
                <COChangeHistoryTable changeHistory={changeHistory} />
            </CardContent>
        </BlankCard>
    );
};
