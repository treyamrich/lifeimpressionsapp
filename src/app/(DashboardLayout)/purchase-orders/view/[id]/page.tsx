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
import TShirtOrderTable, {
  EditTShirtOrderResult,
  TableMode,
} from "@/app/(DashboardLayout)/components/TShirtOrderTable/TShirtOrderTable";
import { getPurchaseOrderAPI } from "@/graphql-helpers/get-apis";
import { AsyncBatchItem, DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";

import { CardContent, Grid, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import ViewPOHeaderFields from "./ViewPOHeaders";

import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  UpdateOrderTransactionInput,
  UpdateOrderTransactionResponse,
  updateTShirtOrderTransactionAPI,
} from "@/dynamodb-transactions/update-tshirt-order/update-tshirt-order-transaction";
import NegativeInventoryConfirmPopup from "@/app/(DashboardLayout)/components/forms/confirm-popup/NegativeInventoryConfirmPopup";
import {
  initialNegativeInventoryWarningState,
  type NegativeInventoryWarningState,
} from "@/app/(DashboardLayout)/components/forms/confirm-popup/NegativeInventoryConfirmPopup";
import OrderChangeHistory from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/OrderChangeHistory/OrderChangeHistory";
import OrderTotalCard from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/OrderTotalCard";
import ViewOrderActions from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/ViewOrderHeader/ViewOrderActions";
import { useRouter } from "next/navigation";
import Section from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/ViewOrderHeader/Section";
import { deleteOrderTransactionAPI } from "@/dynamodb-transactions/delete-order-transaction";
import { failedUpdateTShirtStr } from "@/utils/tshirtOrder";
import MoreInfoAccordian from "@/app/(DashboardLayout)/components/MoreInfoAccordian/MoreInfoAccordian";
import { fromUTC, getStartOfMonth, getTodayInSetTz, toAWSDateTime } from "@/utils/datetimeConversions";
import { buildOrderChangeInput, BuildOrderChangeInput } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/OrderChangeHistory/util";


type ViewPurchaseOrderProps = {
  params: { id: string };
};

const ViewPurchaseOrder = ({ params }: ViewPurchaseOrderProps) => {
  const { id } = params;
  const { push } = useRouter();
  const { rescueDBOperation } = useDBOperationContext();
  const [po, setPo] = useState<PurchaseOrder>({} as PurchaseOrder);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editHistory, setEditHistory] = useState<OrderChange[]>([]);
  const [updatedOrderedItems, setUpdatedOrderedItems] = useState<TShirtOrder[]>(
    () => {
      return po.orderedItems ? (po.orderedItems.items as TShirtOrder[]) : [];
    }
  );
  const [negativeInventoryWarning, setNegativeInventoryWarning] =
    useState<NegativeInventoryWarningState>({
      ...initialNegativeInventoryWarningState,
    });
  const { user, refreshSession } = useAuthContext();

  const fetchPurchaseOrder = () => {
    rescueDBOperation(
      () => getPurchaseOrderAPI({ id }),
      DBOperation.GET,
      (res: PurchaseOrder) => {
        const changeHistory = res.changeHistory?.items;
        if (changeHistory) {
          let history = changeHistory.filter((x) => x != null) as OrderChange[];
          setEditHistory(history);
        }
        setPo(res);
        let orderedItems = res.orderedItems
          ? (res.orderedItems.items.filter((v) => v !== null) as TShirtOrder[])
          : [];
        setUpdatedOrderedItems(orderedItems);
      },
      "Order does not exist."
    );
  };

  const handleDeletePurchaseOrder = (allowNegativeInventory: boolean) => {
    if (!confirm(`Are you sure you want to delete this purchase order?`)) {
      return;
    }
    rescueDBOperation(
      () =>
        deleteOrderTransactionAPI(
          po,
          updatedOrderedItems,
          EntityType.PurchaseOrder,
          user,
          allowNegativeInventory,
          refreshSession
        ),
      DBOperation.DELETE,
      (resp: string[]) => {
        if (resp.length > 0) {
          setNegativeInventoryWarning({
            show: true,
            cachedFunctionCall: () => handleDeletePurchaseOrder(true),
            failedTShirts: resp,
          });
          return;
        }
        push("/purchase-orders/");
      }
    );
  };

  useEffect(() => {
    document.title = "View Purchase Order";
    fetchPurchaseOrder();
  }, []);

  if (po.__typename === undefined) return <></>;

  if (po.isDeleted)
    return <Typography variant="body2">Order was deleted.</Typography>;

  return (
    <PageContainer
      title="View Purchase Order"
      description="this is View Purchase Order"
    >
      <DashboardCard title={`Purchase Order: ${po.orderNumber}`}>
        <>
          <ViewOrderActions
            onEdit={() => setShowEditPopup(true)}
            onDelete={() => handleDeletePurchaseOrder(false)}
            order={po}
          />
          <Grid container rowSpacing={5} columnSpacing={5}>
            <Section header="Order Details" columnWidth={7}>
              <ViewPOHeaderFields
                po={po}
                setPo={setPo}
                showEditPopup={showEditPopup}
                setShowEditPopup={setShowEditPopup}
              />
            </Section>

            <Section header="Order Total" columnWidth={5}>
              <OrderTotalCard order={po} orderedItems={updatedOrderedItems} />
            </Section>

            <Section header="Ordered Items" columnWidth={12}>
              <OrderedItemsTable
                tableData={updatedOrderedItems}
                setTableData={setUpdatedOrderedItems}
                parentPurchaseOrder={po}
                setPurchaseOrder={setPo}
                changeHistory={editHistory}
                setChangeHistory={setEditHistory}
                setNegativeInventoryWarning={setNegativeInventoryWarning}
              />
            </Section>

            <Section header="Change History" columnWidth={12}>
              <ChangeHistoryTable changeHistory={editHistory} />
            </Section>
          </Grid>

          <NegativeInventoryConfirmPopup
            open={negativeInventoryWarning.show}
            onClose={() =>
              setNegativeInventoryWarning({
                ...negativeInventoryWarning,
                show: false,
              })
            }
            onSubmit={negativeInventoryWarning.cachedFunctionCall}
            failedTShirts={negativeInventoryWarning.failedTShirts}
          />
        </>
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
  setNegativeInventoryWarning: React.Dispatch<
    React.SetStateAction<NegativeInventoryWarningState>
  >;
};
const OrderedItemsTable = ({
  tableData,
  setTableData,
  parentPurchaseOrder,
  setPurchaseOrder,
  changeHistory,
  setChangeHistory,
  setNegativeInventoryWarning,
}: OrderedItemsTableProps) => {
  const { user, refreshSession } = useAuthContext();
  const { rescueDBOperation, rescueDBOperationBatch } = useDBOperationContext();
  const [receiveAllDisabled, setReceiveAllDisabled] = useState(false);

  const handleAfterRowEdit = (
    res: EditTShirtOrderResult,
    allowNegativeInventory: boolean = false
  ) => {
    const { row, orderChange, exitEditingMode, poItemDateReceived } = res;
    let createOrderChangeInput = orderChange;
    const oldTShirtOrder = tableData[row.index];
    const newTShirtOrder: any = { ...oldTShirtOrder };
    createOrderChangeInput.fieldChanges.forEach((fieldChange) => {
      newTShirtOrder[fieldChange.fieldName] = fieldChange.newValue;
    });

    const inventoryQtyDelta =
      newTShirtOrder.amountReceived - oldTShirtOrder.amountReceived!;
    const updateOrderInput: UpdateOrderTransactionInput = {
      updatedTShirtOrder: newTShirtOrder,
      parentOrder: parentPurchaseOrder,
      inventoryQtyDelta: inventoryQtyDelta,
      createOrderChangeInput: createOrderChangeInput,
      poItemReceivedDate: poItemDateReceived ? 
        toAWSDateTime(poItemDateReceived) : undefined,
      shouldUpdateOrderTable: true,
    };

    // Only warn negative inventory when inventory will be reduced
    allowNegativeInventory = allowNegativeInventory || inventoryQtyDelta >= 0;

    rescueDBOperation(
      () =>
        updateTShirtOrderTransactionAPI(
          updateOrderInput,
          EntityType.PurchaseOrder,
          user,
          DBOperation.UPDATE,
          allowNegativeInventory,
          refreshSession
        ),
      DBOperation.UPDATE,
      (resp: UpdateOrderTransactionResponse) => {
        // Transaction failed
        if (resp === null) {
          setNegativeInventoryWarning({
            show: true,
            cachedFunctionCall: () =>
              handleAfterRowEdit(res, true),
            failedTShirts: [failedUpdateTShirtStr(oldTShirtOrder.tshirt)],
          });
          return;
        }

        tableData[row.index] = resp.newTShirtOrder;
        setTableData([...tableData]);
        setChangeHistory([resp.orderChange, ...changeHistory]);
        setPurchaseOrder({
          ...parentPurchaseOrder,
          updatedAt: resp.orderUpdatedAtTimestamp,
        });
        exitEditingMode();
        setNegativeInventoryWarning({
          ...initialNegativeInventoryWarningState,
        });
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
      parentOrder: parentPurchaseOrder,
      inventoryQtyDelta: inventoryQtyDelta,
      createOrderChangeInput: createOrderChangeInput,
      shouldUpdateOrderTable: true,
    };

    // Update the purchase order with the new added item
    rescueDBOperation(
      () =>
        updateTShirtOrderTransactionAPI(
          updateOrderInput,
          EntityType.PurchaseOrder,
          user,
          DBOperation.CREATE,
          true,
          refreshSession
        ),
      DBOperation.CREATE,
      (resp: UpdateOrderTransactionResponse) => {
        // Transaction failed shouldn't fail due to inventory counts for creating a PO
        if (resp === null) return;
        setChangeHistory([resp.orderChange as OrderChange, ...changeHistory]);
        setPurchaseOrder({
          ...parentPurchaseOrder,
          updatedAt: resp.orderUpdatedAtTimestamp,
        });

        setTableData([...tableData, resp.newTShirtOrder]);
        closeFormCallback();
        setNegativeInventoryWarning({
          ...initialNegativeInventoryWarningState,
        });
      }
    );
  };

  const handleReceiveAllItems = async () => {
    // A semi-copy of handleAfterRowEdit
    setReceiveAllDisabled(true);
    const today = toAWSDateTime(getTodayInSetTz().set('second', 0));
    let poUpdatedAt = today;
    const newTableData = [...tableData];
    const newChangeHistory = [...changeHistory];
    const batchItems: AsyncBatchItem<UpdateOrderTransactionResponse>[] = [];

    tableData.forEach((oldTShirtOrder, idx) => {
      if (oldTShirtOrder.amountReceived! >= oldTShirtOrder.quantity) return;
  
      let newTShirtOrder: TShirtOrder = {
        ...oldTShirtOrder,
        amountReceived: oldTShirtOrder.quantity,
      };

      // Create the order change audit log
      let input: BuildOrderChangeInput = {
        oldTShirtOrder: oldTShirtOrder,
        newTShirtOrder: newTShirtOrder,
        parentOrderId: parentPurchaseOrder?.id,
        reason: "Received Item",
        entityType: EntityType.PurchaseOrder,
      };
      const createOrderChangeInput = buildOrderChangeInput(input);

      // Calculate the inventory delta and create DB transaction input
      const inventoryQtyDelta =
        newTShirtOrder.amountReceived! - oldTShirtOrder.amountReceived!;
      const updateOrderInput: UpdateOrderTransactionInput = {
        updatedTShirtOrder: newTShirtOrder,
        parentOrder: parentPurchaseOrder,
        inventoryQtyDelta: inventoryQtyDelta,
        createOrderChangeInput: createOrderChangeInput,
        poItemReceivedDate: today,
        shouldUpdateOrderTable: idx === 0, // Only update Orders table 1 time
      };

      const batchItem: AsyncBatchItem<UpdateOrderTransactionResponse> = {
        requestFn: () =>
          updateTShirtOrderTransactionAPI(
            updateOrderInput,
            EntityType.PurchaseOrder,
            user,
            DBOperation.UPDATE,
            true,
            refreshSession
          ),
        dbOperation: DBOperation.UPDATE,
        successHandler: (resp: UpdateOrderTransactionResponse) => {
          if (resp === null) {
            // Transaction failed shouldn't fail due to inventory counts for editing a PO when adding items
            // but if it failed, the UI shouldn't update the local item
            return;
          }

          poUpdatedAt = resp.orderUpdatedAtTimestamp;
          newTableData[idx] = resp.newTShirtOrder;
          newChangeHistory.unshift(resp.orderChange);
        },
        errorMessage: `failed to receive item for (${oldTShirtOrder.tshirt.styleNumber}, ${oldTShirtOrder.tshirt.color}, ${oldTShirtOrder.tshirt.size})`,
      }

      batchItems.push(batchItem);
    });

    await rescueDBOperationBatch(batchItems);

    setTableData(newTableData);
    setChangeHistory(newChangeHistory);
    setPurchaseOrder({
      ...parentPurchaseOrder,
      updatedAt: poUpdatedAt,
    });
    setNegativeInventoryWarning({
      ...initialNegativeInventoryWarningState,
    });
    setReceiveAllDisabled(false);
  };

  const orderFromPriorMonth =
    fromUTC(parentPurchaseOrder.createdAt) < getStartOfMonth(0);

  const underlineBoldStyle = {
    fontWeight: "bold",
    textDecoration: "underline",
  };
  return (
    <BlankCard>
      <CardContent>
        {orderFromPriorMonth && (
          <MoreInfoAccordian variant="warn">
            <Typography variant="body2">
              This purchase order is from a prior month. Removing items will 
              take away from the newest items. If you receive an item from a month
              prior to <span style={underlineBoldStyle}>now</span>, all inventory value reports will be invalidated from the order date
              and onwards.
              <span style={underlineBoldStyle}>
                It is recommended to only increase the quantity on hand and set the received date in the current month.
              </span>
            </Typography>
          </MoreInfoAccordian>
        )}
        <TShirtOrderTable
          tableData={tableData}
          setTableData={setTableData}
          parentOrder={parentPurchaseOrder}
          onRowEdit={handleAfterRowEdit}
          onRowAdd={handleAfterRowAdd}
          onReceiveAllItems={handleReceiveAllItems}
          receiveAllDisabled={receiveAllDisabled}
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
