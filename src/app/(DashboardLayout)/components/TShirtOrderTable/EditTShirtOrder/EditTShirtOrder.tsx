import {
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
import { TShirtOrderFields} from "../table-constants";
import { BuildOrderChangeInput, buildOrderChangeInput } from "../../po-customer-order-shared-components/OrderChangeHistory/util";
import EditCard from "./EditCard";
import ChosenTShirtCard from "./ChosenTShirtCard";

interface EditRowPopupProps {
  onSubmit: (createOrderChangeInput: CreateOrderChangeInput, resetFormCallback: () => void) => void;
  onClose: () => void;
  open: boolean;
  row: MRT_Row<TShirtOrder> | undefined;
  parentOrderId: string | undefined;
  title: string;
  entityType: EntityType;
  mode: TableMode;
}

const initialEditReasonState = "other"; // This provides easy form validation for both purchase/customer order edit forms

export interface FormValue<T> {
  value: T;
  hasError: boolean;
};

const EditRowPopup = ({
  open,
  row,
  parentOrderId,
  onSubmit,
  onClose,
  title,
  entityType,
  mode
}: EditRowPopupProps) => {

  const [newAmtReceived, setNewAmtReceived] = useState<number>(0);
  const currentAmtReceived: number = row ? row.getValue(TShirtOrderFields.AmtReceived) : 0;

  const [newAmtOrdered, setNewAmtOrdered] = useState<number>(0);
  const currentAmtOrdered: number = row ? row.getValue(TShirtOrderFields.Qty) : 0;

  const currentCostPerUnit = row ? row.getValue(TShirtOrderFields.CostPerUnit) as number : 0.0;
  const [newCostPerUnit, setNewCostPerUnit] = useState<FormValue<number>>({ value: 0, hasError: false });

  const [editReason, setEditReason] = useState(initialEditReasonState);
  const [otherInput, setOtherInput] = useState(""); // When user selects "other"
  const [otherInputError, setOtherInputError] = useState(false);

  const resetForm = () => {
    setOtherInputError(false);
    setOtherInput("");
    setEditReason(initialEditReasonState);
    setNewAmtReceived(0);
    setNewAmtOrdered(0);
    setNewCostPerUnit({ value: 0, hasError: false });
  };

  const handleSubmit = () => {
    if (editReason === "other" && !otherInput.length && mode === TableMode.Edit) {
      setOtherInputError(true);
      return;
    }

    if (newCostPerUnit.hasError)
      return;

    const editReasonMsg = editReason === "other" ? otherInput : editReason;
    const newTShirtOrder: TShirtOrder = {
      ...row!.original,
      costPerUnit: newCostPerUnit.value,
      // These two variables are delta's
      quantity: currentAmtOrdered + newAmtOrdered,
      amountReceived: currentAmtReceived + newAmtReceived,
    };

    let input: BuildOrderChangeInput = {
      oldTShirtOrder: row!.original,
      newTShirtOrder: newTShirtOrder,
      parentOrderId: parentOrderId,
      reason: editReasonMsg,
      entityType: entityType,
    }
    const createOrderChangeInput = buildOrderChangeInput(input)
    onSubmit(createOrderChangeInput, resetForm);
  };

  useEffect(() => {
    setNewCostPerUnit({ ...newCostPerUnit, value: currentCostPerUnit });
  }, [row]);

  return (
    <Dialog open={open} maxWidth="md">
      <DialogTitle textAlign="center">{title}</DialogTitle>
      <DialogContent style={{ padding: "25px" }}>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <ChosenTShirtCard tshirt={row?.original.tshirt!}/>
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

              editReason={editReason}
              setEditReason={setEditReason}
              otherInput={otherInput}
              setOtherInput={setOtherInput}
              otherInputError={otherInputError}
              setOtherInputError={setOtherInputError}
              entityType={entityType}
              mode={mode}
            />
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

export default EditRowPopup;

