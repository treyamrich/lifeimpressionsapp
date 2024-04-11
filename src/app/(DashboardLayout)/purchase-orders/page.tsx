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
  type MRT_ColumnFiltersState
} from "material-react-table";
import OrderViewAddPage from "../components/po-customer-order-shared-components/ViewOrdersPage";
import { EntityType } from "../components/po-customer-order-shared-components/CreateOrderPage";

const PurchaseOrders = () => {
  const { push } = useRouter();
  const [tableData, setTableData] = useState<PurchaseOrder[]>([]);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );

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
      columnFiltersState={{ columnFilters, setColumnFilters }}
      fetchOrdersPaginationFn={fetchPurchaseOrdersPaginationFn}
    />
  )
}

export default PurchaseOrders;