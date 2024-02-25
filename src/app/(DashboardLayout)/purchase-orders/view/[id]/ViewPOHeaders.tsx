import { PurchaseOrder } from "@/API";
import DateTime from "@/app/(DashboardLayout)/components/datetime/DateTime";
import { getFieldWithHeader, getTextField } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/ViewOrderHeader/util/viewOrderHeadersUtil";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";
import { updatePurchaseOrderAPI } from "@/graphql-helpers/update-apis";
import { CardContent, Grid } from "@mui/material";
import { columnInfo, getTableColumns } from "../../table-constants";
import EditOrderHeaderPopup from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/ViewOrderHeader/EditOrderHeaderPopup";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import OrderStatusSelect from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/ViewOrderHeader/OrderStatusSelect";

type ViewPOHeaderFieldsProps = {
  po: PurchaseOrder;
  setPo: React.Dispatch<React.SetStateAction<PurchaseOrder>>;
  showEditPopup: boolean;
  setShowEditPopup: React.Dispatch<React.SetStateAction<boolean>>;
};

const ViewPOHeaderFields = ({ po, setPo, showEditPopup, setShowEditPopup }: ViewPOHeaderFieldsProps) => {
  const { rescueDBOperation } = useDBOperationContext();
  const {
    orderNumber,
    vendor,
    createdAt,
    updatedAt,
    status,
    shippingAddress,
    orderNotes,
    dateExpected
  } = po;

  const handleUpdatePO = (newPo: PurchaseOrder, resetForm: () => void) => {
    const cleanPo = {
      ...newPo,
      orderedItems: undefined,
      changeHistory: undefined
    };
    rescueDBOperation(
      () => updatePurchaseOrderAPI(cleanPo),
      DBOperation.UPDATE,
      (resp: PurchaseOrder) => {
        setPo(resp);
        setShowEditPopup(false);
        resetForm();
      }
    )
  }

  const handleChangePOStatus = (e: any) => {
    const cleanedUpdatedPo: PurchaseOrder = {
      ...po,
      orderedItems: undefined,
      changeHistory: undefined,
      status: e.target.value
    };
    rescueDBOperation(
      () => updatePurchaseOrderAPI(cleanedUpdatedPo),
      DBOperation.UPDATE,
      (resp: PurchaseOrder) => {
        setPo(resp);
      }
    )
  }

  const statusSelect = (<OrderStatusSelect
    entityType={EntityType.PurchaseOrder}
    status={status}
    onChange={handleChangePOStatus}
    selectValues={columnInfo.get('status')?.selectFields}
  />);

  return (
    <>
      <BlankCard>
        <CardContent>
          <Grid container rowSpacing={3}>
            {getFieldWithHeader("Status", statusSelect, 4)}
            {getFieldWithHeader("Order #", getTextField(orderNumber), 4)}
            {getFieldWithHeader("Vendor", getTextField(vendor), 4)}

            {getFieldWithHeader("Date Placed", <DateTime value={createdAt} />, 4)}
            {getFieldWithHeader("Last Modified", <DateTime value={updatedAt} />, 4)}
            {getFieldWithHeader("Expected Date", <DateTime value={dateExpected} />, 4)}

            {getFieldWithHeader("Shipping Address", getTextField(getStrOrDash(shippingAddress)), 3)}

            {getFieldWithHeader("Order Notes", getTextField(getStrOrDash(orderNotes)), 12)}
          </Grid>
        </CardContent>
      </BlankCard>

      <EditOrderHeaderPopup
        open={showEditPopup}
        order={po}
        onSubmit={handleUpdatePO}
        onClose={() => setShowEditPopup(false)}
        orderType={EntityType.PurchaseOrder}
        getTableColumns={getTableColumns}
        columnInfo={columnInfo}
      />
    </>
  );
};

export default ViewPOHeaderFields;

const getStrOrDash = (value: string | null | undefined) => {
  return value !== "" && value !== null && value !== undefined ? value : "-"
}
