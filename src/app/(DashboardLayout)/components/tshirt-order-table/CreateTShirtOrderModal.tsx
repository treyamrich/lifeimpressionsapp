"use client";

import { useState, useEffect } from "react";
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
import { EntityType } from "../po-customer-order-shared-components/CreateOrderPage";

interface CreateTShirtOrderModal<TShirtOrder extends Record<string, any>> {
  columns: MRT_ColumnDef<TShirtOrder>[];
  onClose: () => void;
  onSubmit: (values: TShirtOrder) => void;
  open: boolean;
  tshirtChoices: TShirt[];
  tableData: TShirtOrder[];
  entityType: EntityType;
}

const CreateTShirtOrderModal = <TShirtOrder extends Record<string, any>>({
  open,
  columns,
  onClose,
  onSubmit,
  tshirtChoices,
  tableData,
  entityType
}: CreateTShirtOrderModal<TShirtOrder>) => {
  //Initial TShirtOrder values
  const [values, setValues] = useState<any>(() => {
    return { ...initialTShirtOrderFormState };
  });
  const [errorMap, setErrorMap] = useState(() => getInitialTShirtOrderFormErrorMap());
  const [autoCompleteInputVal, setAutoCompleteInputVal] = useState("");
  const [selectedTShirt, setSelectedTShirt] = useState<TShirt | null>(null);

  // Used to prevent duplicate TShirtOrders in a PurchaseOrder
  const [tshirtSet, setTShirtSet] = useState<Set<String>>(new Set<String>());
  useEffect(() => {
    setTShirtSet(new Set(tableData.map(tshirtOrder => tshirtOrder.tShirtOrderTshirtStyleNumber)));
  }, [tableData]);

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
                  onChange={(e: any) => {{
                    if(isNumberInputField(column.accessorKey)) {
                      try {
                        const v = parseInt(e.target.value, 10);
                        setValues({ ...values, [e.target.name]: isNaN(v) ? 0 : v })
                      } catch (e) {
                        console.log(e)
                      }
                    } else {
                      setValues({ ...values, [e.target.name]: e.target.value })
                    }
                  }}}
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
              getOptionDisabled={(option: TShirt) => tshirtSet.has(option.styleNumber)}
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
