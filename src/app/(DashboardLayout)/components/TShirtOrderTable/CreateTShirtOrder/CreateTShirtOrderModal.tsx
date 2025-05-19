"use client";

import { useState, useEffect } from "react";
import {
  TShirtOrderFields,
  TShirtOrderMoneyAwareForm,
  columnInfo,
  getInitialTShirtOrderFormErrorMap,
  initialTShirtOrderFormState,
  modalTitle,
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
import { CreateOrderChangeInput, TShirt, TShirtOrder } from "@/API";
import { MRT_ColumnDef } from "material-react-table";
import TShirtPicker from "./TShirtPicker";
import BlankCard from "../../shared/BlankCard";
import { EntityType } from "../../po-customer-order-shared-components/CreateOrderPage";
import NumberInput from "../../inputs/NumberInput";
import { toCents } from "@/utils/money";

interface CreateTShirtOrderModalProps {
  columns: MRT_ColumnDef<TShirtOrder>[];
  onClose: () => void;
  onSubmit: (values: TShirtOrderMoneyAwareForm, createOrderChangeInput: CreateOrderChangeInput, callback: () => void) => void;
  open: boolean;
  tshirtChoices: TShirt[];
  tableData: TShirtOrder[];
  entityType: EntityType;
  parentOrderId: string | undefined;
}

const CreateTShirtOrderModal = ({
  open,
  columns,
  onClose,
  onSubmit,
  tshirtChoices,
  tableData,
  entityType,
  parentOrderId,
}: CreateTShirtOrderModalProps) => {
  //Initial TShirtOrder values
  const [values, setValues] = useState<TShirtOrderMoneyAwareForm>(() => {
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
          { fieldName: TShirtOrderFields.CostPerUnitCents, oldValue: "-", newValue: values[TShirtOrderFields.CostPerUnitCents].toString() },
        ],
        orderChangeTshirtId: values.tshirt!.id,
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
      setValues({ ...values, tshirt: newShirt });
    }
    setErrorMap(newErrorMap);
  }

  const handleUpdateNumberField = (key: string, newValue: string, hasError: boolean) => {
    let newErrMap = new Map(errorMap);
    let parsedVal;
    if (key === TShirtOrderFields.CostPerUnitCents) {
      parsedVal = toCents(newValue)
    } else {
      parsedVal = parseInt(newValue, 10)
    }
    if (!hasError) {
      setValues({ ...values, [key]: parsedVal });
      newErrMap.set(key, '');
    } else {
      newErrMap.set(key, 'some error');
    }
    setErrorMap(newErrMap);
  }

  // Customer orders aren't concerned with cost/unit
  const filterOutCOCols = (col: MRT_ColumnDef<TShirtOrder>) => {
    return entityType === EntityType.PurchaseOrder ||
      entityType === EntityType.CustomerOrder &&
      col.accessorKey !== TShirtOrderFields.CostPerUnitCents
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
                    .filter(filterOutCOCols)
                    .map((column, idx) => (
                      <NumberInput
                        key={idx}
                        name={column.accessorKey as string}
                        label={column.header}
                        initialValue="0"
                        isFloat={columnInfo.get(column.accessorKey)?.isFloatField}
                        onChange={(newValue: string, hasError: boolean) => {
                          handleUpdateNumberField(column.accessorKey as string, newValue, hasError)
                        }}
                        isValidFn={(newValue: string) => {
                          let errMsg = "";
                          if (column.accessorKey === TShirtOrderFields.Qty && parseInt(newValue, 10) <= 0) {
                            errMsg = "Number must be positive";
                          } else if (column.accessorKey === TShirtOrderFields.CostPerUnitCents && parseFloat(newValue) < 0) {
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