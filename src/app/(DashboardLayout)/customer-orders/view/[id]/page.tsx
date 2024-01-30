"use client";

import {
    CreateOrderChangeInput,
    CustomerOrder,
    OrderChange,
    TShirtOrder,
    UpdateCustomerOrderInput,
} from "@/API";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import TShirtOrderTable, { TableMode } from "@/app/(DashboardLayout)/components/TShirtOrderTable/TShirtOrderTable";
import { getCustomerOrderAPI } from "@/graphql-helpers/fetch-apis";
import {
    DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";

import { Typography, CardContent, Grid } from "@mui/material";
import { useState, useEffect } from "react";

import { MRT_Row } from "material-react-table";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import ViewCOHeaderFields from "./ViewCOHeaderFields";
import { useAuthContext } from "@/contexts/AuthContext";
import { UpdateOrderTransactionInput, UpdateOrderTransactionResponse, updateOrderTransactionAPI } from "@/dynamodb-transactions/update-order-transaction";
import NegativeInventoryConfirmPopup, { NegativeInventoryWarningState, initialNegativeInventoryWarningState } from "@/app/(DashboardLayout)/components/forms/confirm-popup/NegativeInventoryConfirmPopup";
import OrderChangeHistory from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/OrderChangeHistory/OrderChangeHistory";
import OrderTotalCard from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/OrderTotalCard";
import ViewOrderActions from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/ViewOrderHeader/ViewOrderActions";
import { updateCustomerOrderAPI } from "@/graphql-helpers/update-apis";
import { useRouter } from "next/navigation";
import Section from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/ViewOrderHeader/Section";

type ViewCustomerOrderProps = {
    params: { id: string };
};

const ViewCustomerOrder = ({ params }: ViewCustomerOrderProps) => {
    const { id } = params;
    const { push } = useRouter();
    const { rescueDBOperation } = useDBOperationContext();
    const [co, setCo] = useState<CustomerOrder>({} as CustomerOrder);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [editHistory, setEditHistory] = useState<OrderChange[]>([]);
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
                    let history = changeHistory.filter(x => x != null) as OrderChange[];
                    setEditHistory(history);
                }

                setCo(res);
                const orderedItems = res.orderedItems ? res.orderedItems.items : [];
                setUpdatedOrderedItems(orderedItems.filter(v => v !== null) as TShirtOrder[]);
            },
            "Order does not exist."
        );
    };

    const handleDeleteCustomerOrder = () => {
        if (!confirm(`Are you sure you want to delete this customer order?`)) {
            return;
        }
        const deletedCustomerOrder: UpdateCustomerOrderInput = { id: co.id, isDeleted: true };
        rescueDBOperation(
            () => updateCustomerOrderAPI(deletedCustomerOrder),
            DBOperation.DELETE,
            () => {
                push('/customer-orders/');
            }
        );
    }

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
                <>
                    <ViewOrderActions
                        onEdit={() => setShowEditPopup(true)}
                        onDelete={handleDeleteCustomerOrder}
                    />
                    <Grid container rowSpacing={5} columnSpacing={5}>
                        <Section header="Order Details" columnWidth={7}>
                            <ViewCOHeaderFields
                                co={co}
                                setCo={setCo}
                                showEditPopup={showEditPopup}
                                setShowEditPopup={setShowEditPopup}
                            />
                        </Section>

                        <Section header="Order Total" columnWidth={5}>
                            <OrderTotalCard
                                order={co}
                                orderedItems={updatedOrderedItems}
                            />
                        </Section>

                        <Section header="Ordered Items" columnWidth={12}>
                            <OrderedItemsTable
                                tableData={updatedOrderedItems}
                                setTableData={setUpdatedOrderedItems}
                                parentCustomerOrder={co}
                                setCustomerOrder={setCo}
                                changeHistory={editHistory}
                                setChangeHistory={setEditHistory}
                            />
                        </Section>

                        <Section header="Change History" columnWidth={12}>
                            <ChangeHistoryTable changeHistory={editHistory} />
                        </Section>
                    </Grid>
                </>
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
    changeHistory: OrderChange[];
    setChangeHistory: React.Dispatch<React.SetStateAction<OrderChange[]>>;
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
        createOrderChangeInput: CreateOrderChangeInput,
        exitEditingMode: () => void,
        allowNegativeInventory: boolean = false
    ) => {
        const oldTShirtOrder = tableData[row.index];
        const newTShirtOrder: any = { ...oldTShirtOrder };
        createOrderChangeInput.fieldChanges.forEach((fieldChange) => {
            newTShirtOrder[fieldChange.fieldName] = fieldChange.newValue
        });


        const inventoryQtyDelta = newTShirtOrder.quantity - oldTShirtOrder.quantity;
        const updateOrderInput: UpdateOrderTransactionInput = {
            updatedTShirtOrder: newTShirtOrder,
            parentOrderId: parentCustomerOrder.id,
            inventoryQtyDelta: inventoryQtyDelta,
            createOrderChangeInput: createOrderChangeInput
        };

        // Only warn negative inventory when inventory will be reduced
        allowNegativeInventory = allowNegativeInventory || -inventoryQtyDelta >= 0;

        rescueDBOperation(
            () => updateOrderTransactionAPI(
                updateOrderInput,
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
                            handleAfterRowEdit(row, createOrderChangeInput, exitEditingMode, true),
                        failedTShirtErrMsg: `Style#: ${oldTShirtOrder.tshirt.styleNumber} | Size: ${oldTShirtOrder.tshirt.size} | Color: ${oldTShirtOrder.tshirt.color}`
                    })
                    return;
                }

                // Update local TShirtOrderTable
                tableData[row.index] = newTShirtOrder;
                setTableData([...tableData]);

                // Update local change history table
                setChangeHistory([resp.orderChange, ...changeHistory]);
                setCustomerOrder({ ...parentCustomerOrder, updatedAt: resp.orderUpdatedAtTimestamp });
                exitEditingMode();
                setNegativeInventoryWarning({ ...initialNegativeInventoryWarningState });
            },
        );
    };

    const handleAfterRowAdd = (
        newTShirtOrder: TShirtOrder,
        createOrderChangeInput: CreateOrderChangeInput,
        closeFormCallback: () => void,
        allowNegativeInventory: boolean = false
    ) => {
        if (newTShirtOrder.id) return; // Only create new tshirt orders

        const inventoryQtyDelta = newTShirtOrder.quantity;
        const updateOrderInput: UpdateOrderTransactionInput = {
            updatedTShirtOrder: newTShirtOrder,
            parentOrderId: parentCustomerOrder.id,
            inventoryQtyDelta: inventoryQtyDelta,
            createOrderChangeInput: createOrderChangeInput
        };

        // Update the customer order with the new added item
        rescueDBOperation(
            () => updateOrderTransactionAPI(
                updateOrderInput,
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
                            handleAfterRowAdd(newTShirtOrder, createOrderChangeInput, closeFormCallback, true),
                        failedTShirtErrMsg: `Style#: ${newTShirtOrder.tshirt.styleNumber} | Size: ${newTShirtOrder.tshirt.size} | Color: ${newTShirtOrder.tshirt.color}`
                    })
                    return;
                }
                newTShirtOrder.id = resp.newTShirtOrderId!;
                setChangeHistory([resp.orderChange, ...changeHistory]);
                setCustomerOrder({ ...parentCustomerOrder, updatedAt: resp.orderUpdatedAtTimestamp });
                setTableData([...tableData, newTShirtOrder]);
                closeFormCallback();
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
                        failedTShirts={[negativeInventoryWarning.failedTShirtErrMsg]}
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

const ChangeHistoryTable = ({ changeHistory }: {
    changeHistory: OrderChange[];
}) => {
    return (
        <BlankCard>
            <CardContent>
                <OrderChangeHistory changeHistory={changeHistory} />
            </CardContent>
        </BlankCard>
    );
};
