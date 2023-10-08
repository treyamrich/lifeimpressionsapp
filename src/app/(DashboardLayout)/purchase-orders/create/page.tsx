"use client";

import React from "react";
import {
  DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";
import {
  initialPurchaseOrderFormState,
  excludeOnCreateFields,
  selectInputFields,
  getTableColumns,
  isRequiredField,
  isSelectInputField
} from "../table-constants";
import { PurchaseOrder, TShirtOrder } from "@/API";
import {
  createPurchaseOrderAPI,
} from "@/app/graphql-helpers/create-apis";
import CreateOrderPage, { EntityType } from "../../components/po-customer-order-shared-components/CreateOrderPage";

const CreatePurchaseOrderPage = () => {
  const { rescueDBOperation } = useDBOperationContext();
  
  const handleCreatePO = (po: PurchaseOrder, createTShirtOrders: (order: PurchaseOrder, orderedItems: TShirtOrder[]) => void) => {
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
        createTShirtOrders(
          resp,
          po.orderedItems as unknown as TShirtOrder[]
        );
      }
    );
  };
  return (
  <CreateOrderPage 
    entityType={EntityType.PurchaseOrder}
    initialOrderFormState={initialPurchaseOrderFormState}
    getTableColumns={getTableColumns}
    isRequiredField={isRequiredField}
    excludeOnCreateFields={excludeOnCreateFields}
    isSelectInputField={isSelectInputField}
    selectInputFields={selectInputFields}
    handleCreateOrder={handleCreatePO}
  />
)};

export default CreatePurchaseOrderPage;