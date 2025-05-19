"use client";

import React from "react";
import {
  DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";
import {
  getInitialPurchaseOrderState,
  getTableColumns,
  columnInfo,
  CreatePurchaseOrderMoneyAwareForm,
} from "../table-constants";
import { PurchaseOrder } from "@/API";
import CreateOrderPage, { EntityType } from "../../components/po-customer-order-shared-components/CreateOrderPage";
import { createOrderTransactionAPI } from "@/dynamodb-transactions/create-order-transaction";
import { useAuthContext } from "@/contexts/AuthContext";
import { toAWSDateTime } from "@/utils/datetimeConversions";

const CreatePurchaseOrderPage = () => {
  const { user, refreshSession } = useAuthContext();
  const { rescueDBOperation } = useDBOperationContext();
  
  const handleCreatePurchaseOrder = (formValues: CreatePurchaseOrderMoneyAwareForm, callback: () => void) => {
    rescueDBOperation(
      () => createOrderTransactionAPI(formValues, EntityType.PurchaseOrder, user, false, refreshSession),
      DBOperation.CREATE,
      (resp: any) => {
        callback();
      }
    )
  };
  return (
  <CreateOrderPage 
    entityType={EntityType.PurchaseOrder}
    getInitialFormState={getInitialPurchaseOrderState}
    getTableColumns={getTableColumns}
    columnInfo={columnInfo}
    handleCreateOrder={handleCreatePurchaseOrder}
  />
)};

export default CreatePurchaseOrderPage;