import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import NumberInput from "../components/inputs/NumberInput";
import { MRT_ColumnDef, MRT_Row } from "material-react-table";
import { TShirt, UpdateTShirtInput } from "@/API";
import { SelectValue } from "../purchase-orders/table-constants";
import { columnInfo } from "./table-constants";
import EditReasonRadioGroup, {
  EditReasonFormState,
  getInitialEditReasonState,
  validateAndGetEditReason,
} from "../components/EditReasonRadioGroup/EditReasonRadioGroup";

const editableFields = Array.from(columnInfo)
  .filter((keyPair) => keyPair[1].isEditable)
  .map((keyPair) => keyPair[0] as string);

function EditTShirtModal({
  open,
  row,
  onSubmit,
  onClose,
  getTableColumns,
}: {
  open: boolean;
  row: MRT_Row<TShirt> | undefined;
  onSubmit: (
    newTShirtInput: UpdateTShirtInput,
    row: MRT_Row<TShirt>,
    resetForm: () => void
  ) => void;
  onClose: () => void;
  getTableColumns: () => MRT_ColumnDef<TShirt>[];
}) {
  const columns = useMemo<MRT_ColumnDef<TShirt>[]>(() => getTableColumns(), []);
  const [editReason, setEditReason] = useState<EditReasonFormState>(
    getInitialEditReasonState()
  );

  const getInitialFormState = () => {
    const formState = { id: "" } as any;
    editableFields.forEach((columnKey: any) => {
      formState[columnKey] = "";

      let colInfo = columnInfo.get(columnKey);
      if (colInfo && colInfo.selectFields) {
        formState[columnKey] = colInfo.selectFields[0].value;
      }

      if (row) {
        formState.id = row.original.id; // REQUIRED for updates
        formState[columnKey] = row.getValue(columnKey);
      }
    });
    return formState;
  };
  const getInitialFormErrorMap = () =>
    new Map<string, string>(editableFields.map((key) => [key, ""]));

  // State starts here
  const [values, setValues] = useState<any>(() => getInitialFormState());
  const [errorMap, setErrorMap] = useState(() => getInitialFormErrorMap());

  const resetForm = () => {
    setEditReason(getInitialEditReasonState());
    setErrorMap(getInitialFormErrorMap());
    setValues(getInitialFormState());
  };

  useEffect(() => {
    resetForm();
  }, [row]);

  const handleSubmit = () => {
    //Validate input
    const newErrors = getInitialFormErrorMap();
    let allValid = true;
    Object.keys(values).forEach((key) => {
      let errMsg = "";
      let value = values[key];

      if (columnInfo.get(key)?.isNumberField && errorMap.get(key) !== "") {
        errMsg = errorMap.get(key)!;
      } else if (columnInfo.get(key)?.isRequired) {
        if (typeof value === "string") values[key] = value.trim();
        if (values[key].length < 1) errMsg = "Field is required";
      }
      newErrors.set(key, errMsg);
      allValid = allValid && errMsg === "";
    });
    setErrorMap(newErrors);

    let editReasonMsg = validateAndGetEditReason(
      editReason,
      setEditReason,
      true
    );
    allValid = !editReasonMsg ? false : allValid;

    if (allValid) {
      // Convert the datetime that was input with user's timezone to UTC timezone
      const updatedTShirt = {} as any;
      Object.keys(values).forEach((key: string) => {
        // This field had to be optional
        if (values[key] === "") {
          updatedTShirt[key] = undefined;
        } else {
          updatedTShirt[key] = values[key];
        }
      });
      onSubmit(updatedTShirt, row!, resetForm);
    }
  };

  const handleUpdateNumberField = (
    key: string,
    newValue: number,
    hasError: boolean
  ) => {
    let newErrMap = new Map(errorMap);
    if (!hasError) {
      setValues({ ...values, [key]: newValue });
      newErrMap.set(key, "");
    } else {
      newErrMap.set(key, "some error");
    }
    setErrorMap(newErrMap);
  };

  const getFormField = (column: MRT_ColumnDef<TShirt>) => {
    const errMsg = errorMap.get(column.accessorKey as string);
    const hasError = errMsg !== "" && errMsg !== undefined;
    const colInfo = columnInfo.get(column.accessorKey);

    if (colInfo?.isNumberField) {
      return (
        <NumberInput
          key={column.header}
          name={column.accessorKey as string}
          label={column.header}
          initialValue={values[column.accessorKey as string]}
          onChange={(newValue: number, hasError: boolean) =>
            handleUpdateNumberField(
              column.accessorKey as string,
              newValue,
              hasError
            )
          }
          isValidFn={(newValue: number) => {
            let errMsg = "";
            if (newValue < 0) {
              errMsg = "Value cannot be negative";
            }
            let newErrMap = new Map(errorMap);
            newErrMap.set(column.accessorKey as string, errMsg);
            setErrorMap(newErrMap);
            return errMsg;
          }}
        />
      );
    }
    return (
      <TextField
        select={colInfo?.selectFields !== undefined}
        key={column.accessorKey as React.Key}
        label={column.header}
        name={column.accessorKey as string}
        onChange={(e: any) =>
          setValues({ ...values, [e.target.name]: e.target.value })
        }
        disabled={colInfo?.disabledOnEdit === true}
        value={values[column.accessorKey as string]}
        required={colInfo?.isRequired}
        error={hasError}
        helperText={errMsg}
        placeholder={colInfo?.placeholderText}
        multiline={colInfo?.multilineTextInfo !== undefined}
        rows={colInfo?.multilineTextInfo?.numRows}
      >
        {/* Select field options */}
        {colInfo?.selectFields?.map((selectValue: SelectValue, idx: number) => (
          <MenuItem key={idx} value={selectValue.value}>
            {selectValue.label}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  return (
    <Dialog open={open} maxWidth="xs">
      <DialogTitle textAlign="center">Edit TShirt</DialogTitle>
      <DialogContent style={{ padding: "25px" }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: "100%",
              minWidth: { xs: "300px", sm: "360px", md: "400px" },
              gap: "1.5rem",
            }}
          >
            {/* Immutable field */}
            <TextField
              disabled
              label="Style Number"
              value={row ? row.original.styleNumber : ""}
            />

            {columns
              .filter((col) => columnInfo.get(col.accessorKey)?.isEditable)
              .map((column, index) => (
                <React.Fragment key={index}>
                  {getFormField(column)}
                </React.Fragment>
              ))}

            <FormControl>
              <EditReasonRadioGroup
                formState={editReason}
                setFormState={setEditReason}
                showMandatoryRadioButtons
              />
            </FormControl>

            <Grid container justifyContent={"space-between"}>
              <Grid item>
                <Button
                  color="error"
                  size="small"
                  variant="contained"
                  onClick={() => {
                    onClose();
                    resetForm();
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
                  fullWidth
                  onClick={() => {
                    handleSubmit();
                  }}
                  type="submit"
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditTShirtModal;
