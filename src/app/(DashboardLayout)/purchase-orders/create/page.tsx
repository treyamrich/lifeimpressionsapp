"use client";

import React from "react";
import {
  DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";
import {
  initialPurchaseOrderFormState,
  getTableColumns,
  columnInfo,
} from "../table-constants";
import { PurchaseOrder } from "@/API";
import CreateOrderPage, { EntityType } from "../../components/po-customer-order-shared-components/CreateOrderPage";
import { createOrderTransactionAPI } from "@/app/dynamodb-transactions/create-order-transaction";
import { useAuthContext } from "@/contexts/AuthContext";

const CreatePurchaseOrderPage = () => {
  const { user } = useAuthContext();
  const { rescueDBOperation } = useDBOperationContext();
  
  const handleCreatePurchaseOrder = (po: PurchaseOrder, callback: () => void) => {
    rescueDBOperation(
      () => createOrderTransactionAPI(po, EntityType.PurchaseOrder, user, false),
      DBOperation.CREATE,
      (resp: any) => {
        callback();
      }
    )
  };
  
  // const handleCreatePO = (po: PurchaseOrder, createTShirtOrders: (order: PurchaseOrder, orderedItems: TShirtOrder[]) => void) => {
  //   //Remove the fields from a standard PO that isn't needed for creation
  //   const poToCreate = {
  //     ...po,
  //     orderedItems: undefined,
  //     changeHistory: undefined,
  //   };
  //   rescueDBOperation(
  //     () => createPurchaseOrderAPI(poToCreate),
  //     DBOperation.CREATE,
  //     (resp: PurchaseOrder) => {
  //       // Important to use the original PO since it has the orderedItems field
  //       createTShirtOrders(
  //         resp,
  //         po.orderedItems as unknown as TShirtOrder[]
  //       );
  //     }
  //   );
  // };
  return (
  <CreateOrderPage 
    entityType={EntityType.PurchaseOrder}
    initialOrderFormState={initialPurchaseOrderFormState}
    getTableColumns={getTableColumns}
    columnInfo={columnInfo}
    handleCreateOrder={handleCreatePurchaseOrder}
  />
)};

export default CreatePurchaseOrderPage;