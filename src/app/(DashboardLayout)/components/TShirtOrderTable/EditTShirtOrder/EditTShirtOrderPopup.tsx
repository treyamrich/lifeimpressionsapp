import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";
import { MRT_Row } from "material-react-table";
import { CreateOrderChangeInput, TShirtOrder } from "@/API";
import { EntityType } from "../../po-customer-order-shared-components/CreateOrderPage";
import { TableMode } from "../TShirtOrderTable";
import { TShirtOrderFields } from "../table-constants";
import {
  BuildOrderChangeInput,
  buildOrderChangeInput,
} from "../../po-customer-order-shared-components/OrderChangeHistory/util";
import EditCard from "./EditCard";
import ChosenTShirtCard from "./ChosenTShirtCard";
import {
  EditReasonFormState,
  getInitialEditReasonState,
  validateAndGetEditReason,
} from "../../EditReasonRadioGroup/EditReasonRadioGroup";

interface EditTShirtOrderPopupProps {
  onSubmit: (
    createOrderChangeInput: CreateOrderChangeInput,
    resetFormCallback: () => void
  ) => void;
  onClose: () => void;
  open: boolean;
  row: MRT_Row<TShirtOrder> | undefined;
  parentOrderId: string | undefined;
  title: string;
  entityType: EntityType;
  mode: TableMode;
}

export interface FormValue<T> {
  value: T;
  hasError: boolean;
}

const EditTShirtOrderPopup = ({
  open,
  row,
  parentOrderId,
  onSubmit,
  onClose,
  title,
  entityType,
  mode,
}: EditTShirtOrderPopupProps) => {
  const [newAmtReceived, setNewAmtReceived] = useState<number>(0);
  const currentAmtReceived: number = row
    ? row.getValue(TShirtOrderFields.AmtReceived)
    : 0;

  const [newAmtOrdered, setNewAmtOrdered] = useState<number>(0);
  const currentAmtOrdered: number = row
    ? row.getValue(TShirtOrderFields.Qty)
    : 0;

  const currentCostPerUnit = row
    ? (row.getValue(TShirtOrderFields.CostPerUnit) as number)
    : 0.0;
  const [newCostPerUnit, setNewCostPerUnit] = useState<FormValue<number>>({
    value: 0,
    hasError: false,
  });

  const currentDiscount = row
    ? (row.getValue(TShirtOrderFields.Discount) as number)
    : 0.0;
  const [newDiscount, setNewDiscount] = useState<FormValue<number>>({
    value: 0,
    hasError: false,
  });

  const [editReason, setEditReason] = useState<EditReasonFormState>(
    getInitialEditReasonState()
  );

  const [noChangeError, setNoChangeError] = useState<string | undefined>(
    undefined
  );

  const resetForm = () => {
    setEditReason(getInitialEditReasonState());
    setNewAmtReceived(0);
    setNewAmtOrdered(0);
    setNewCostPerUnit({ value: 0, hasError: false });
    setNoChangeError(undefined);
  };

  const handleSubmit = () => {
    let hadError = false;

    let editReasonMsg = validateAndGetEditReason(editReason, setEditReason);
    if (!editReasonMsg && mode === TableMode.Edit) {
      hadError = true;
    } else {
      setEditReason({ ...editReason, otherInputError: false });
    }

    const newTShirtOrder: TShirtOrder = {
      ...row!.original,
      costPerUnit: newCostPerUnit.value,
      discount: newDiscount.value,
      // These two variables are delta's
      quantity: currentAmtOrdered + newAmtOrdered,
      amountReceived: currentAmtReceived + newAmtReceived,
    };

    let input: BuildOrderChangeInput = {
      oldTShirtOrder: row!.original,
      newTShirtOrder: newTShirtOrder,
      parentOrderId: parentOrderId,
      reason: editReasonMsg ? editReasonMsg : "",
      entityType: entityType,
    };
    const createOrderChangeInput = buildOrderChangeInput(input);

    if (createOrderChangeInput.fieldChanges.length <= 0) {
      hadError = true
      setNoChangeError("No changes were made.");
    } else {
      setNoChangeError(undefined);
    }

    if (newCostPerUnit.hasError || newDiscount.hasError || hadError) return;

    onSubmit(createOrderChangeInput, resetForm);
  };

  useEffect(() => {
    setNewDiscount({ ...newDiscount, value: currentDiscount });
    setNewCostPerUnit({ ...newCostPerUnit, value: currentCostPerUnit });
  }, [row]);

  return (
    <Dialog open={open} maxWidth="md">
      <DialogTitle textAlign="center">{title}</DialogTitle>
      <DialogContent style={{ paddingLeft: "25px", paddingRight: "25px" }}>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <ChosenTShirtCard tshirt={row?.original.tshirt} />
          </Grid>
          <Grid item>
            <EditCard
              currentAmtReceived={currentAmtReceived}
              newAmtReceived={newAmtReceived}
              setNewAmtReceived={setNewAmtReceived}
              currentAmtOrdered={currentAmtOrdered}
              newAmtOrdered={newAmtOrdered}
              setNewAmtOrdered={setNewAmtOrdered}
              currentCostPerUnit={currentCostPerUnit}
              newCostPerUnit={newCostPerUnit}
              setNewCostPerUnit={setNewCostPerUnit}
              currentDiscount={currentDiscount}
              newDiscount={newDiscount}
              setNewDiscount={setNewDiscount}
              editReason={editReason}
              setEditReason={setEditReason}
              entityType={entityType}
              mode={mode}
            />
          </Grid>
          <Grid item>
            {noChangeError && (
              <Alert variant="filled" color="error">
                {noChangeError}
              </Alert>
            )}
          </Grid>
          <Grid item>
            <Grid container justifyContent={"space-between"}>
              <Grid item>
                <Button
                  color="error"
                  size="small"
                  variant="contained"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="primary"
                  variant="contained"
                  size="small"
                  onClick={handleSubmit}
                  type="submit"
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default EditTShirtOrderPopup;
