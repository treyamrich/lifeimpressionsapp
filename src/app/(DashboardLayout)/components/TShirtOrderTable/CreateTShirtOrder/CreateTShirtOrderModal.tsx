"use client";

import { useState, useEffect } from "react";
import {
  TShirtOrderFields,
  columnInfo,
  floatInputFields,
  getInitialTShirtOrderFormErrorMap,
  initialTShirtOrderFormState,
  modalTitle,
  numberInputFields,
} from "../table-constants";
import {
  Button,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { CreateOrderChangeInput, TShirt } from "@/API";
import { MRT_ColumnDef } from "material-react-table";
import TShirtPicker from "./TShirtPicker";
import BlankCard from "../../shared/BlankCard";
import { EntityType } from "../../po-customer-order-shared-components/CreateOrderPage";
import NumberInput from "../../inputs/NumberInput";

interface CreateTShirtOrderModalProps<TShirtOrder extends Record<string, any>> {
  columns: MRT_ColumnDef<TShirtOrder>[];
  onClose: () => void;
  onSubmit: (values: TShirtOrder, createOrderChangeInput: CreateOrderChangeInput, callback: () => void) => void;
  open: boolean;
  tshirtChoices: TShirt[];
  tableData: TShirtOrder[];
  entityType: EntityType;
  parentOrderId: string | undefined;
}

const CreateTShirtOrderModal = <TShirtOrder extends Record<string, any>>({
  open,
  columns,
  onClose,
  onSubmit,
  tshirtChoices,
  tableData,
  entityType,
  parentOrderId,
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
    const newErrors = new Map(errorMap);
    let allValid = true;

    if (values.tshirt === null && errorMap.get('tshirt') === '') {
      newErrors.set('tshirt', "T-Shirt details incomplete");
      setErrorMap(newErrors);
      // Preserve existing error message if exists
    }

    Object.keys(values).forEach((key) => {
      allValid = allValid && newErrors.get(key) === "";
    });

    setValues({ ...values }); // Values might've updated
    setErrorMap(newErrors);
    if (allValid) {
      const createOrderChangeInput: CreateOrderChangeInput = {
        reason: "Added new tshirt to purchase order",
        fieldChanges: [
          { fieldName: TShirtOrderFields.Qty, oldValue: "-", newValue: values[TShirtOrderFields.Qty].toString() },
          { fieldName: TShirtOrderFields.CostPerUnit, oldValue: "-", newValue: values[TShirtOrderFields.CostPerUnit].toString() },
          { fieldName: TShirtOrderFields.Discount, oldValue: "-", newValue: values[TShirtOrderFields.Discount].toString() }
        ],
        orderChangeTshirtId: values.tshirt.id,
        [`${entityType === EntityType.PurchaseOrder ? "purchase" : "customer"}OrderChangeHistoryId`]: parentOrderId,
      };
      if (entityType === EntityType.PurchaseOrder) {
        createOrderChangeInput.fieldChanges.push({
          fieldName: TShirtOrderFields.AmtReceived, oldValue: "-", newValue: values[TShirtOrderFields.AmtReceived].toString()
        })
      }

      onSubmit(
        values,
        createOrderChangeInput,
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
      setValues({ ...values, tshirt: newShirt, tShirtOrderTshirtId: newShirt?.id });
    }
    setErrorMap(newErrorMap);
  }

  const handleUpdateNumberField = (key: string, newValue: number, hasError: boolean) => {
    let newErrMap = new Map(errorMap);
    if (!hasError) {
      setValues({ ...values, [key]: newValue });
      newErrMap.set(key, '');
    } else {
      newErrMap.set(key, 'some error');
    }
    setErrorMap(newErrMap);
  }

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">{modalTitle}</DialogTitle>
      <DialogContent style={{ paddingLeft: "25px", paddingRight: "25px" }}>
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
                  TShirt Details
                </Typography>

                <TShirtPicker
                  choices={tshirtChoices}
                  onChange={handleUpdateTShirt}
                  errorMessage={errorMap.get('tshirt')}
                />
              </CardContent>
            </BlankCard>

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
                    .filter(col => !columnInfo.get(col.accessorKey)?.excludeOnCreate)
                    .map((column, idx) => (
                      <NumberInput
                        key={idx}
                        name={column.accessorKey as string}
                        label={column.header}
                        initialValue={values[column.accessorKey]}
                        isFloat={columnInfo.get(column.accessorKey)?.isFloatField}
                        onChange={(newValue: number, hasError: boolean) =>
                          handleUpdateNumberField(column.accessorKey as string, newValue, hasError)
                        }
                        isValidFn={(newValue: number) => {
                          let errMsg = "";
                          if (column.accessorKey === TShirtOrderFields.Qty && newValue <= 0) {
                            errMsg = "Number must be positive";
                          } else if (column.accessorKey === TShirtOrderFields.Discount && newValue < 0) {
                            errMsg = "Discount cannot be negative";
                          } else if (column.accessorKey === TShirtOrderFields.CostPerUnit && newValue < 0) {
                            errMsg = "Cost cannot be negative";
                          }
                          let newErrMap = new Map(errorMap);
                          newErrMap.set(column.accessorKey as string, errMsg);
                          setErrorMap(newErrMap)
                          return errMsg;
                        }}
                      />
                    ))}
                </Stack>
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