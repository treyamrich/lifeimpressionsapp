"use client";

import { CustomerOrder } from "@/API";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { listCustomerOrderAPI } from "@/app/graphql-helpers/fetch-apis";
import { toReadableDateTime } from "@/utils/datetimeConversions";

import {
  DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";
import {
  entityName,
  getTableColumns,
} from "./table-constants";
import {
  type MRT_Row,
} from "material-react-table";
import OrderViewAddPage from "../components/po-customer-order-shared-components/ViewOrdersPage";

const CustomerOrders = () => {
  const { rescueDBOperation } = useDBOperationContext();
  const { push } = useRouter();
  const [tableData, setTableData] = useState<CustomerOrder[]>([]);

  const handleRowClick = (row: MRT_Row<CustomerOrder>) => {
    const orderId = row.getValue('id')
    push(`orders/view/${orderId}`);
  }
  const handleAddRow = () => push('/orders/create');
  const handleFetchCustomerOrders = () => {
    const deletedFilter = { isDeleted: { ne: true } };
    rescueDBOperation(
      () => listCustomerOrderAPI(deletedFilter),
      DBOperation.LIST,
      (resp: CustomerOrder[]) => {
        setTableData(
          resp.map((order: CustomerOrder) => {
            return {
              ...order,
              updatedAt: toReadableDateTime(order.updatedAt),
              createdAt: toReadableDateTime(order.createdAt)
            };
          })
        );
      }
    );
  }
  return (
    <OrderViewAddPage 
      tableData={tableData}
      onRowClick={handleRowClick}
      onAddRow={handleAddRow}
      onFetchTableData={handleFetchCustomerOrders}
      pageTitle="Customer Orders"
      entityName={entityName}
      getTableColumns={getTableColumns}
    />
  )
}

export default CustomerOrders;