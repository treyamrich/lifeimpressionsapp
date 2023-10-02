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
import { ChangeEvent, useState } from "react";

interface EditRowPopupProps {
  onSubmit: () => void;
  open: boolean;
  title: string;
}

const EditRowPopup = ({ open, onSubmit, title }: EditRowPopupProps) => {
  const [editReason, setEditReason] = useState("received-item");
  const [otherInput, setOtherInput] = useState(""); // When user selects "other"
  const [otherInputError, setOtherInputError] = useState(false);
  const handleChangeEditReason = (newReason: string) => {
    setEditReason(newReason);
    if(newReason !== "other") setOtherInputError(false);
  };
  const handleSubmit = () => {
    if(editReason === "other" && !otherInput.length) {
        setOtherInputError(true);
        return;
    }
    onSubmit();
  }
  return (
    <Dialog open={open} maxWidth="xs">
      <DialogTitle textAlign="center">{title}</DialogTitle>
      <DialogContent style={{ padding: "25px" }}>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <BlankCard>
              <CardContent>
                <Grid container>
                  <Grid item>
                    <FormControl>
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
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </BlankCard>
          </Grid>
          <Grid item>
            <Grid container justifyContent={"end"}>
              <Grid item>
                <Button
                  color="primary"
                  variant="contained"
                  size="small"
                  onClick={handleSubmit}
                  type="submit"
                >
                  Submit
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
