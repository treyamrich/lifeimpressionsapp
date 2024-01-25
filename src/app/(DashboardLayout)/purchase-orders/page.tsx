"use client";

import { ModelSortDirection, PurchaseOrder } from "@/API";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { listPurchaseOrderAPI } from "@/graphql-helpers/fetch-apis";

import {
  columnInfo,
  entityName,
  getTableColumns,
} from "./table-constants";
import {
  type MRT_Row,
} from "material-react-table";
import OrderViewAddPage from "../components/po-customer-order-shared-components/ViewOrdersPage";
import { useDBOperationContext, DBOperation } from "@/contexts/DBErrorContext";

const PurchaseOrders = () => {
  const { rescueDBOperation } = useDBOperationContext();
  const { push } = useRouter();
  const [tableData, setTableData] = useState<PurchaseOrder[]>([]);

  const handleRowClick = (row: MRT_Row<PurchaseOrder>) => {
    const poId = row.getValue('id')
    push(`/purchase-orders/view/${poId}`);
  }
  const handleAddRow = () => push('/purchase-orders/create');
  const handleFetchPurchaseOrders = () => {
    const deletedFilter = { isDeleted: { ne: true } };
    rescueDBOperation(
      () => listPurchaseOrderAPI(deletedFilter, ModelSortDirection.DESC),
      DBOperation.LIST,
      (resp: PurchaseOrder[]) => {
        setTableData(resp);
      }
    );
  }
  return (
    <OrderViewAddPage 
      tableData={tableData}
      onRowClick={handleRowClick}
      onAddRow={handleAddRow}
      onFetchTableData={handleFetchPurchaseOrders}
      pageTitle="Purchase Orders"
      entityName={entityName}
      getTableColumns={getTableColumns}
      columnInfo={columnInfo}
    />
  )
}

export default PurchaseOrders;