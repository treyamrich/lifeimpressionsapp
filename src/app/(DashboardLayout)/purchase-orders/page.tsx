"use client";

import { PurchaseOrder } from "@/API";
import React, { useState, SetStateAction } from "react";
import { useRouter } from 'next/navigation';
import { listPurchaseOrderAPI } from "@/app/graphql-helpers/fetch-apis";
import { toReadableDateTime } from "@/utils/datetimeConversions";
import {
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
    push(`purchase-orders/view/${poId}`);
  }
  const handleAddRow = () => push('/purchase-orders/create');
  const handleFetchPurchaseOrders = () => {
    const deletedFilter = { isDeleted: { ne: true } };
    rescueDBOperation(
      () => listPurchaseOrderAPI(deletedFilter),
      DBOperation.LIST,
      (resp: PurchaseOrder[]) => {
        setTableData(
          resp.map((po: PurchaseOrder) => {
            return {
              ...po,
              updatedAt: toReadableDateTime(po.updatedAt),
              createdAt: toReadableDateTime(po.createdAt)
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
      onFetchTableData={handleFetchPurchaseOrders}
      pageTitle="Purchase Orders"
      entityName={entityName}
      getTableColumns={getTableColumns}
    />
  )
}

export default PurchaseOrders;