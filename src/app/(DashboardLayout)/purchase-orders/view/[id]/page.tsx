"use client";

import {
    CreatePurchaseOrderChangeInput,
    PurchaseOrder,
    PurchaseOrderChange,
    TShirtOrder,
} from "@/API";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import TShirtOrderTable, { TableMode } from "@/app/(DashboardLayout)/components/tshirt-order-table/TShirtOrderTable";
import { getPurchaseOrderAPI } from "@/graphql-helpers/fetch-apis";
import {
    DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";

import { Typography, Grid, CardContent } from "@mui/material";
import { useState, useEffect } from "react";
import ViewPOHeaderFields from "./ViewPOHeaders";
import { toReadableDateTime } from "@/utils/datetimeConversions";

import { MRT_Row } from "material-react-table";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { CreateOrderChangeInput } from "@/app/(DashboardLayout)/components/tshirt-order-table/table-constants";
import POChangeHistoryTable from "@/app/(DashboardLayout)/components/order-change-history-table/POChangeHistoryTable";
import { useAuthContext } from "@/contexts/AuthContext";
import { UpdateOrderTransactionInput, UpdateOrderTransactionResponse, updateOrderTransactionAPI } from "@/dynamodb-transactions/update-order-transaction";
import NegativeInventoryConfirmPopup from "@/app/(DashboardLayout)/components/forms/confirm-popup/NegativeInventoryConfirmPopup";
import { initialNegativeInventoryWarningState, type NegativeInventoryWarningState } from "@/app/(DashboardLayout)/components/forms/confirm-popup/NegativeInventoryConfirmPopup";

type ViewPurchaseOrderProps = {
    params: { id: string };
};

const ViewPurchaseOrder = ({ params }: ViewPurchaseOrderProps) => {
    const { id } = params;
    const { rescueDBOperation } = useDBOperationContext();
    const [po, setPo] = useState<PurchaseOrder>({} as PurchaseOrder);
    const [editHistory, setEditHistory] = useState<PurchaseOrderChange[]>([]);
    const [updatedOrderedItems, setUpdatedOrderedItems] = useState<TShirtOrder[]>(
        () => {
            return po.orderedItems ? (po.orderedItems.items as TShirtOrder[]) : [];
        }
    );

    const fetchPurchaseOrder = () => {
        rescueDBOperation(
            () => getPurchaseOrderAPI({ id }),
            DBOperation.GET,
            (res: PurchaseOrder) => {
                const changeHistory = res.changeHistory?.items;
                if (changeHistory) {
                    const newChangeHistory: PurchaseOrderChange[] = changeHistory.map((change) => {
                        if (change) {
                            change = {
                                ...change,
                                createdAt: toReadableDateTime(change.createdAt),
                            };
                        }
                        return change;
                    }) as PurchaseOrderChange[];
                    setEditHistory(newChangeHistory);
                }
                setPo({
                    ...res,
                    updatedAt: toReadableDateTime(res.updatedAt),
                    createdAt: toReadableDateTime(res.createdAt)
                });
                const orderedItems = res.orderedItems ? res.orderedItems.items : [];
                setUpdatedOrderedItems(orderedItems.filter(v => v !== null) as TShirtOrder[]);
            },
            "Order does not exist."
        );
    };

    useEffect(() => {
        fetchPurchaseOrder();
    }, []);

    if (po.__typename === undefined)
        return (<></>);

    return (
        <PageContainer
            title="View Purchase Order"
            description="this is View Purchase Order"
        >
            <DashboardCard title={`Purchase Order: ${po.orderNumber}`}>
                <Grid container spacing={3} direction="column" padding={2}>
                    <Grid item>
                        <ViewPOHeaderFields po={po} setPo={setPo} />
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
                                    parentPurchaseOrder={po}
                                    setPurchaseOrder={setPo}
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

export default ViewPurchaseOrder;

type OrderedItemsTableProps = {
    tableData: TShirtOrder[];
    setTableData: React.Dispatch<React.SetStateAction<TShirtOrder[]>>;
    parentPurchaseOrder: PurchaseOrder;
    setPurchaseOrder: React.Dispatch<React.SetStateAction<PurchaseOrder>>;
    changeHistory: PurchaseOrderChange[];
    setChangeHistory: React.Dispatch<React.SetStateAction<PurchaseOrderChange[]>>;
};
const OrderedItemsTable = ({
    tableData,
    setTableData,
    parentPurchaseOrder,
    setPurchaseOrder,
    changeHistory,
    setChangeHistory,
}: OrderedItemsTableProps) => {
    const { user } = useAuthContext();
    const { rescueDBOperation } = useDBOperationContext();
    const [negativeInventoryWarning, setNegativeInventoryWarning] =
        useState<NegativeInventoryWarningState>({ ...initialNegativeInventoryWarningState });

    const handleAfterRowEdit = (
        row: MRT_Row<TShirtOrder>,
        orderChange: CreateOrderChangeInput,
        exitEditingMode: () => void,
        allowNegativeInventory: boolean = false
    ) => {
        const poChange = orderChange as CreatePurchaseOrderChangeInput;
        const prevTShirtOrder = row.original;
        const prevAmtOnHand = prevTShirtOrder.amountReceived ? prevTShirtOrder.amountReceived : 0;
        const newAmtOnHand = poChange.quantityChange + prevAmtOnHand;
        const prevAmtOrdered = prevTShirtOrder.quantity ? prevTShirtOrder.quantity : 0;
        const newAmtOrdered = poChange.orderedQuantityChange + prevAmtOrdered;

        const updatePOInput: UpdateOrderTransactionInput = {
            tshirtOrder: prevTShirtOrder,
            parentOrderId: parentPurchaseOrder.id,
            reason: poChange.reason,
            orderedQtyDelta: poChange.orderedQuantityChange,
            tshirtTableQtyDelta: poChange.quantityChange
        };

        // Only warn negative inventory when inventory will be reduced
        allowNegativeInventory = allowNegativeInventory || poChange.quantityChange >= 0;

        rescueDBOperation(
            () => updateOrderTransactionAPI(
                updatePOInput,
                EntityType.PurchaseOrder,
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

                // Update local TShirtOrder table
                const newTShirtOrder: TShirtOrder = {
                    ...prevTShirtOrder,
                    quantity: newAmtOrdered,
                    amountReceived: newAmtOnHand
                };
                tableData[row.index] = newTShirtOrder;
                setTableData([...tableData]);

                // Update local change history table
                const changePo = {
                    ...resp.orderChange,
                    createdAt: toReadableDateTime(resp.orderChange.createdAt),
                } as PurchaseOrderChange;
                setChangeHistory([changePo, ...changeHistory]);
                setPurchaseOrder({...parentPurchaseOrder, updatedAt: toReadableDateTime(resp.orderUpdatedAtTimestamp)});
                exitEditingMode();
                setNegativeInventoryWarning({ ...initialNegativeInventoryWarningState });
            }
        );
    };

    const handleAfterRowAdd = (
        newTShirtOrder: TShirtOrder,
        callback: (newTshirtOrderId: string) => void
    ) => {
        if (newTShirtOrder.id) return; // Only create new tshirt orders

        const updatePOInput: UpdateOrderTransactionInput = {
            tshirtOrder: newTShirtOrder,
            parentOrderId: parentPurchaseOrder.id,
            reason: "Added tshirt to purchase order",
            orderedQtyDelta: newTShirtOrder.quantity,
            tshirtTableQtyDelta: 0
        };

        // Update the purchase order with the new added item
        rescueDBOperation(
            () => updateOrderTransactionAPI(
                updatePOInput,
                EntityType.PurchaseOrder,
                user,
                DBOperation.CREATE,
                true
            ),
            DBOperation.CREATE,
            (resp: UpdateOrderTransactionResponse) => {
                // // Transaction failed
                // if (resp === null) {
                //     setNegativeInventoryWarning({
                //         show: true,
                //         cachedFunctionCall: () => handleAfterRowAdd(newTShirtOrder, callback, true),
                //         failedTShirtStyleNumber: newTShirtOrder.tShirtOrderTshirtStyleNumber
                //     });
                //     return;
                // }
                if (resp === null) return;
                const changePo = {
                    ...resp.orderChange,
                    createdAt: toReadableDateTime(resp.orderChange.createdAt),
                } as PurchaseOrderChange;
                setChangeHistory([changePo, ...changeHistory]);
                setPurchaseOrder({...parentPurchaseOrder, updatedAt: toReadableDateTime(resp.orderUpdatedAtTimestamp)});
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
                    parentOrderId={parentPurchaseOrder.id}
                    onRowEdit={handleAfterRowEdit}
                    onRowAdd={handleAfterRowAdd}
                    entityType={EntityType.PurchaseOrder}
                    mode={TableMode.Edit}
                />
            </CardContent>
        </BlankCard>
    );
};

type ChangeHistoryTableProps = {
    changeHistory: PurchaseOrderChange[];
};

const ChangeHistoryTable = ({ changeHistory }: ChangeHistoryTableProps) => {
    return (
        <BlankCard>
            <CardContent>
                <POChangeHistoryTable changeHistory={changeHistory} />
            </CardContent>
        </BlankCard>
    );
};
