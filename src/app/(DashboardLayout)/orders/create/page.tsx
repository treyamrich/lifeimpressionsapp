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
import { CreateCustomerOrderInput, CustomerOrder, TShirtOrder } from "@/API";
import {
    createCustomerOrderAPI,
} from "@/app/graphql-helpers/create-apis";
import CreateOrderPage, { EntityType } from "../../components/po-customer-order-shared-components/CreateOrderPage";

const CreatePurchaseOrderPage = () => {
  const { rescueDBOperation } = useDBOperationContext();
  
  const handleCreateCustomerOrder = (co: CustomerOrder, createTShirtOrders: (order: CustomerOrder, orderedItems: TShirtOrder[]) => void) => {
    //Remove the fields from a standard customer order that isn't needed for creation
    const coToCreate = {
      ...co,
      orderedItems: undefined,
      changeHistory: undefined,
    };
    rescueDBOperation(
      () => createCustomerOrderAPI(coToCreate as CreateCustomerOrderInput),
      DBOperation.CREATE,
      (resp: CustomerOrder) => {
        // Important to use the original CO since it has the orderedItems field
        createTShirtOrders(
          resp,
          co.orderedItems as unknown as TShirtOrder[]
        );
      }
    );
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