"use client";

import {
  CreateOrderChangeInput,
  CustomerOrder,
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
import { getCustomerOrderAPI } from "@/graphql-helpers/fetch-apis";
import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";

import { Typography, CardContent, Grid } from "@mui/material";
import { useState, useEffect } from "react";

import { MRT_Row } from "material-react-table";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import ViewCOHeaderFields from "./ViewCOHeaderFields";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  UpdateOrderTransactionInput,
  UpdateOrderTransactionResponse,
  updateTShirtOrderTransactionAPI,
} from "@/dynamodb-transactions/update-tshirt-order/update-tshirt-order-transaction";
import NegativeInventoryConfirmPopup, {
  NegativeInventoryWarningState,
  initialNegativeInventoryWarningState,
} from "@/app/(DashboardLayout)/components/forms/confirm-popup/NegativeInventoryConfirmPopup";
import OrderChangeHistory from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/OrderChangeHistory/OrderChangeHistory";
import OrderTotalCard from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/OrderTotalCard";
import ViewOrderActions from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/ViewOrderHeader/ViewOrderActions";
import { useRouter } from "next/navigation";
import Section from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/ViewOrderHeader/Section";
import { deleteOrderTransactionAPI } from "@/dynamodb-transactions/delete-order-transaction";
import { combineTShirtOrderQtys, failedUpdateTShirtStr, groupTShirtOrders } from "@/utils/tshirtOrder";
import MoreInfoAccordian from "@/app/(DashboardLayout)/components/MoreInfoAccordian/MoreInfoAccordian";
import { fromUTC, getStartOfMonth } from "@/utils/datetimeConversions";

type ViewCustomerOrderProps = {
  params: { id: string };
};

const ViewCustomerOrder = ({ params }: ViewCustomerOrderProps) => {
  const { id } = params;
  const { push } = useRouter();
  const { user, refreshSession } = useAuthContext();
  const { rescueDBOperation } = useDBOperationContext();
  const [co, setCo] = useState<CustomerOrder>({} as CustomerOrder);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editHistory, setEditHistory] = useState<OrderChange[]>([]);
  const [updatedOrderedItems, setUpdatedOrderedItems] = useState<TShirtOrder[]>(
    () => {
      return co.orderedItems ? (co.orderedItems.items as TShirtOrder[]) : [];
    }
  );
  const [negativeInventoryWarning, setNegativeInventoryWarning] =
    useState<NegativeInventoryWarningState>({
      ...initialNegativeInventoryWarningState,
    });

  const fetchCustomerOrder = () => {
    rescueDBOperation(
      () => getCustomerOrderAPI({ id }),
      DBOperation.GET,
      (res: CustomerOrder) => {
        const changeHistory = res.changeHistory?.items;

        if (changeHistory) {
          let history = changeHistory.filter((x) => x != null) as OrderChange[];
          setEditHistory(history);
        }

        setCo(res);
        let orderedItems = res.orderedItems
          ? (res.orderedItems.items.filter((v) => v !== null) as TShirtOrder[])
          : [];
        orderedItems = groupTShirtOrders(orderedItems);

        setUpdatedOrderedItems(orderedItems);
      },
      "Order does not exist."
    );
  };

  const handleDeleteCustomerOrder = () => {
    if (!confirm(`Are you sure you want to delete this customer order?`)) {
      return;
    }
    const allowNegativeInventory = true; // This will add to item qty's
    rescueDBOperation(
      () =>
        deleteOrderTransactionAPI(
          co,
          updatedOrderedItems,
          EntityType.CustomerOrder,
          user,
          allowNegativeInventory,
          refreshSession
        ),
      DBOperation.DELETE,
      (resp: string[]) => {
        if (resp.length > 0) {
          return;
        }
        push("/customer-orders/");
      }
    );
  };

  useEffect(() => {
    document.title = "View Customer Order";
    fetchCustomerOrder();
  }, []);

  if (co.__typename === undefined) return <></>;

  if (co.isDeleted)
    return <Typography variant="body2">Order was deleted.</Typography>;

  return (
    <PageContainer
      title="View Customer Order"
      description="this is View Customer Order"
    >
      <DashboardCard title={`Customer Order: ${co.orderNumber}`}>
        <>
          <ViewOrderActions
            onEdit={() => setShowEditPopup(true)}
            onDelete={() => handleDeleteCustomerOrder()}
            order={co}
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
              <OrderTotalCard order={co} orderedItems={updatedOrderedItems} />
            </Section>

            <Section header="Ordered Items" columnWidth={12}>
              <OrderedItemsTable
                tableData={updatedOrderedItems}
                setTableData={setUpdatedOrderedItems}
                parentCustomerOrder={co}
                setCustomerOrder={setCo}
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

export default ViewCustomerOrder;

type OrderedItemsTableProps = {
  tableData: TShirtOrder[];
  setTableData: React.Dispatch<React.SetStateAction<TShirtOrder[]>>;
  parentCustomerOrder: CustomerOrder;
  setCustomerOrder: React.Dispatch<React.SetStateAction<CustomerOrder>>;
  changeHistory: OrderChange[];
  setChangeHistory: React.Dispatch<React.SetStateAction<OrderChange[]>>;
  setNegativeInventoryWarning: React.Dispatch<
    React.SetStateAction<NegativeInventoryWarningState>
  >;
};

const OrderedItemsTable = ({
  tableData,
  setTableData,
  parentCustomerOrder,
  setCustomerOrder,
  changeHistory,
  setChangeHistory,
  setNegativeInventoryWarning,
}: OrderedItemsTableProps) => {
  const { rescueDBOperation } = useDBOperationContext();
  const { user, refreshSession } = useAuthContext();

  const handleAfterRowEdit = (
    res: EditTShirtOrderResult,
    allowNegativeInventory: boolean = false
  ) => {
    const { row, orderChange, exitEditingMode } = res;
    let createOrderChangeInput = orderChange;
    const oldTShirtOrder = tableData[row.index];
    const newTShirtOrder: any = { ...oldTShirtOrder };
    createOrderChangeInput.fieldChanges.forEach((fieldChange) => {
      newTShirtOrder[fieldChange.fieldName] = fieldChange.newValue;
    });

    const inventoryQtyDelta = newTShirtOrder.quantity - oldTShirtOrder.quantity;
    const updateOrderInput: UpdateOrderTransactionInput = {
      updatedTShirtOrder: newTShirtOrder,
      parentOrder: parentCustomerOrder,
      inventoryQtyDelta: inventoryQtyDelta,
      createOrderChangeInput: createOrderChangeInput,
      prevUpdatesTshirtIdsMap: {}
    };

    // Only warn negative inventory when inventory will be reduced
    allowNegativeInventory = allowNegativeInventory || -inventoryQtyDelta >= 0;

    rescueDBOperation(
      () =>
        updateTShirtOrderTransactionAPI(
          updateOrderInput,
          EntityType.CustomerOrder,
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
        setCustomerOrder({
          ...parentCustomerOrder,
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
    closeFormCallback: () => void,
    allowNegativeInventory: boolean = false
  ) => {
    if (newTShirtOrder.id) return; // Only create new tshirt orders

    const inventoryQtyDelta = newTShirtOrder.quantity;
    const updateOrderInput: UpdateOrderTransactionInput = {
      updatedTShirtOrder: newTShirtOrder,
      parentOrder: parentCustomerOrder,
      inventoryQtyDelta: inventoryQtyDelta,
      createOrderChangeInput: createOrderChangeInput,
      prevUpdatesTshirtIdsMap: {}
    };

    // Update the customer order with the new added item
    rescueDBOperation(
      () =>
        updateTShirtOrderTransactionAPI(
          updateOrderInput,
          EntityType.CustomerOrder,
          user,
          DBOperation.CREATE,
          allowNegativeInventory,
          refreshSession
        ),
      DBOperation.CREATE,
      (resp: UpdateOrderTransactionResponse) => {
        // Transaction failed
        if (resp === null) {
          setNegativeInventoryWarning({
            show: true,
            cachedFunctionCall: () =>
              handleAfterRowAdd(
                newTShirtOrder,
                createOrderChangeInput,
                closeFormCallback,
                true
              ),
            failedTShirts: [failedUpdateTShirtStr(newTShirtOrder.tshirt)],
          });
          return;
        }

        setChangeHistory([resp.orderChange, ...changeHistory]);
        setCustomerOrder({
          ...parentCustomerOrder,
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
    fromUTC(parentCustomerOrder.createdAt) < getStartOfMonth(0);

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
              This customer order is from a prior month. When editing an item in
              the order, you will be rewriting history and invalidating inventory
              value reports generated from the order date and onwards.
            </Typography>
          </MoreInfoAccordian>
        )}
        <TShirtOrderTable
          tableData={tableData}
          setTableData={setTableData}
          parentOrder={parentCustomerOrder}
          onRowEdit={handleAfterRowEdit}
          onRowAdd={handleAfterRowAdd}
          entityType={EntityType.CustomerOrder}
          mode={TableMode.Edit}
        />
      </CardContent>
    </BlankCard>
  );
};

const ChangeHistoryTable = ({
  changeHistory,
}: {
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
