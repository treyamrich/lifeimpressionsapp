"use client";

import {
    CreatePurchaseOrderChangeInput,
    PurchaseOrder,
    PurchaseOrderChange,
    TShirt,
    TShirtOrder,
    UpdateTShirtInput,
    UpdateTShirtOrderInput,
} from "@/API";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import TShirtOrderTable from "@/app/(DashboardLayout)/components/tshirt-order-table/TShirtOrderTable";
import { getPurchaseOrderAPI } from "@/app/graphql-helpers/fetch-apis";
import {
    DBOperation,
    DBOperationError,
    defaultDBOperationError,
    rescueDBOperation,
} from "@/app/graphql-helpers/graphql-errors";

import { Typography, Grid, CardContent, Alert } from "@mui/material";
import { useState, useEffect } from "react";
import ViewPOHeaderFields from "./ViewPOHeaders";
import POChangeHistoryTable from "@/app/(DashboardLayout)/components/po-change-history-table/POChangeHistoryTable";
import { toReadableDateTime } from "@/utils/datetimeConversions";
import { createPurchaseOrderChangeAPI, createTShirtOrderAPI } from "@/app/graphql-helpers/create-apis";
import { MRT_Row } from "material-react-table";
import {
    updateTShirtAPI,
    updateTShirtOrderAPI,
} from "@/app/graphql-helpers/update-apis";

type ViewPurchaseOrderProps = {
    params: { id: string };
};

const ViewPurchaseOrder = ({ params }: ViewPurchaseOrderProps) => {
    const { id } = params;
    const [po, setPo] = useState<PurchaseOrder>({} as PurchaseOrder);
    const [editHistory, setEditHistory] = useState<PurchaseOrderChange[]>([]);
    const [updatedOrderedItems, setUpdatedOrderedItems] = useState<TShirtOrder[]>(
        () => {
            return po.orderedItems ? (po.orderedItems.items as TShirtOrder[]) : [];
        }
    );
    const [dbOperationError, setDBOperationError] = useState({
        ...defaultDBOperationError,
    } as DBOperationError);

    const fetchPurchaseOrder = () => {
        rescueDBOperation(
            () => getPurchaseOrderAPI({ id }),
            setDBOperationError,
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
                setPo(res);
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
            {dbOperationError.errorMessage !== undefined ? (
                <Alert
                    severity="error"
                    onClose={() => setDBOperationError({ ...defaultDBOperationError })}
                >
                    {dbOperationError.errorMessage}
                </Alert>
            ) : (
                <></>
            )}
            <DashboardCard title={`Purchase Order: ${po.orderNumber}`}>
                <Grid container spacing={3} direction="column" padding={2}>
                    <Grid item>
                        <ViewPOHeaderFields po={po} setPo={setPo} setDBOperationError={setDBOperationError} />
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

type OrderedItemsTableProps = {
    tableData: TShirtOrder[];
    setTableData: React.Dispatch<React.SetStateAction<TShirtOrder[]>>;
    parentPurchaseOrder: PurchaseOrder;
    changeHistory: PurchaseOrderChange[];
    setChangeHistory: React.Dispatch<React.SetStateAction<PurchaseOrderChange[]>>;
};

const OrderedItemsTable = ({
    tableData,
    setTableData,
    parentPurchaseOrder,
    changeHistory,
    setChangeHistory,
}: OrderedItemsTableProps) => {
    const handleAfterRowEdit = (
        row: MRT_Row<TShirtOrder>,
        poChange: CreatePurchaseOrderChangeInput,
        setDBOperationError: React.Dispatch<React.SetStateAction<DBOperationError>>,
        exitEditingMode: () => void
    ) => {
        const prev = row.original;
        const prevAmtOnHand = prev.amountReceived ? prev.amountReceived : 0;
        const newAmtOnHand = poChange.quantityChange + prevAmtOnHand;
        const prevAmtOrdered = prev.quantity ? prev.quantity : 0;
        const newAmtOrdered = poChange.orderedQuantityChange + prevAmtOrdered;

        // Update inventory
        const newTShirt: UpdateTShirtInput = {
            styleNumber: prev.tShirtOrderTshirtStyleNumber,
            quantityOnHand: newAmtOnHand,
        };
        rescueDBOperation(
            () => updateTShirtAPI(newTShirt),
            setDBOperationError,
            DBOperation.UPDATE,
            (_: TShirt) => {
                // Update TShirtOrder DB table
                const newTShirtOrder: UpdateTShirtOrderInput = {
                    id: prev.id,
                    amountReceived: newAmtOnHand,
                    quantity: newAmtOrdered
                };
                rescueDBOperation(
                    () => updateTShirtOrderAPI(newTShirtOrder),
                    setDBOperationError,
                    DBOperation.UPDATE,
                    (resp: TShirtOrder) => {
                        // Update local TShirtOrder table
                        tableData[row.index] = resp;
                        setTableData([...tableData]);
                    }
                );
                // Update PO change DB table
                rescueDBOperation(
                    () => createPurchaseOrderChangeAPI(poChange),
                    setDBOperationError,
                    DBOperation.CREATE,
                    (poChangeResp: PurchaseOrderChange) => {
                        // Update local PO change history table
                        const changePo = {
                            ...poChangeResp,
                            createdAt: toReadableDateTime(poChangeResp.createdAt),
                        };
                        setChangeHistory([changePo, ...changeHistory]);
                    }
                );
            }
        );
        exitEditingMode();
    };

    const handleAfterRowAdd = (newTShirtOrder: TShirtOrder, setDBOperationError: React.Dispatch<React.SetStateAction<DBOperationError>>) => {
        if (newTShirtOrder.id) return; // Only create new tshirt orders

        // Update the purchase order with the new added item
        rescueDBOperation(
            () => createTShirtOrderAPI(parentPurchaseOrder, [newTShirtOrder]),
            setDBOperationError,
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
                    parentOrderId={parentPurchaseOrder.id}
                    onRowEdit={handleAfterRowEdit}
                    onRowAdd={handleAfterRowAdd}
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
