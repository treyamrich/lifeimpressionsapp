"use client";

import {
  CreateOrderChangeInput,
  CustomerOrder,
  TShirtOrder,
} from "@/API";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import TShirtOrderTable, {
  EditTShirtOrderResult,
  TableMode,
} from "@/app/(DashboardLayout)/components/TShirtOrderTable/TShirtOrderTable";
import { getCustomerOrderAPI } from "@/graphql-helpers/get-apis";
import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";

import { Typography, CardContent, Grid } from "@mui/material";
import { useState, useEffect } from "react";

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
import MoreInfoAccordian from "@/app/(DashboardLayout)/components/MoreInfoAccordian/MoreInfoAccordian";
import { fromUTC, getStartOfMonth } from "@/utils/datetimeConversions";
import { prependOrderChangeHistory } from "@/api/hooks/mutations";
import { TShirtOrderMoneyAwareForm } from "@/app/(DashboardLayout)/components/TShirtOrderTable/table-constants";

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
        setCo(res);
        let orderedItems = res.orderedItems
          ? (res.orderedItems.items.filter((v) => v !== null) as TShirtOrder[])
          : [];
        setUpdatedOrderedItems(orderedItems);
      },
      () => "Order does not exist."
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
                setNegativeInventoryWarning={setNegativeInventoryWarning}
              />
            </Section>

            <Section header="Change History" columnWidth={12}>
              <ChangeHistoryTable orderId={co.id} />
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
  setNegativeInventoryWarning: React.Dispatch<
    React.SetStateAction<NegativeInventoryWarningState>
  >;
};

const OrderedItemsTable = ({
  tableData,
  setTableData,
  parentCustomerOrder,
  setCustomerOrder,
  setNegativeInventoryWarning,
}: OrderedItemsTableProps) => {
  const { rescueDBOperation } = useDBOperationContext();
  const { user, refreshSession } = useAuthContext();

  const handleAfterRowEdit = (
    res: EditTShirtOrderResult,
    allowNegativeInventory: boolean = false
  ) => {
    const { row, updatedTShirtOrder, orderChange, exitEditingMode } = res;
    let createOrderChangeInput = orderChange;
    const oldTShirtOrder = tableData[row.index];

    const inventoryQtyDelta = updatedTShirtOrder.quantity - oldTShirtOrder.quantity;
    const updateOrderInput: UpdateOrderTransactionInput = {
      updatedTShirtOrder: updatedTShirtOrder,
      parentOrder: parentCustomerOrder,
      inventoryQtyDelta: inventoryQtyDelta,
      createOrderChangeInput: createOrderChangeInput,
      shouldUpdateOrderTable: true,
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
            failedTShirts: [oldTShirtOrder.tshirt],
          });
          return;
        }

        tableData[row.index] = resp.newTShirtOrder;
        setTableData([...tableData]);
        prependOrderChangeHistory({
          newOrderChanges: [resp.orderChange],
          orderId: parentCustomerOrder.id,
          orderType: EntityType.CustomerOrder,
        })
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
    formValues: TShirtOrderMoneyAwareForm,
    createOrderChangeInput: CreateOrderChangeInput,
    closeFormCallback: () => void,
    allowNegativeInventory: boolean = false
  ) => {

    const updatedOrderItem: TShirtOrder = {
      __typename: "TShirtOrder",
      tshirt: formValues.tshirt!,
      quantity: formValues.quantity,
      amountReceived: formValues.amountReceived,
      costPerUnitCents: formValues.costPerUnitCents,
      id: "",
      createdAt: "",
      updatedAt: "",
      earliestTransaction: "",
      latestTransaction: "",
      tShirtOrderTshirtId: formValues.tshirt!.id,
    }

    const inventoryQtyDelta = formValues.quantity;
    const updateOrderInput: UpdateOrderTransactionInput = {
      updatedTShirtOrder: updatedOrderItem,
      parentOrder: parentCustomerOrder,
      inventoryQtyDelta: inventoryQtyDelta,
      createOrderChangeInput: createOrderChangeInput,
      shouldUpdateOrderTable: true,
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
                formValues,
                createOrderChangeInput,
                closeFormCallback,
                true
              ),
            failedTShirts: [formValues.tshirt!],
          });
          return;
        }
        
        prependOrderChangeHistory({
          newOrderChanges: [resp.orderChange],
          orderId: parentCustomerOrder.id,
          orderType: EntityType.CustomerOrder,
        })
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
  orderId,
}: {
  orderId: string;
}) => {
  return (
    <BlankCard>
      <CardContent>
        <OrderChangeHistory orderId={orderId} entityType={EntityType.CustomerOrder}/>
      </CardContent>
    </BlankCard>
  );
};
