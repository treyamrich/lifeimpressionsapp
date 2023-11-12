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
import { getPurchaseOrderAPI } from "@/app/graphql-helpers/fetch-apis";
import {
    DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";

import { Typography, Grid, CardContent } from "@mui/material";
import { useState, useEffect } from "react";
import ViewPOHeaderFields from "./ViewPOHeaders";
import { toReadableDateTime } from "@/utils/datetimeConversions";

import { MRT_Row } from "material-react-table";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { CreateOrderChangeInput, OrderChange } from "@/app/(DashboardLayout)/components/tshirt-order-table/table-constants";
import POChangeHistoryTable from "@/app/(DashboardLayout)/components/order-change-history-table/POChangeHistoryTable";
import { useAuthContext } from "@/contexts/AuthContext";
import { UpdateOrderTransactionInput, updateOrderTransactionAPI } from "@/app/dynamodb-transactions/update-order-transaction";
import { createTShirtOrderTransactionAPI } from "@/app/dynamodb-transactions/create-tshirtorder-transaction";
import NegativeInventoryConfirmPopup from "@/app/(DashboardLayout)/components/forms/confirm-popup/NegativeInventoryConfirmPopup";

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
            }
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

type NegativeInventoryWarningState = {
    show: boolean;
    callback: () => void;
    prevTShirtOrder: TShirtOrder;
    cachedOrderChange: CreateOrderChangeInput;
    mrtRow: MRT_Row<TShirtOrder>;
}

type OrderedItemsTableProps = {
    tableData: TShirtOrder[];
    setTableData: React.Dispatch<React.SetStateAction<TShirtOrder[]>>;
    parentPurchaseOrder: PurchaseOrder;
    changeHistory: PurchaseOrderChange[];
    setChangeHistory: React.Dispatch<React.SetStateAction<PurchaseOrderChange[]>>;
};

const initialNegativeInventoryWarningState = {
    show: false,
    callback: () => { },
    prevTShirtOrder: {} as TShirtOrder,
    cachedOrderChange: {} as CreateOrderChangeInput,
    mrtRow: {} as MRT_Row<TShirtOrder>
};

const OrderedItemsTable = ({
    tableData,
    setTableData,
    parentPurchaseOrder,
    changeHistory,
    setChangeHistory,
}: OrderedItemsTableProps) => {
    const { user } = useAuthContext();
    const { rescueDBOperation } = useDBOperationContext();
    const [negativeInventoryWarning, setNegativeInventoryWarning] = useState<NegativeInventoryWarningState>({...initialNegativeInventoryWarningState});

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
            orderId: parentPurchaseOrder.id,
            reason: poChange.reason,
            quantityDelta: poChange.orderedQuantityChange,
            quantityDelta2: poChange.quantityChange
        };

        // Only warn negative inventory when subtracting
        allowNegativeInventory = allowNegativeInventory || poChange.quantityChange >= 0;

        rescueDBOperation(
            () => updateOrderTransactionAPI(updatePOInput, EntityType.PurchaseOrder, user, allowNegativeInventory),
            DBOperation.UPDATE,
            (resp: OrderChange) => {
                // Transaction failed
                if (resp === null) {
                    setNegativeInventoryWarning({
                        show: true,
                        callback: exitEditingMode,
                        prevTShirtOrder: prevTShirtOrder,
                        cachedOrderChange: orderChange,
                        mrtRow: row
                    })
                    return;
                }

                const poChangeResp = resp as PurchaseOrderChange;

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
                    ...poChangeResp,
                    createdAt: toReadableDateTime(poChangeResp.createdAt),
                };
                setChangeHistory([changePo, ...changeHistory]);
                exitEditingMode();
                setNegativeInventoryWarning({...initialNegativeInventoryWarningState});
            }
        );
    };

    const handleAfterRowAdd = (newTShirtOrder: TShirtOrder, callback: () => void, allowNegativeInventory: boolean = false) => {
        if (newTShirtOrder.id) return; // Only create new tshirt orders

        // Update the purchase order with the new added item
        rescueDBOperation(
            () => createTShirtOrderTransactionAPI(parentPurchaseOrder.id, EntityType.PurchaseOrder, newTShirtOrder, user, allowNegativeInventory),
            DBOperation.CREATE,
            (resp: PurchaseOrderChange) => {
                // Transaction failed
                if (resp === null) {

                    return;
                }
                setChangeHistory([resp, ...changeHistory]);
                callback();
                setNegativeInventoryWarning({...initialNegativeInventoryWarningState});
            }
        )
    };

    return (
        <BlankCard>
            <CardContent>
                {negativeInventoryWarning.show && (
                    <NegativeInventoryConfirmPopup
                        open={negativeInventoryWarning.show}
                        onClose={() => setNegativeInventoryWarning({ ...negativeInventoryWarning, show: false })}
                        onSubmit={() => handleAfterRowEdit(
                            negativeInventoryWarning.mrtRow,
                            negativeInventoryWarning.cachedOrderChange,
                            negativeInventoryWarning.callback,
                            true
                        )}
                        failedTShirts={[negativeInventoryWarning.prevTShirtOrder.tShirtOrderTshirtStyleNumber]}
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
