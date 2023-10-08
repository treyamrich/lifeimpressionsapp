import { POStatus, PurchaseOrder, UpdatePurchaseOrderInput } from "@/API";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import { DBOperation, rescueDBOperation } from "@/app/graphql-helpers/graphql-errors";
import { updatePurchaseOrderAPI } from "@/app/graphql-helpers/update-apis";
import { toReadableDateTime } from "@/utils/datetimeConversions";
import { Button, CardContent, Grid, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

type ViewPOHeaderFieldsProps = {
  po: PurchaseOrder;
  setPo: React.Dispatch<React.SetStateAction<PurchaseOrder>>;
};

const ViewPOHeaderFields = ({ po, setPo }: ViewPOHeaderFieldsProps) => {
  const { push } = useRouter();
  const { vendor, createdAt, updatedAt, status } = po;

  const handleChangePOStatus = () => {
    const cleanedUpdatedPo: PurchaseOrder = {
      ...po,
      orderedItems: undefined,
      changeHistory: undefined,
      status: po.status === POStatus.Open ? POStatus.Closed : POStatus.Open
    };
    rescueDBOperation(
      () => updatePurchaseOrderAPI(cleanedUpdatedPo),
      DBOperation.UPDATE,
      (resp: PurchaseOrder) => {
        setPo(resp);
      }
    )
  }

  const handleDeletePurchaseOrder = () => {
    if (!confirm(`Are you sure you want to delete this purchase order?`)) {
      return;
    }
    const deletedPurchaseOrder: UpdatePurchaseOrderInput = { id: po.id, isDeleted: true };
    rescueDBOperation(
      () => updatePurchaseOrderAPI(deletedPurchaseOrder),
      DBOperation.DELETE,
      () => {
        push('/purchase-orders/');
      }
    );
  }

  const columnHeaderSpacing = 1;
  return (
    <BlankCard>
      <CardContent>
        <Grid container spacing={3} alignItems={"center"}>
          <Grid item xs={2}>
            <Grid container direction="column" spacing={columnHeaderSpacing}>
              <Grid item>
                <Typography variant="h6" color="textSecondary">
                  Status
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  id="po-status"
                  color={status === POStatus.Open ? "success" : "error"}
                  variant="contained"
                  size="small"
                  onClick={handleChangePOStatus}
                >
                  {status}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={2}>
            <Grid container direction="column" spacing={columnHeaderSpacing}>
              <Grid item>
                <Typography variant="h6" color="textSecondary">
                  Vendor
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="body1" color="textSecondary">
                  {vendor}
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
                  {toReadableDateTime(createdAt)}
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
                  {toReadableDateTime(updatedAt)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={2}>
            <Button
              id="delete-po-button"
              color={"error"}
              variant="contained"
              size="small"
              onClick={handleDeletePurchaseOrder}
            >
              Delete Purchase Order
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </BlankCard>
  );
};

export default ViewPOHeaderFields;
