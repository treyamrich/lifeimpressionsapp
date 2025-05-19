"use client";

import { MRT_ColumnDef } from "material-react-table";
import React, { useState } from "react";
import {
  type SelectValue,
  getInitialTShirtFormErrorMap,
  initialTShirtFormState,
} from "./create-tshirt-constants";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import NumberInput from "../../components/inputs/NumberInput";
import { columnInfo } from "./table-constants";

interface CreateTShirtModalProps<TShirt extends Record<string, any>> {
  columns: MRT_ColumnDef<TShirt>[];
  onClose: () => void;
  onSubmit: (values: TShirt) => void;
  open: boolean;
  entityName: String;
  records: TShirt[];
}

const CreateTShirtModal = <TShirt extends Record<string, any>>({
  open,
  columns,
  onClose,
  onSubmit,
  entityName,
  records,
}: CreateTShirtModalProps<TShirt>) => {
  //Initial TShirt values
  const [values, setValues] = useState<any>(() => {
    return { ...initialTShirtFormState };
  });
  const [errorMap, setErrorMap] = useState(
    () =>
      new Map<string, string>(
        Object.keys(initialTShirtFormState).map((key) => [key, ""])
      )
  );

  const resetForm = () => {
    setValues({ ...initialTShirtFormState });
    setErrorMap(getInitialTShirtFormErrorMap());
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

      if (key === "quantityOnHand" && errorMap.get(key) !== "") {
        errMsg = errorMap.get(key)!;
      } else if (typeof value === "string") {
        values[key] = value.trim();
        if (values[key].length < 1) errMsg = "Field is required";
      }
      newErrors.set(key, errMsg);
      allValid = allValid && errMsg === "";
    });

    // THIS IS BUGGED because pagination reduces the records
    // let hasDuplicate = records.reduce(
    //   (prev, curr) =>
    //     prev ||
    //     (curr.styleNumber.toLowerCase() === values.styleNumber.toLowerCase() &&
    //       curr.size.toLowerCase() === values.size.toLowerCase() &&
    //       curr.color.toLowerCase() === values.color.toLowerCase()),
    //   false
    // );

    // if (hasDuplicate) {
    //   allValid = false;
    //   const dupMsg = "Tshirt with style number, size, color already exists";
    //   newErrors.set("styleNumber", dupMsg);
    //   newErrors.set("size", dupMsg);
    //   newErrors.set("color", dupMsg);
    // }

    setErrorMap(newErrors);

    if (allValid) {
      values.styleNumber = values.styleNumber.trim();
      values.color = values.color.trim();
      values.color =
        values.color.substring(0, 1).toUpperCase() + values.color.substring(1);
      values.brand = values.brand.trim();
      onSubmit(values);
      resetForm();
      onClose();
    }
  };

  const handleUpdateNumberField = (
    key: string,
    newValue: number,
    hasError: boolean
  ) => {
    const newErrorMap = new Map<string, string>(errorMap);
    if (hasError) {
      newErrorMap.set(key, "Invalid input");
    } else {
      newErrorMap.set(key, "");
      setValues({ ...values, [key]: newValue });
    }
    setErrorMap(newErrorMap);
  };

  const getFormField = (column: MRT_ColumnDef<TShirt>) => {
    const errMsg = errorMap.get(column.accessorKey as string);
    const hasError = errMsg !== "" && errMsg !== undefined;
    const colInfo = columnInfo.get(column.accessorKey);
    if (colInfo?.isNumberField) {
      return (
        <NumberInput
          key={column.accessorKey as React.Key}
          label={column.header}
          initialValue={values[column.accessorKey]}
          onChange={(newValue: string, hasError: boolean) => {
            handleUpdateNumberField(
              column.accessorKey as string,
              parseInt(newValue, 10),
              hasError
            );
          }}
          isValidFn={(newValue: string) =>
            parseInt(newValue, 10) < 0 ? "Negative values not allowed" : ""
          }
          name={column.accessorKey as string}
        />
      );
    }
    return (
      <TextField
        select={colInfo?.selectFields !== undefined}
        key={column.accessorKey as React.Key}
        label={column.header}
        name={column.accessorKey as string}
        onChange={(e) =>
          setValues({ ...values, [e.target.name]: e.target.value })
        }
        value={values[column.accessorKey]}
        required={colInfo?.isRequired}
        error={errorMap.get(column.accessorKey as string) !== ""}
        helperText={errorMap.get(column.accessorKey as string)}
      >
        {colInfo?.selectFields?.map((selectValue: SelectValue, idx: number) => (
          <MenuItem key={idx} value={selectValue.value}>
            {selectValue.label}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">{"Create New " + entityName}</DialogTitle>
      <DialogContent style={{ padding: "25px" }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: "100%",
              minWidth: { xs: "300px", sm: "360px", md: "400px" },
              gap: "1.5rem",
            }}
            data-testid={"create-tshirt-inputs"}
          >
            {columns
              .filter(
                (col) => !columnInfo.get(col.accessorKey)?.excludeOnCreate
              )
              .map((column) => getFormField(column))}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: "1.25rem" }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button color="secondary" onClick={handleSubmit} variant="contained">
          Create New {entityName}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTShirtModal;
