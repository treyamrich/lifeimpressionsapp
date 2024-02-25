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
  TableMode,
} from "@/app/(DashboardLayout)/components/TShirtOrderTable/TShirtOrderTable";
import { getPurchaseOrderAPI } from "@/graphql-helpers/fetch-apis";
import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";

import { CardContent, Grid, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import ViewPOHeaderFields from "./ViewPOHeaders";

import { MRT_Row } from "material-react-table";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  UpdateOrderTransactionInput,
  UpdateOrderTransactionResponse,
  updateOrderTransactionAPI,
} from "@/dynamodb-transactions/update-order-transaction";
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
import { combineTShirtOrderQtys, groupTShirtOrders } from "@/utils/tshirtOrder";
import dayjs from "dayjs";
import MoreInfoAccordian from "@/app/(DashboardLayout)/components/MoreInfoAccordian/MoreInfoAccordian";

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
        orderedItems = groupTShirtOrders(orderedItems);
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
  const { rescueDBOperation } = useDBOperationContext();

  const handleAfterRowEdit = (
    row: MRT_Row<TShirtOrder>,
    createOrderChangeInput: CreateOrderChangeInput,
    exitEditingMode: () => void,
    allowNegativeInventory: boolean = false
  ) => {
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
    };

    // Only warn negative inventory when inventory will be reduced
    allowNegativeInventory = allowNegativeInventory || inventoryQtyDelta >= 0;

    rescueDBOperation(
      () =>
        updateOrderTransactionAPI(
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
              handleAfterRowEdit(
                row,
                createOrderChangeInput,
                exitEditingMode,
                true
              ),
            failedTShirts: [
              `Style#: ${oldTShirtOrder.tshirt.styleNumber} | Size: ${oldTShirtOrder.tshirt.size} | Color: ${oldTShirtOrder.tshirt.color}`,
            ],
          });
          return;
        }

        // If a new tshirt order was created combine with existing
        if (resp.newTShirtOrder.id !== tableData[row.index].id) {
          tableData[row.index] = combineTShirtOrderQtys(
            tableData[row.index],
            resp.newTShirtOrder
          );
        } else {
          tableData[row.index] = resp.newTShirtOrder;
        }
        setTableData([...tableData]);

        // Update local change history table
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
    };

    // Update the purchase order with the new added item
    rescueDBOperation(
      () =>
        updateOrderTransactionAPI(
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

  const orderFromPriorMonth =
    dayjs.utc(parentPurchaseOrder.createdAt) < dayjs.utc().startOf("month");

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
              This purchase order is from last month. When editing an item in
              the order, you will only be able to{" "}
              <span style={underlineBoldStyle}>
                increase the quantity on hand
              </span>
              {" "} which increases inventory quantity.
            </Typography>
          </MoreInfoAccordian>
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
