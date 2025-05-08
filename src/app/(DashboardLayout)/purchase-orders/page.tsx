"use client";

import { ModelSortDirection, PurchaseOrder } from "@/API";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';

import {
  columnInfo,
  getTableColumns,
} from "./table-constants";
import {
  type MRT_Row,
  type MRT_ColumnFiltersState
} from "material-react-table";
import OrderViewAddPage from "../components/po-customer-order-shared-components/ViewOrdersPage";
import { useListPurchaseOrder } from "@/api/hooks/list-hooks";
import { usePagination } from "@/hooks/use-pagination";

const uiPageSize = 20;
const fetchPageSize = 100;

const PurchaseOrders = () => {
  const { push } = useRouter();
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );

  const handleRowClick = (row: MRT_Row<PurchaseOrder>) => {
    const poId = row.getValue('id')
    push(`/purchase-orders/view/${poId}`);
  }
  const handleAddRow = () => push('/purchase-orders/create');

  const usePaginationReturn = usePagination<PurchaseOrder>({
    query: () => useListPurchaseOrder({
      filters: { isDeleted: { ne: true } },
      sortDirection: ModelSortDirection.DESC,
      limit: fetchPageSize,
    }),
    pageSize: uiPageSize,
  });

  return (
    <OrderViewAddPage 
      usePaginationReturn={usePaginationReturn}
      pageSize={uiPageSize}
      onRowClick={handleRowClick}
      onAddRow={handleAddRow}
      pageTitle="Purchase Orders"
      getTableColumns={getTableColumns}
      columnInfo={columnInfo}
      columnFiltersState={{ columnFilters, setColumnFilters }}
    />
  )
}

export default PurchaseOrders;