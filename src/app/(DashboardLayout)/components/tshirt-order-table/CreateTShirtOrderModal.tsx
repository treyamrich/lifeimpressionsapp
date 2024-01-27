"use client";

import { useState, useEffect } from "react";
import {
  excludeOnCreateFields,
  floatInputFields,
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
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { TShirt } from "@/API";
import { MRT_ColumnDef } from "material-react-table";
import TShirtPicker from "./TShirtPicker";
import BlankCard from "../shared/BlankCard";
import NumberInput from "../NumberInput/NumberInput";

interface CreateTShirtOrderModalProps<TShirtOrder extends Record<string, any>> {
  columns: MRT_ColumnDef<TShirtOrder>[];
  onClose: () => void;
  onSubmit: (values: TShirtOrder, callback: () => void) => void;
  open: boolean;
  tshirtChoices: TShirt[];
  tableData: TShirtOrder[];
}

const CreateTShirtOrderModal = <TShirtOrder extends Record<string, any>>({
  open,
  columns,
  onClose,
  onSubmit,
  tshirtChoices,
  tableData,
}: CreateTShirtOrderModalProps<TShirtOrder>) => {
  //Initial TShirtOrder values
  const [values, setValues] = useState<any>(() => {
    return { ...initialTShirtOrderFormState };
  });
  const [errorMap, setErrorMap] = useState(() => getInitialTShirtOrderFormErrorMap());

  // Used to prevent duplicate TShirtOrders in an order
  const [tshirtSet, setTShirtSet] = useState<Set<String>>(new Set<String>());

  useEffect(() => {
    setTShirtSet(new Set(tableData.map(tshirtOrder => tshirtOrder.tshirt.id)));
  }, [tableData]);

  const resetForm = () => {
    setValues({ ...initialTShirtOrderFormState });
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

      if (key === "amountReceived") return;

      if (key === "quantity" && value <= 0) {
        errMsg = "Number must be positive";
      } else if (key === "costPerUnit" && value < 0) {
        errMsg = "Cost cannot be negative";
      }
      else if (key === "tshirt" && value === null) {
        // Preserve existing error message if exists
        if (errorMap.get(key) !== "" && errorMap.get(key) !== undefined) {
          errMsg = errorMap.get(key)!;
        } else {
          errMsg = "T-Shirt details incomplete";
        }
      }

      newErrors.set(key, errMsg);
      allValid = allValid && errMsg === "";
    });

    setValues({ ...values }); // Values might've updated
    setErrorMap(newErrors);
    if (allValid) {
      onSubmit(
        values,
        () => {
          resetForm();
          onClose();
        }
      );
    }
  };

  const handleUpdateTShirt = (newShirt: TShirt | null) => {
    const newErrorMap = new Map<string, string>(errorMap);
    if (newShirt && tshirtSet.has(newShirt.id)) {
      newErrorMap.set('tshirt', 'Order already contains T-Shirt type.');
    } else {
      newErrorMap.set('tshirt', '');
      setValues({ ...values, tshirt: newShirt });
    }
    setErrorMap(newErrorMap);
  }

  const handleUpdateNumberField = (key: string, newValue: number, hasError: boolean) => {
    const newErrorMap = new Map<string, string>(errorMap);
    if (hasError) {
      newErrorMap.set(key, "Invalid input");
    } else {
      newErrorMap.set(key, '');
      setValues({ ...values, [key]: newValue });
    }
    setErrorMap(newErrorMap);
  }
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
            }}>
            <BlankCard>
              <CardContent>
                <Typography variant="h6" color="textSecondary" style={{ marginBottom: "15px" }}>
                  Other Order Details
                </Typography>
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
                    .map((column, idx) => (
                      <NumberInput
                        key={idx}
                        label={column.header}
                        initialValue={values[column.accessorKey]}
                        isFloat={column.accessorKey === "costPerUnit"}
                        onChange={(newValue: number, hasError: boolean) =>
                          handleUpdateNumberField(column.accessorKey as string, newValue, hasError)
                        }
                        customErrorMsg={column.accessorKey === "costPerUnit" ? "Not a valid dollar value" : undefined}
                      />
                    ))}
                </Stack>
              </CardContent>
            </BlankCard>

            <BlankCard>
              <CardContent>
                <Typography variant="h6" color="textSecondary" style={{ marginBottom: "15px" }}>
                  TShirt Details
                </Typography>

                <TShirtPicker
                  choices={tshirtChoices}
                  onChange={handleUpdateTShirt}
                  errorMessage={errorMap.get('tshirt')}
                />
              </CardContent>
            </BlankCard>

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

const isFloatInputField = (
  fieldName: string | number | symbol | undefined
) => {
  let nameOfField = fieldName ? fieldName.toString() : "";
  return floatInputFields.has(nameOfField);
};

