import { POStatus, PurchaseOrder } from "@/API";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import { DBOperation, DBOperationError, rescueDBOperation } from "@/app/graphql-helpers/graphql-errors";
import { updatePurchaseOrderAPI } from "@/app/graphql-helpers/update-apis";
import { toReadableDateTime } from "@/utils/datetimeConversions";
import { Button, CardContent, Grid, Typography } from "@mui/material";

type ViewPOHeaderFieldsProps = {
  po: PurchaseOrder;
  setPo: React.Dispatch<React.SetStateAction<PurchaseOrder>>;
  setDBOperationError: React.Dispatch<React.SetStateAction<DBOperationError>>
};

const ViewPOHeaderFields = ({ po, setPo, setDBOperationError }: ViewPOHeaderFieldsProps) => {
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
      setDBOperationError,
      DBOperation.UPDATE,
      (resp: PurchaseOrder) => {
        setPo(resp);
      }
    )
  }

  const columnHeaderSpacing = 1;
  return (
    <BlankCard>
      <CardContent>
        <Grid container spacing={3}>
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
          <Grid item xs={4}>
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
          <Grid item xs={4}>
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
        </Grid>
      </CardContent>
    </BlankCard>
  );
};

export default ViewPOHeaderFields;
