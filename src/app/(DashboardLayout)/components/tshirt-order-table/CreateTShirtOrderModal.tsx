"use client";

import { useState } from "react";
import {
  excludeOnCreateFields,
  getInitialTShirtOrderFormErrorMap,
  initialTShirtOrderFormState,
  modalTitle,
  numberInputFields,
} from "./table-constants";
import {
  Alert,
  Autocomplete,
  AutocompleteRenderInputParams,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { TShirt } from "@/API";
import { MRT_ColumnDef } from "material-react-table";

interface CreateTShirtOrderModal<TShirtOrder extends Record<string, any>> {
  columns: MRT_ColumnDef<TShirtOrder>[];
  onClose: () => void;
  onSubmit: (values: TShirtOrder) => void;
  open: boolean;
  tshirtChoices: TShirt[];
}

const CreateTShirtOrderModal = <TShirtOrder extends Record<string, any>>({
  open,
  columns,
  onClose,
  onSubmit,
  tshirtChoices,
}: CreateTShirtOrderModal<TShirtOrder>) => {
  //Initial TShirtOrder values
  const [values, setValues] = useState<any>(() => {
    return { ...initialTShirtOrderFormState };
  });
  const [errorMap, setErrorMap] = useState(
    () =>
      new Map<string, string>(
        Object.keys(initialTShirtOrderFormState).map((key) => [key, ""])
      )
  );
  const [autoCompleteInputVal, setAutoCompleteInputVal] = useState("");
  const [selectedTShirt, setSelectedTShirt] = useState<TShirt | null>(null);

  const resetForm = () => {
    setValues({ ...initialTShirtOrderFormState });
    setSelectedTShirt(null);
    setAutoCompleteInputVal("");
    setErrorMap(getInitialTShirtOrderFormErrorMap());
  };
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    //Validate input
    const newErrors = new Map<string, string>(errorMap);
    let allValid = true;

    Object.keys(values).forEach((key) => {
      let errMsg = "";
      let value = values[key];
      if (isNumberInputField(key) && value < 0) {
        errMsg = "Number must be non-negative";
      } else if (
        key === "tShirtOrderTshirtStyleNumber" &&
        value.toString().length < 1
      ) {
        errMsg = "TShirt is not selected";
      }
      newErrors.set(key, errMsg);
      allValid = allValid && errMsg === "";
    });
    setErrorMap(newErrors);
    if (allValid) {
      onSubmit(values);
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">{modalTitle}</DialogTitle>
      <DialogContent style={{ padding: "25px" }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: "100%",
              minWidth: { xs: "300px", sm: "360px", md: "400px" },
              gap: "1.5rem",
            }}
          >
            {columns
              .filter(
                (col) =>
                  !excludeOnCreateFields.includes(col.accessorKey as string)
              )
              .map((column) => (
                <TextField
                  key={column.accessorKey as React.Key}
                  label={column.header}
                  name={column.accessorKey as string}
                  onChange={(e) =>
                    setValues({ ...values, [e.target.name]: e.target.value })
                  }
                  type={
                    isNumberInputField(column.accessorKey)
                      ? "number"
                      : undefined
                  }
                  variant="standard"
                  value={values[column.accessorKey]}
                  required={true}
                  error={errorMap.get(column.accessorKey as string) !== ""}
                  helperText={errorMap.get(column.accessorKey as string)}
                />
              ))}
            <Autocomplete
              id="auto-complete"
              options={tshirtChoices}
              getOptionLabel={(option: TShirt) => option.styleNumber}
              autoComplete
              renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField
                  {...params}
                  label="TShirt Style No."
                  variant="standard"
                />
              )}
              value={selectedTShirt}
              onChange={(event, newValue) => {
                setValues({
                  ...values,
                  tShirtOrderTshirtStyleNumber: newValue?.styleNumber,
                });
                setSelectedTShirt(newValue);
              }}
              inputValue={autoCompleteInputVal}
              onInputChange={(event, newInputValue) => {
                setAutoCompleteInputVal(newInputValue);
              }}
              renderOption={(props, option) => {
                return (
                  <li {...props} key={option.styleNumber}>
                    {option.styleNumber}
                  </li>
                );
              }}
              renderTags={(tagValue, getTagProps) => {
                return tagValue.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.styleNumber}
                    label={option.styleNumber}
                  />
                ));
              }}
            />
            {errorMap.get("tShirtOrderTshirtStyleNumber") !== "" && (
              <Alert severity="error">TShirt not selected.</Alert>
            )}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: "1.25rem" }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button color="secondary" onClick={handleSubmit} variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTShirtOrderModal;

const isNumberInputField = (
  fieldName: string | number | symbol | undefined
) => {
  let nameOfField = fieldName ? fieldName.toString() : "";
  return numberInputFields.has(nameOfField);
};
