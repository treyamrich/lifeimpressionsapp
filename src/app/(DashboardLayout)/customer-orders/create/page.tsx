"use client";

import React from "react";
import {
  DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";
import {
  initialCustomerOrderFormState,
  getTableColumns,
  columnInfo
} from "../table-constants";
import { CustomerOrder } from "@/API";
import CreateOrderPage, { EntityType } from "../../components/po-customer-order-shared-components/CreateOrderPage";
import { createOrderTransactionAPI } from "@/app/dynamodb-transactions/create-order-transaction";
import { useAuthContext } from "@/contexts/AuthContext";

const CreatePurchaseOrderPage = () => {
  const { user } = useAuthContext();
  const { rescueDBOperation } = useDBOperationContext();
  
  const handleCreateCustomerOrder = (co: CustomerOrder, callback: () => void) => {
    rescueDBOperation(
      () => createOrderTransactionAPI(co, EntityType.CustomerOrder, user),
      DBOperation.CREATE,
      (resp: any) => {
        callback();
      }
    )
    //Remove the fields from a standard customer order that isn't needed for creation
    // const coToCreate = {
    //   ...co,
    //   orderedItems: undefined,
    //   changeHistory: undefined,
    // };
    // rescueDBOperation(
    //   () => createCustomerOrderAPI(coToCreate as CreateCustomerOrderInput),
    //   DBOperation.CREATE,
    //   (resp: CustomerOrder) => {
    //     // Important to use the original CO since it has the orderedItems field
    //     createTShirtOrders(
    //       resp,
    //       co.orderedItems as unknown as TShirtOrder[]
    //     );
    //   }
    // );
  };
  return (
  <CreateOrderPage 
    entityType={EntityType.CustomerOrder}
    initialOrderFormState={initialCustomerOrderFormState}
    columnInfo={columnInfo}
    getTableColumns={getTableColumns}
    handleCreateOrder={handleCreateCustomerOrder}
  />
)};

export default CreatePurchaseOrderPage;