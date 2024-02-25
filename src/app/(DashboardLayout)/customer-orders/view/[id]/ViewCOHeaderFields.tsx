import { CustomerOrder } from "@/API";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";
import { updateCustomerOrderAPI } from "@/graphql-helpers/update-apis";
import { CardContent, Grid } from "@mui/material";
import { columnInfo, getTableColumns } from "../../table-constants";
import DateTime from "@/app/(DashboardLayout)/components/datetime/DateTime";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { getFieldWithHeader, getTextField } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/ViewOrderHeader/util/viewOrderHeadersUtil";
import EditOrderHeaderPopup from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/ViewOrderHeader/EditOrderHeaderPopup";
import OrderStatusSelect from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/ViewOrderHeader/OrderStatusSelect";

type ViewCOHeaderFieldsProps = {
    co: CustomerOrder;
    setCo: React.Dispatch<React.SetStateAction<CustomerOrder>>;
    showEditPopup: boolean;
    setShowEditPopup: React.Dispatch<React.SetStateAction<boolean>>;
};

const ViewCOHeaderFields = ({ co, setCo, showEditPopup, setShowEditPopup }: ViewCOHeaderFieldsProps) => {
    const { rescueDBOperation } = useDBOperationContext();
    const {
        customerName,
        customerEmail,
        customerPhoneNumber,
        dateNeededBy,
        orderStatus,
        orderNumber,
        orderNotes,
        createdAt,
        updatedAt,
    } = co;

    const handleUpdateCO = (newCo: CustomerOrder, resetForm: () => void) => {
        const cleanCo = {
            ...newCo,
            orderedItems: undefined,
            changeHistory: undefined
        };
        rescueDBOperation(
            () => updateCustomerOrderAPI(cleanCo),
            DBOperation.UPDATE,
            (resp: CustomerOrder) => {
                setCo(resp);
                setShowEditPopup(false);
                resetForm();
            }
        )
    }

    const handleChangePOStatus = (e: any) => {
        const cleanUpdatedCo: CustomerOrder = {
            ...co,
            orderedItems: undefined,
            changeHistory: undefined,
            orderStatus: e.target.value
        };
        rescueDBOperation(
            () => updateCustomerOrderAPI(cleanUpdatedCo),
            DBOperation.UPDATE,
            (resp: CustomerOrder) => {
                setCo(resp);
            }
        )
    }

    const statusSelect = (<OrderStatusSelect
        entityType={EntityType.CustomerOrder}
        status={orderStatus}
        onChange={handleChangePOStatus}
        selectValues={columnInfo.get('orderStatus')?.selectFields}
    />);

    return (
        <>
            <BlankCard>
                <CardContent>
                    <Grid container rowSpacing={3}>
                        {getFieldWithHeader("Status", statusSelect, 6)}
                        {getFieldWithHeader("Order #", getTextField(orderNumber), 6)}

                        {getFieldWithHeader("Date Needed", <DateTime value={dateNeededBy} />, 4)}
                        {getFieldWithHeader("Date Placed", <DateTime value={createdAt} />, 4)}
                        {getFieldWithHeader("Last Modified", <DateTime value={updatedAt} />, 4)}

                        {getFieldWithHeader("Customer Name", getTextField(customerName), 4)}
                        {getFieldWithHeader("Customer Email", getTextField(getStrOrDash(customerEmail)), 4)}
                        {getFieldWithHeader("Customer Phone Number", getTextField(getStrOrDash(customerPhoneNumber)), 4)}

                        {getFieldWithHeader("Order Notes", getTextField(getStrOrDash(orderNotes)), 12)}
                    </Grid>
                </CardContent>
            </BlankCard>

            <EditOrderHeaderPopup
                open={showEditPopup}
                order={co}
                onSubmit={handleUpdateCO}
                onClose={() => setShowEditPopup(false)}
                orderType={EntityType.CustomerOrder}
                getTableColumns={getTableColumns}
                columnInfo={columnInfo}
            />
        </>
    );
};

export default ViewCOHeaderFields;

const getStrOrDash = (value: string | null | undefined) => {
    return value !== "" && value !== null && value !== undefined ? value : "-"
}