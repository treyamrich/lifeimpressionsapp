import { CustomerOrder, UpdateCustomerOrderInput } from "@/API";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";
import { updateCustomerOrderAPI } from "@/graphql-helpers/update-apis";
import { Button, CardContent, Grid, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { columnInfo, getTableColumns, orderStatusMap } from "../../table-constants";
import { useState } from "react";
import DateTime from "@/app/(DashboardLayout)/components/datetime/DateTime";
import EditOrderHeaderPopup from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/EditOrderHeaderPopup";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";

type ViewCOHeaderFieldsProps = {
    co: CustomerOrder;
    setCo: React.Dispatch<React.SetStateAction<CustomerOrder>>;
};

const ViewCOHeaderFields = ({ co, setCo }: ViewCOHeaderFieldsProps) => {
    const { push } = useRouter();
    const { rescueDBOperation } = useDBOperationContext();
    const { customerName, customerEmail, customerPhoneNumber, dateNeededBy, orderStatus, orderNotes, createdAt, updatedAt } = co;
    const [showEditPopup, setShowEditPopup] = useState(false);

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

    const columnHeaderSpacing = 1;

    return (
        <BlankCard>
            <CardContent>
                <Grid container direction={"column"} rowSpacing={3}>
                    <Grid item>
                        <Grid container spacing={2} alignItems={"center"}>
                            <Grid item xs={1}>
                                <Grid container direction="column" spacing={columnHeaderSpacing}>
                                    <Grid item>
                                        <Typography variant="h6" color="textSecondary">
                                            Status
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        {orderStatusMap[orderStatus]}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={3}>
                                <Grid container direction="column" spacing={columnHeaderSpacing}>
                                    <Grid item>
                                        <Typography variant="h6" color="textSecondary">
                                            Date Needed
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1" color="textSecondary">
                                            <DateTime value={dateNeededBy} />
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={3}>
                                <Grid container direction="column" spacing={columnHeaderSpacing}>
                                    <Grid item>
                                        <Typography variant="h6" color="textSecondary">
                                            Date Created
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1" color="textSecondary">
                                            <DateTime value={createdAt} />
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={3}>
                                <Grid container direction="column" spacing={columnHeaderSpacing}>
                                    <Grid item>
                                        <Typography variant="h6" color="textSecondary">
                                            Last Modified
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1" color="textSecondary">
                                            <DateTime value={updatedAt} />
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2}>
                                <Button
                                    id="delete-co-button"
                                    color={"error"}
                                    variant="contained"
                                    size="small"
                                    onClick={handleDeleteCustomerOrder}
                                >
                                    Delete Order
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <Grid container direction="column" spacing={columnHeaderSpacing}>
                                    <Grid item>
                                        <Typography variant="h6" color="textSecondary">
                                            Customer Name
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1" color="textSecondary">
                                            {customerName}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={3}>
                                <Grid container direction="column" spacing={columnHeaderSpacing}>
                                    <Grid item>
                                        <Typography variant="h6" color="textSecondary">
                                            Customer Email
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1" color="textSecondary">
                                            {getStrOrDash(customerEmail)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={3}>
                                <Grid container direction="column" spacing={columnHeaderSpacing}>
                                    <Grid item>
                                        <Typography variant="h6" color="textSecondary">
                                            Customer Phone Number
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1" color="textSecondary">
                                            {getStrOrDash(customerPhoneNumber)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2}>
                                <Button
                                    id="edit-co-button"
                                    color={"success"}
                                    variant="contained"
                                    size="small"
                                    onClick={() => setShowEditPopup(true)}
                                >
                                    Edit Order
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Grid container direction="column" spacing={columnHeaderSpacing}>
                            <Grid item>
                                <Typography variant="h6" color="textSecondary">
                                    Order Notes
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" color="textSecondary">
                                    {getStrOrDash(orderNotes)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <EditOrderHeaderPopup
                    open={showEditPopup}
                    order={co}
                    onSubmit={handleUpdateCO}
                    onClose={() => setShowEditPopup(false)}
                    orderType={EntityType.CustomerOrder}
                    getTableColumns={getTableColumns}
                    columnInfo={columnInfo}
                />
            </CardContent>
        </BlankCard>
    );
};

export default ViewCOHeaderFields;

const getStrOrDash = (value: string | null | undefined) => {
    return value !== "" && value !== null && value !== undefined ? value : "-"
}