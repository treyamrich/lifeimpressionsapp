"use client";

import React from "react";
import {
  DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";
import {
  getInitialPurchaseOrderState,
  getTableColumns,
  columnInfo,
} from "../table-constants";
import { PurchaseOrder } from "@/API";
import CreateOrderPage, { EntityType } from "../../components/po-customer-order-shared-components/CreateOrderPage";
import { createOrderTransactionAPI } from "@/dynamodb-transactions/create-order-transaction";
import { useAuthContext } from "@/contexts/AuthContext";

const CreatePurchaseOrderPage = () => {
  const { user, refreshSession } = useAuthContext();
  const { rescueDBOperation } = useDBOperationContext();
  
  const handleCreatePurchaseOrder = (po: PurchaseOrder, callback: () => void) => {
    rescueDBOperation(
      () => createOrderTransactionAPI(po, EntityType.PurchaseOrder, user, false, refreshSession),
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