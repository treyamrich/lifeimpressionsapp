"use client";

import { ModelSortDirection, PurchaseOrder } from "@/API";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { listPurchaseOrderAPI } from "@/graphql-helpers/list-apis";

import {
  columnInfo,
  getTableColumns,
} from "./table-constants";
import {
  type MRT_Row,
} from "material-react-table";
import OrderViewAddPage from "../components/po-customer-order-shared-components/ViewOrdersPage";
import { EntityType } from "../components/po-customer-order-shared-components/CreateOrderPage";

const PurchaseOrders = () => {
  const { push } = useRouter();
  const [tableData, setTableData] = useState<PurchaseOrder[]>([]);

  const handleRowClick = (row: MRT_Row<PurchaseOrder>) => {
    const poId = row.getValue('id')
    push(`/purchase-orders/view/${poId}`);
  }
  const handleAddRow = () => push('/purchase-orders/create');

  const fetchPurchaseOrdersPaginationFn = (
    nextToken: string | null | undefined
  ) => {
    const deletedFilter = { isDeleted: { ne: true } };
    return listPurchaseOrderAPI({
      filters: deletedFilter,
      nextToken: nextToken,
      sortDirection: ModelSortDirection.DESC,
    });
  };

  return (
    <OrderViewAddPage 
      tableData={tableData}
      setTableData={setTableData}
      onRowClick={handleRowClick}
      onAddRow={handleAddRow}
      pageTitle="Purchase Orders"
      entityType={EntityType.PurchaseOrder}
      getTableColumns={getTableColumns}
      columnInfo={columnInfo}

      fetchOrdersPaginationFn={fetchPurchaseOrdersPaginationFn}
    />
  )
}

export default PurchaseOrders;