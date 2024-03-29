"use client";

import React, { useState } from "react";
import {
  DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";
import {
  getTableColumns,
  columnInfo,
  getInitialCustomerOrderFormState
} from "../table-constants";
import { CustomerOrder } from "@/API";
import CreateOrderPage, { EntityType } from "../../components/po-customer-order-shared-components/CreateOrderPage";
import { createOrderTransactionAPI } from "@/dynamodb-transactions/create-order-transaction";
import { useAuthContext } from "@/contexts/AuthContext";
import NegativeInventoryConfirmPopup from "../../components/forms/confirm-popup/NegativeInventoryConfirmPopup";

type NegativeInventoryWarningState = {
  show: boolean;
  callback: () => void;
  customerOrder: CustomerOrder;
  failedTShirts: string[];
}
const initialNegativeInventoryWarningState = {
  show: false,
  callback: () => { },
  customerOrder: {} as CustomerOrder,
  failedTShirts: []
};

const CreateCustomerOrderPage = () => {
  const { user, refreshSession } = useAuthContext();
  const { rescueDBOperation } = useDBOperationContext();
  const [negativeInventoryWarning, setNegativeInventoryWarning] = useState<NegativeInventoryWarningState>({...initialNegativeInventoryWarningState});

  const handleCreateCustomerOrder = (co: CustomerOrder, callback: () => void, allowNegativeInventory: boolean = false) => {
    rescueDBOperation(
      () => createOrderTransactionAPI(co, EntityType.CustomerOrder, user, allowNegativeInventory, refreshSession),
      DBOperation.CREATE,
      (resp: string[]) => {
        if (resp.length > 0) {
          setNegativeInventoryWarning({
            customerOrder: co,
            show: true,
            callback: callback,
            failedTShirts: resp
          });
          return;
        }
        callback();
      }
    )
  };
  return (
    <>
      <NegativeInventoryConfirmPopup
        open={negativeInventoryWarning.show}
        onClose={() => setNegativeInventoryWarning({ ...negativeInventoryWarning, show: false })}
        onSubmit={() => {
          handleCreateCustomerOrder(negativeInventoryWarning.customerOrder, negativeInventoryWarning.callback, true);
          setNegativeInventoryWarning({...initialNegativeInventoryWarningState});
        }}
        failedTShirts={negativeInventoryWarning.failedTShirts}
      />
      <CreateOrderPage
        entityType={EntityType.CustomerOrder}
        getInitialFormState={getInitialCustomerOrderFormState}
        columnInfo={columnInfo}
        getTableColumns={getTableColumns}
        handleCreateOrder={handleCreateCustomerOrder}
      />

    </>
  )
};

export default CreateCustomerOrderPage;