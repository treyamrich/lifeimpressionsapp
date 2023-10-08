"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import React, { useMemo, useState } from "react";
import {
  rescueDBOperation,
  DBOperation,
} from "@/app/graphql-helpers/graphql-errors";
import { Alert, TextField, Stack, MenuItem, Box, Button } from "@mui/material";
import {
  initialPurchaseOrderFormState,
  excludeOnCreateFields,
  selectInputFields,
  type SelectValue,
  getInitialPurchaseOrderFormErrorMap,
  getTableColumns,
  isRequiredField,
} from "../table-constants";
import { MRT_ColumnDef } from "material-react-table";
import { PurchaseOrder, TShirtOrder } from "@/API";
import TShirtOrderTable from "../../components/tshirt-order-table/TShirtOrderTable";
import {
  createPurchaseOrderAPI,
  createTShirtOrderAPI,
} from "@/app/graphql-helpers/create-apis";
import ConfirmPopup from "../../components/forms/confirm-popup/ConfirmPopup";
import { useRouter } from "next/navigation";

const CreatePurchaseOrderPage = () => (
  <PageContainer
    title="New Purchase Order"
    description="this is New Purchase Order page"
  >
    <DashboardCard title="New Purchase Order">
      <CreatePurchaseOrderForm />
    </DashboardCard>
  </PageContainer>
);

export default CreatePurchaseOrderPage;

const CreatePurchaseOrderForm = () => {
  const { push } = useRouter();
  const [values, setValues] = useState<any>(() => {
    return { ...initialPurchaseOrderFormState };
  });
  const [errorMap, setErrorMap] = useState(
    () =>
      new Map<string, string>(
        Object.keys(initialPurchaseOrderFormState).map((key) => [key, ""])
      )
  );
  const [showContinue, setShowContinue] = useState<boolean>(false);

  const resetForm = () => {
    setValues({ ...initialPurchaseOrderFormState });
    setErrorMap(getInitialPurchaseOrderFormErrorMap());
  };

  const handleCreateTShirtOrders = (
    po: PurchaseOrder,
    orderedItems: TShirtOrder[]
  ) => {
    rescueDBOperation(
      () => createTShirtOrderAPI(po, orderedItems),
      DBOperation.CREATE,
      () => {
        // All operations (create PO and all TShirtOrders) were a success
        setShowContinue(true);
        resetForm();
      }
    );
  };
  const handleCreatePO = (po: PurchaseOrder) => {
    //Remove the fields from a standard PO that isn't needed for creation
    const poToCreate = {
      ...po,
      orderedItems: undefined,
      changeHistory: undefined,
    };
    rescueDBOperation(
      () => createPurchaseOrderAPI(poToCreate),
      DBOperation.CREATE,
      (resp: PurchaseOrder) => {
        // Important to use the original PO since it has the orderedItems field
        handleCreateTShirtOrders(
          resp,
          po.orderedItems as unknown as TShirtOrder[]
        );
      }
    );
  };
  const handleSubmit = () => {
    //Validate input
    const newErrors = new Map<string, string>(errorMap);
    let allValid = true;
    Object.keys(values).forEach((key) => {
      let errMsg = "";
      let value = values[key];
      if (isRequiredField(key) && value.toString().length < 1) {
        errMsg = "Field is required";
      }
      newErrors.set(key, errMsg);
      allValid = allValid && errMsg === "";
    });
    setErrorMap(newErrors);

    if (allValid) {
      handleCreatePO(values);
    }
  };

  const columns = useMemo<MRT_ColumnDef<PurchaseOrder>[]>(
    () => getTableColumns(),
    []
  );

  return (
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
            (col) => !excludeOnCreateFields.includes(col.accessorKey as string)
          )
          .map((column) => (
            <TextField
              select={isSelectInputField(column.accessorKey)}
              key={column.accessorKey as React.Key}
              label={column.header}
              name={column.accessorKey as string}
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }
              value={values[column.accessorKey as string]}
              required={isRequiredField(column.accessorKey as string)}
              error={errorMap.get(column.accessorKey as string) !== ""}
              helperText={errorMap.get(column.accessorKey as string)}
            >
              {isSelectInputField(column.accessorKey) &&
                selectInputFields
                  .get(column.accessorKey)
                  ?.map((selectValue: SelectValue, idx: number) => (
                    <MenuItem key={idx} value={selectValue.value}>
                      {selectValue.label}
                    </MenuItem>
                  ))}
            </TextField>
          ))}
        <TShirtOrderTable
          tableData={values.orderedItems}
          setTableData={(newValues) =>
            setValues({ ...values, orderedItems: newValues })
          }
          parentOrderId={undefined}
          onRowEdit={() => { }}
          onRowAdd={() => { }}
        />
        <Box>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSubmit}
            type="submit"
          >
            Submit
          </Button>
        </Box>

        <ConfirmPopup
          confirmationMsg="Your purchase order was created. Would you like to continue creating purchase orders?"
          submitButtonMsg="Yes"
          cancelButtonMsg="No"
          title="Continue Creating Purchase Orders?"
          onClose={() => {
            setShowContinue(false);
            push("/purchase-orders");
          }}
          onSubmit={() => setShowContinue(false)}
          open={showContinue}
        />
      </Stack>
    </form>
  );
};

const isSelectInputField = (
  fieldName: string | number | symbol | undefined
) => {
  let nameOfField = fieldName ? fieldName.toString() : "";
  return selectInputFields.has(nameOfField);
};
