"use client";

import { CustomerOrder, CustomerOrderStatus, ModelSortDirection } from "@/API";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { listCustomerOrderAPI } from "@/graphql-helpers/fetch-apis";

import {
  columnInfo,
  entityName,
  getTableColumns,
  coStatusToHeaderMap,
} from "./table-constants";
import { type MRT_Row } from "material-react-table";
import OrderViewAddPage from "../components/po-customer-order-shared-components/ViewOrdersPage";

const CustomerOrders = () => {
  const { push } = useRouter();
  const [tableData, setTableData] = useState<CustomerOrder[]>([]);

  const handleRowClick = (row: MRT_Row<CustomerOrder>) => {
    const orderId = row.getValue("id");
    push(`/customer-orders/view/${orderId}`);
  };
  const handleAddRow = () => push("/customer-orders/create");

  const fetchCustomerOrdersPaginationFn = (
    nextToken: string | null | undefined
  ) => {
    const deletedFilter = { isDeleted: { ne: true } };
    return listCustomerOrderAPI({
      filters: deletedFilter,
      nextToken: nextToken,
      sortDirection: ModelSortDirection.DESC,
    });
  };

  const fetchedCOTransformerFn = (order: CustomerOrder) => {
    return {
      ...order,
      orderStatus: coStatusToHeaderMap[
        order.orderStatus
      ] as CustomerOrderStatus,
    };
  }
  
  return (

    <OrderViewAddPage
      tableData={tableData}
      setTableData={setTableData}
      onRowClick={handleRowClick}
      onAddRow={handleAddRow}
      pageTitle="Customer Orders"
      entityName={entityName}
      getTableColumns={getTableColumns}
      columnInfo={columnInfo}

      fetchOrdersPaginationFn={fetchCustomerOrdersPaginationFn}
      fetchedItemTransformerFn={fetchedCOTransformerFn}
    />
  );
};

export default CustomerOrders;
