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
} from "@mui/material";
import BlankCard from "../shared/BlankCard";
import { useState } from "react";
import { MRT_Row } from "material-react-table";
import { CreatePurchaseOrderChangeInput, TShirtOrder } from "@/API";

interface EditRowPopupProps {
  onSubmit: (poChange: CreatePurchaseOrderChangeInput) => void;
  onClose: () => void;
  open: boolean;
  row: MRT_Row<TShirtOrder> | undefined;
  title: string;
}

const amtReceivedField = "amountReceived";

const EditRowPopup = ({
  open,
  row,
  onSubmit,
  onClose,
  title,
}: EditRowPopupProps) => {
  const [newAmtReceived, setNewAmtReceived] = useState<number>(0);
  const currentAmtReceived: number = row ? row.getValue(amtReceivedField) : 0;
  const [editReason, setEditReason] = useState("received-item");
  const [otherInput, setOtherInput] = useState(""); // When user selects "other"
  const [otherInputError, setOtherInputError] = useState(false);

  const handleSubmit = () => {
    if (editReason === "other" && !otherInput.length) {
      setOtherInputError(true);
      return;
    }
    const tshirtStyleNo: string = row ? row.getValue("tShirtOrderTshirtStyleNumber") : "";
    const poChange: CreatePurchaseOrderChangeInput = {
        quantityChange: newAmtReceived,
        reason: editReason,
        purchaseOrderChangeTshirtStyleNumber: tshirtStyleNo,

    };
    onSubmit(poChange);
    resetForm();
  };

  const resetForm = () => {
    setOtherInputError(false);
    setOtherInput("");
    setEditReason("received-item");
    setNewAmtReceived(0);
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
              <FormLabel id="total-amount-received">
                New Total Amount Received
              </FormLabel>
              <Grid container>
                <Grid item>{newAmtReceived + currentAmtReceived}</Grid>
              </Grid>
            </Grid>
            <Grid item>
              <FormLabel id="amount-received">Received Amount Change</FormLabel>
              <Grid container spacing={3} alignItems={"center"}>
                <Grid item>
                  <Button
                    color="error"
                    variant="contained"
                    size="small"
                    onClick={() =>
                      setNewAmtReceived((prev: number) => prev - 1)
                    }
                  >
                    -
                  </Button>
                </Grid>
                <Grid item>{newAmtReceived}</Grid>
                <Grid item>
                  <Button
                    color="success"
                    variant="contained"
                    size="small"
                    onClick={() =>
                      setNewAmtReceived((prev: number) => prev + 1)
                    }
                  >
                    +
                  </Button>
                </Grid>
              </Grid>
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
                  value="received-item"
                  control={<Radio />}
                  label="Received Item"
                />
                <FormControlLabel
                  value="damaged-item"
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
