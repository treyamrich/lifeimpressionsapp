"use client";

import {
    CreateCustomerOrderChangeInput,
    CustomerOrder,
    CustomerOrderChange,
    TShirtOrder,
} from "@/API";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import TShirtOrderTable, { TableMode } from "@/app/(DashboardLayout)/components/tshirt-order-table/TShirtOrderTable";
import { getCustomerOrderAPI } from "@/graphql-helpers/fetch-apis";
import {
    DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";

import { Typography, Grid, CardContent } from "@mui/material";
import { useState, useEffect } from "react";

import { toReadableDateTime } from "@/utils/datetimeConversions";
import { createTShirtOrderAPI } from "@/graphql-helpers/create-apis";
import { MRT_Row } from "material-react-table";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import ViewCOHeaderFields from "./ViewCOHeaderFields";
import COChangeHistoryTable from "@/app/(DashboardLayout)/components/order-change-history-table/COChangeHistoryTable";
import { CreateOrderChangeInput, OrderChange } from "@/app/(DashboardLayout)/components/tshirt-order-table/table-constants";
import { useAuthContext } from "@/contexts/AuthContext";
import { UpdateOrderTransactionInput, UpdateOrderTransactionResponse, updateOrderTransactionAPI } from "@/dynamodb-transactions/update-order-transaction";
import NegativeInventoryConfirmPopup from "@/app/(DashboardLayout)/components/forms/confirm-popup/NegativeInventoryConfirmPopup";
import { NegativeInventoryWarningState, initialNegativeInventoryWarningState } from "@/app/(DashboardLayout)/purchase-orders/view/[id]/page";

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
                const changeHistory = res.changeHistory?.items;
                if (changeHistory) {
                    const newChangeHistory: CustomerOrderChange[] =
                        changeHistory.map((change) => {
                            if (change) {
                                change = {
                                    ...change,
                                    createdAt: toReadableDateTime(change.createdAt),
                                };
                            }
                            return change;
                        }) as CustomerOrderChange[];
                    setEditHistory(newChangeHistory);
                }
                setCo({
                    ...res,
                    createdAt: toReadableDateTime(res.createdAt),
                    updatedAt: toReadableDateTime(res.updatedAt),
                    dateNeededBy: toReadableDateTime(res.dateNeededBy)
                });
                const orderedItems = res.orderedItems ? res.orderedItems.items : [];
                setUpdatedOrderedItems(orderedItems.filter(v => v !== null) as TShirtOrder[]);
            },
            "Order does not exist."
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
                                    setCustomerOrder={setCo}
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
    setCustomerOrder: React.Dispatch<React.SetStateAction<CustomerOrder>>;
    changeHistory: CustomerOrderChange[];
    setChangeHistory: React.Dispatch<React.SetStateAction<CustomerOrderChange[]>>;
};

const OrderedItemsTable = ({
    tableData,
    setTableData,
    parentCustomerOrder,
    setCustomerOrder,
    changeHistory,
    setChangeHistory,
}: OrderedItemsTableProps) => {
    const { rescueDBOperation } = useDBOperationContext();
    const { user } = useAuthContext();
    const [negativeInventoryWarning, setNegativeInventoryWarning] =
        useState<NegativeInventoryWarningState>({ ...initialNegativeInventoryWarningState });

    const handleAfterRowEdit = (
        row: MRT_Row<TShirtOrder>,
        orderChange: CreateOrderChangeInput,
        exitEditingMode: () => void,
        allowNegativeInventory: boolean = false
    ) => {
        // quantityChange is only for PurchaseOrders
        const coChange = {
            ...orderChange,
            quantityChange: undefined
        } as any as CreateCustomerOrderChangeInput;
        const prevTShirtOrder = row.original;
        const prevAmtOrdered = prevTShirtOrder.quantity ? prevTShirtOrder.quantity : 0;
        const newAmtOrdered = coChange.orderedQuantityChange + prevAmtOrdered;

        const updateCOInput: UpdateOrderTransactionInput = {
            tshirtOrder: prevTShirtOrder,
            parentOrderId: parentCustomerOrder.id,
            reason: coChange.reason,
            tshirtTableQtyDelta: coChange.orderedQuantityChange,
            orderedQtyDelta: 0 // unused for CustomerOrder
        };

        // Only warn negative inventory when inventory will be reduced
        allowNegativeInventory = allowNegativeInventory ||
            coChange.orderedQuantityChange <= 0;

        rescueDBOperation(
            () => updateOrderTransactionAPI(
                updateCOInput,
                EntityType.CustomerOrder,
                user,
                DBOperation.UPDATE,
                allowNegativeInventory
            ),
            DBOperation.UPDATE,
            (resp: UpdateOrderTransactionResponse) => {
                // Transaction failed
                if (resp === null) {
                    setNegativeInventoryWarning({
                        show: true,
                        cachedFunctionCall: () =>
                            handleAfterRowEdit(row, orderChange, exitEditingMode, true),
                        failedTShirtStyleNumber: prevTShirtOrder.tShirtOrderTshirtStyleNumber
                    })
                    return;
                }

                // Update local TShirtOrderTable
                const newTShirtOrder: TShirtOrder = {
                    ...prevTShirtOrder,
                    quantity: newAmtOrdered
                };
                tableData[row.index] = newTShirtOrder;
                setTableData([...tableData]);

                // Update local change history table
                const changeCo = {
                    ...resp.orderChange,
                    createdAt: toReadableDateTime(resp.orderChange.createdAt),
                } as CustomerOrderChange;
                setChangeHistory([changeCo, ...changeHistory]);
                setCustomerOrder({...parentCustomerOrder, updatedAt: toReadableDateTime(resp.orderUpdatedAtTimestamp)});
                exitEditingMode();
                setNegativeInventoryWarning({ ...initialNegativeInventoryWarningState });
            },
        );
    };

    const handleAfterRowAdd = (
        newTShirtOrder: TShirtOrder,
        callback: (newTshirtOrderId: string) => void,
        allowNegativeInventory: boolean = false
    ) => {
        if (newTShirtOrder.id) return; // Only create new tshirt orders

        const updateCOInput: UpdateOrderTransactionInput = {
            tshirtOrder: newTShirtOrder,
            parentOrderId: parentCustomerOrder.id,
            reason: "Added tshirt to customer order",
            tshirtTableQtyDelta: newTShirtOrder.quantity,
            orderedQtyDelta: 0 // unused for CustomerOrder
        };

        // Update the customer order with the new added item
        rescueDBOperation(
            () => updateOrderTransactionAPI(
                updateCOInput,
                EntityType.CustomerOrder,
                user,
                DBOperation.CREATE,
                allowNegativeInventory
            ),
            DBOperation.CREATE,
            (resp: UpdateOrderTransactionResponse) => {
                // Transaction failed
                if (resp === null) {
                    setNegativeInventoryWarning({
                        show: true,
                        cachedFunctionCall: () =>
                            handleAfterRowAdd(newTShirtOrder, callback, true),
                        failedTShirtStyleNumber: newTShirtOrder.tShirtOrderTshirtStyleNumber
                    })
                    return;
                }
                const changeCo = {
                    ...resp.orderChange,
                    createdAt: toReadableDateTime(resp.orderChange.createdAt),
                } as CustomerOrderChange;
                setChangeHistory([changeCo, ...changeHistory]);
                setCustomerOrder({...parentCustomerOrder, updatedAt: toReadableDateTime(resp.orderUpdatedAtTimestamp)});
                callback(resp.newTShirtOrderId ? resp.newTShirtOrderId : "");
                setNegativeInventoryWarning({ ...initialNegativeInventoryWarningState });
            }
        )
    };

    return (
        <BlankCard>
            <CardContent>
                {negativeInventoryWarning.show && (
                    <NegativeInventoryConfirmPopup
                        open={negativeInventoryWarning.show}
                        onClose={() => setNegativeInventoryWarning({
                            ...negativeInventoryWarning,
                            show: false
                        })}
                        onSubmit={negativeInventoryWarning.cachedFunctionCall}
                        failedTShirts={[negativeInventoryWarning.failedTShirtStyleNumber]}
                    />
                )}
                <TShirtOrderTable
                    tableData={tableData}
                    setTableData={setTableData}
                    parentOrderId={parentCustomerOrder.id}
                    onRowEdit={handleAfterRowEdit}
                    onRowAdd={handleAfterRowAdd}
                    entityType={EntityType.CustomerOrder}
                    mode={TableMode.Edit}
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
