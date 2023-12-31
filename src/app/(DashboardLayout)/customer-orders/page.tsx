"use client";

import { CustomerOrder, CustomerOrderStatus, ModelSortDirection } from "@/API";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { listCustomerOrderAPI } from "@/graphql-helpers/fetch-apis";
import { toReadableDateTime } from "@/utils/datetimeConversions";

import {
  DBOperation, useDBOperationContext,
} from "@/contexts/DBErrorContext";
import {
    columnInfo,
  entityName,
  getTableColumns,
  orderStatusMap,
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
    push(`/customer-orders/view/${orderId}`);
  }
  const handleAddRow = () => push('/customer-orders/create');
  const handleFetchCustomerOrders = () => {
    const deletedFilter = { isDeleted: { ne: true } };
    rescueDBOperation(
      () => listCustomerOrderAPI(deletedFilter, ModelSortDirection.DESC),
      DBOperation.LIST,
      (resp: CustomerOrder[]) => {
        setTableData(
          resp.map((order: CustomerOrder) => {
            return {
              ...order,
              updatedAt: toReadableDateTime(order.updatedAt),
              createdAt: toReadableDateTime(order.createdAt),
              dateNeededBy: toReadableDateTime(order.dateNeededBy ? order.dateNeededBy : ""),
              orderStatus: orderStatusMap[order.orderStatus] as CustomerOrderStatus
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
      columnInfo={columnInfo}
    />
  )
}

export default CustomerOrders;