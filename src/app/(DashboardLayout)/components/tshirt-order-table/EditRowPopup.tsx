import {
  Button,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import BlankCard from "../shared/BlankCard";
import { SetStateAction, useState } from "react";
import { MRT_Row } from "material-react-table";
import { CreatePurchaseOrderChangeInput, TShirtOrder } from "@/API";

interface EditRowPopupProps {
  onSubmit: (poChange: CreatePurchaseOrderChangeInput) => void;
  onClose: () => void;
  open: boolean;
  row: MRT_Row<TShirtOrder> | undefined;
  purchaseOrderId: string | undefined;
  title: string;
}

const amtReceivedField = "amountReceived";
const amtOrderedField = "quantity";
const initialEditReasonState = "Received Item";

const EditRowPopup = ({
  open,
  row,
  purchaseOrderId,
  onSubmit,
  onClose,
  title,
}: EditRowPopupProps) => {
  const [newAmtReceived, setNewAmtReceived] = useState<number>(0);
  const currentAmtReceived: number = row ? row.getValue(amtReceivedField) : 0;
  const [newAmtOrdered, setNewAmtOrdered] = useState<number>(0);
  const currentAmtOrdered: number = row ? row.getValue(amtOrderedField) : 0;
  const [editReason, setEditReason] = useState(initialEditReasonState);
  const [otherInput, setOtherInput] = useState(""); // When user selects "other"
  const [otherInputError, setOtherInputError] = useState(false);

  const resetForm = () => {
    setOtherInputError(false);
    setOtherInput("");
    setEditReason(initialEditReasonState);
    setNewAmtReceived(0);
    setNewAmtOrdered(0);
  };
  
  const handleSubmit = () => {
    if (editReason === "other" && !otherInput.length) {
      setOtherInputError(true);
      return;
    }
    const tshirtStyleNo: string = row ? row.getValue("tShirtOrderTshirtStyleNumber") : "";
    const editReasonMsg = editReason === "other" ? otherInput : editReason;
    const poChange: CreatePurchaseOrderChangeInput = {
      quantityChange: newAmtReceived,
      orderedQuantityChange: newAmtOrdered,
      reason: editReasonMsg,
      purchaseOrderChangeTshirtStyleNumber: tshirtStyleNo,
      purchaseOrderChangeHistoryId: purchaseOrderId
    };
    onSubmit(poChange);
    resetForm();
  };

  return (
    <Dialog open={open} maxWidth="md">
      <DialogTitle textAlign="center">{title}</DialogTitle>
      <DialogContent style={{ padding: "25px" }}>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <EditCard
              currentAmtReceived={currentAmtReceived}
              newAmtReceived={newAmtReceived}
              setNewAmtReceived={setNewAmtReceived}
              currentAmtOrdered={currentAmtOrdered}
              newAmtOrdered={newAmtOrdered}
              setNewAmtOrdered={setNewAmtOrdered}
              editReason={editReason}
              setEditReason={setEditReason}
              otherInput={otherInput}
              setOtherInput={setOtherInput}
              otherInputError={otherInputError}
              setOtherInputError={setOtherInputError}
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

type EditCardProps = {
  currentAmtReceived: number;
  newAmtReceived: number;
  setNewAmtReceived: React.Dispatch<React.SetStateAction<number>>;

  currentAmtOrdered: number;
  newAmtOrdered: number;
  setNewAmtOrdered: React.Dispatch<React.SetStateAction<number>>;

  editReason: string;
  setEditReason: React.Dispatch<React.SetStateAction<string>>;

  otherInput: string;
  setOtherInput: React.Dispatch<React.SetStateAction<string>>;
  setOtherInputError: React.Dispatch<React.SetStateAction<boolean>>;
  otherInputError: boolean;
};

const EditCard = ({
  currentAmtReceived,
  newAmtReceived,
  setNewAmtReceived,
  currentAmtOrdered,
  newAmtOrdered,
  setNewAmtOrdered,
  editReason,
  setEditReason,
  otherInput,
  setOtherInput,
  otherInputError,
  setOtherInputError,
}: EditCardProps) => {
  const handleChangeEditReason = (newReason: string) => {
    setEditReason(newReason);
    if (newReason !== "other") setOtherInputError(false);
  };
  return (
    <BlankCard>
      <CardContent>
        <FormControl>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <QuantityChanger
                title="Amount Received"
                newQty={newAmtReceived}
                setNewQty={setNewAmtReceived}
                currentQty={currentAmtReceived}
              />
            </Grid>
            <Grid item>
              <QuantityChanger
                title="Amount Ordered"
                newQty={newAmtOrdered}
                setNewQty={setNewAmtOrdered}
                currentQty={currentAmtOrdered}
              />
            </Grid>
            <Grid item>
              <FormLabel id="radio-buttons-group-label">
                Please enter the reason for editing
              </FormLabel>
              <RadioGroup
                aria-labelledby="radio-buttons-group-label"
                name="radio-buttons-group"
                value={editReason}
                onChange={(e) => handleChangeEditReason(e.target.value)}
              >
                <FormControlLabel
                  value="Received Item"
                  control={<Radio />}
                  label="Received Item"
                />
                <FormControlLabel
                  value="Damaged Item"
                  control={<Radio />}
                  label="Damaged Item"
                />
                <FormControlLabel
                  value="other"
                  control={<Radio />}
                  label="Other"
                />
                <TextField
                  name="other-text-input"
                  onChange={(e) => setOtherInput(e.target.value)}
                  variant="standard"
                  value={otherInput}
                  disabled={editReason !== "other"}
                  required={editReason === "other"}
                  error={otherInputError}
                  helperText="Other reason"
                />
              </RadioGroup>
            </Grid>
          </Grid>
        </FormControl>
      </CardContent>
    </BlankCard>
  );
};

type QuantityChangerProps = {
  newQty: number;
  setNewQty: React.Dispatch<SetStateAction<number>>;
  title: String;
  currentQty: number;
};

const QuantityChanger = ({ newQty, setNewQty, title, currentQty }: QuantityChangerProps) => (
  <Grid container direction="column" spacing={1}>
    <Grid item>
      <Grid container direction="column">
        <Grid item>
          <FormLabel id={`title-label-${title}`}>
            <Typography variant="h6">
              {title}
            </Typography>
          </FormLabel>
        </Grid>
      </Grid>
    </Grid>
    <Grid item>
      <Grid container alignItems={"center"} spacing={2}>
        <Grid item>
          New Total: {newQty + currentQty}
        </Grid>
        <Grid item>
          <Grid container spacing={2} alignItems={"center"}>
            <Grid item>
              <Button
                color="error"
                variant="contained"
                size="small"
                onClick={() =>
                  setNewQty((prev: number) => prev - 1)
                }
              >
                -
              </Button>
            </Grid>
            <Grid item>{newQty}</Grid>
            <Grid item>
              <Button
                color="success"
                variant="contained"
                size="small"
                onClick={() =>
                  setNewQty((prev: number) => prev + 1)
                }
              >
                +
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);