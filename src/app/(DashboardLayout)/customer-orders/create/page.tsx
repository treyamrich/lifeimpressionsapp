"use client";

import React, { useState } from "react";
import {
  DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";
import {
  getTableColumns,
  columnInfo,
  getInitialCustomerOrderFormState,
  CreateCustomerOrderMoneyAwareForm
} from "../table-constants";
import CreateOrderPage, { EntityType } from "../../components/po-customer-order-shared-components/CreateOrderPage";
import { createOrderTransactionAPI } from "@/dynamodb-transactions/create-order-transaction";
import { useAuthContext } from "@/contexts/AuthContext";
import NegativeInventoryConfirmPopup from "../../components/forms/confirm-popup/NegativeInventoryConfirmPopup";
import { TShirt } from "@/API";

type NegativeInventoryWarningState = {
  show: boolean;
  callback: () => void;
  customerOrder: CreateCustomerOrderMoneyAwareForm;
  failedTShirts: TShirt[];
}
const initialNegativeInventoryWarningState = {
  show: false,
  callback: () => { },
  customerOrder: {} as CreateCustomerOrderMoneyAwareForm,
  failedTShirts: []
};

const CreateCustomerOrderPage = () => {
  const { user, refreshSession } = useAuthContext();
  const { rescueDBOperation } = useDBOperationContext();
  const [negativeInventoryWarning, setNegativeInventoryWarning] = useState<NegativeInventoryWarningState>({...initialNegativeInventoryWarningState});

  const handleCreateCustomerOrder = (formValues: CreateCustomerOrderMoneyAwareForm, callback: () => void, allowNegativeInventory: boolean = false) => {
    rescueDBOperation(
      () => createOrderTransactionAPI(formValues, EntityType.CustomerOrder, user, allowNegativeInventory, refreshSession),
      DBOperation.CREATE,
      (resp: TShirt[]) => {
        if (resp.length > 0) {
          setNegativeInventoryWarning({
            customerOrder: formValues,
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