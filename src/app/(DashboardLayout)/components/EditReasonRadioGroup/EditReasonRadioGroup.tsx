import {
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import React, { SetStateAction } from "react";

export type EditReasonFormState = {
  editReason: string;
  otherInput: string;
  otherInputError: boolean;
};

const EditReasonRadioGroup = ({
  formState,
  setFormState,
  showMandatoryRadioButtons,
}: {
  formState: EditReasonFormState;
  setFormState: React.Dispatch<SetStateAction<EditReasonFormState>>;
  showMandatoryRadioButtons: boolean;
}) => {
  const handleChangeEditReason = (newReason: string) => {
    let newFormState = {...formState, editReason: newReason};
    if (newReason !== "other") {
        newFormState.otherInputError = false;
    }
    setFormState(newFormState)
  };

  return (
    <>
      <FormLabel id="radio-buttons-group-label">
        Please enter the reason for editing
      </FormLabel>
      <RadioGroup
        aria-labelledby="radio-buttons-group-label"
        name="radio-buttons-group"
        value={formState.editReason}
        onChange={(e) => handleChangeEditReason(e.target.value)}
      >
        {showMandatoryRadioButtons && (
          <>
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
          </>
        )}
        <FormControlLabel value="other" control={<Radio />} label="Other" />
        <TextField
          name="other-text-input"
          onChange={(e) => setFormState({...formState, otherInput: e.target.value})}
          variant="standard"
          value={formState.otherInput}
          disabled={formState.editReason !== "other"}
          required={formState.editReason === "other"}
          error={formState.otherInputError}
          helperText="Other reason"
        />
      </RadioGroup>
    </>
  );
};

export default EditReasonRadioGroup;
