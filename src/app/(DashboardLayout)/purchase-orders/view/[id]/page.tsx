"use client";

import {
    CreateOrderChangeInput,
    PurchaseOrder,
    OrderChange,
    TShirtOrder,
} from "@/API";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import TShirtOrderTable, { TableMode } from "@/app/(DashboardLayout)/components/TShirtOrderTable/TShirtOrderTable";
import { getPurchaseOrderAPI } from "@/graphql-helpers/fetch-apis";
import {
    DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";

import { Typography, CardContent } from "@mui/material";
import { useState, useEffect } from "react";
import ViewPOHeaderFields from "./ViewPOHeaders";

import { MRT_Row } from "material-react-table";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { useAuthContext } from "@/contexts/AuthContext";
import { UpdateOrderTransactionInput, UpdateOrderTransactionResponse, updateOrderTransactionAPI } from "@/dynamodb-transactions/update-order-transaction";
import NegativeInventoryConfirmPopup from "@/app/(DashboardLayout)/components/forms/confirm-popup/NegativeInventoryConfirmPopup";
import { initialNegativeInventoryWarningState, type NegativeInventoryWarningState } from "@/app/(DashboardLayout)/components/forms/confirm-popup/NegativeInventoryConfirmPopup";
import OrderChangeHistory from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/OrderChangeHistory/OrderChangeHistory";

type ViewPurchaseOrderProps = {
    params: { id: string };
};

const ViewPurchaseOrder = ({ params }: ViewPurchaseOrderProps) => {
    const { id } = params;
    const { rescueDBOperation } = useDBOperationContext();
    const [po, setPo] = useState<PurchaseOrder>({} as PurchaseOrder);
    const [editHistory, setEditHistory] = useState<OrderChange[]>([]);
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
                    let history = changeHistory.filter(x => x != null) as OrderChange[];
                    setEditHistory(history);
                }
                setPo(res);
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
                <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                    <div>
                        <ViewPOHeaderFields po={po} setPo={setPo} />
                    </div>
                    <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                        <div>
                            <Typography variant="h6" color="textSecondary">
                                Ordered Items
                            </Typography>
                        </div>
                        <div>
                            <OrderedItemsTable
                                tableData={updatedOrderedItems}
                                setTableData={setUpdatedOrderedItems}
                                parentPurchaseOrder={po}
                                setPurchaseOrder={setPo}
                                changeHistory={editHistory}
                                setChangeHistory={setEditHistory}
                            />
                        </div>
                    </div>
                    <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                        <div>
                            <Typography variant="h6" color="textSecondary">
                                Change History
                            </Typography>
                        </div>
                        <div>
                            <ChangeHistoryTable changeHistory={editHistory} />
                        </div>
                    </div>
                </div>
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
    changeHistory: OrderChange[];
    setChangeHistory: React.Dispatch<React.SetStateAction<OrderChange[]>>;
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
        createOrderChangeInput: CreateOrderChangeInput,
        exitEditingMode: () => void,
        allowNegativeInventory: boolean = false
    ) => {
        const oldTShirtOrder = tableData[row.index];
        const newTShirtOrder: any = { ...oldTShirtOrder };
        createOrderChangeInput.fieldChanges.forEach((fieldChange) => {
            newTShirtOrder[fieldChange.fieldName] = fieldChange.newValue
        });


        const inventoryQtyDelta = newTShirtOrder.amountReceived - oldTShirtOrder.amountReceived!;
        const updateOrderInput: UpdateOrderTransactionInput = {
            updatedTShirtOrder: newTShirtOrder,
            parentOrderId: parentPurchaseOrder.id,
            inventoryQtyDelta: inventoryQtyDelta,
            createOrderChangeInput: createOrderChangeInput
        };

        // Only warn negative inventory when inventory will be reduced
        allowNegativeInventory = allowNegativeInventory || inventoryQtyDelta <= 0;

        rescueDBOperation(
            () => updateOrderTransactionAPI(
                updateOrderInput,
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
                            handleAfterRowEdit(row, createOrderChangeInput, exitEditingMode, true),
                        failedTShirtErrMsg: `Style#: ${oldTShirtOrder.tshirt.styleNumber} | Size: ${oldTShirtOrder.tshirt.size} | Color: ${oldTShirtOrder.tshirt.color}`
                    })
                    return;
                }

                // Update local TShirtOrderTable
                newTShirtOrder.id = resp.newTShirtOrderId;
                tableData[row.index] = newTShirtOrder;
                setTableData([...tableData]);

                // Update local change history table
                setChangeHistory([resp.orderChange, ...changeHistory]);
                setPurchaseOrder({ ...parentPurchaseOrder, updatedAt: resp.orderUpdatedAtTimestamp });
                exitEditingMode();
                setNegativeInventoryWarning({ ...initialNegativeInventoryWarningState });
            }
        );
    };

    const handleAfterRowAdd = (
        newTShirtOrder: TShirtOrder,
        createOrderChangeInput: CreateOrderChangeInput,
        closeFormCallback: () => void
    ) => {
        if (newTShirtOrder.id) return; // Only create new tshirt orders

        const inventoryQtyDelta = 0; // Inventory qty shouldn't change
        const updateOrderInput: UpdateOrderTransactionInput = {
            updatedTShirtOrder: newTShirtOrder,
            parentOrderId: parentPurchaseOrder.id,
            inventoryQtyDelta: inventoryQtyDelta,
            createOrderChangeInput: createOrderChangeInput
        };

        // Update the purchase order with the new added item
        rescueDBOperation(
            () => updateOrderTransactionAPI(
                updateOrderInput,
                EntityType.PurchaseOrder,
                user,
                DBOperation.CREATE,
                true
            ),
            DBOperation.CREATE,
            (resp: UpdateOrderTransactionResponse) => {
                // Transaction failed shouldn't fail due to inventory counts for creating a PO
                if (resp === null) return;
                setChangeHistory([resp.orderChange as OrderChange, ...changeHistory]);
                setPurchaseOrder({ ...parentPurchaseOrder, updatedAt: resp.orderUpdatedAtTimestamp });
                setTableData([...tableData, newTShirtOrder]);
                closeFormCallback();
                setNegativeInventoryWarning({ ...initialNegativeInventoryWarningState });
            }
        )
    };

    return (
        <BlankCard>
            <CardContent>
                <NegativeInventoryConfirmPopup
                    open={negativeInventoryWarning.show}
                    onClose={() => setNegativeInventoryWarning({
                        ...negativeInventoryWarning,
                        show: false
                    })}
                    onSubmit={negativeInventoryWarning.cachedFunctionCall}
                    failedTShirts={[negativeInventoryWarning.failedTShirtErrMsg]}
                />
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
    changeHistory: OrderChange[];
};

const ChangeHistoryTable = ({ changeHistory }: ChangeHistoryTableProps) => {
    return (
        <BlankCard>
            <CardContent>
                <OrderChangeHistory changeHistory={changeHistory} />
            </CardContent>
        </BlankCard>
    );
};
