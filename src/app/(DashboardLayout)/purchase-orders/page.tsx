"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { PurchaseOrder } from "@/API";
import React, { useEffect, useMemo, useState, useCallback, SetStateAction } from "react";
import { useRouter } from 'next/navigation';
import { Delete, Edit } from "@mui/icons-material";
import { listPurchaseOrderAPI } from "@/app/graphql-helpers/fetch-apis";
import { updatePurchaseOrderAPI } from "@/app/graphql-helpers/update-apis";
import { toReadableDateTime } from "@/utils/datetimeConversions";

import {
  type DBOperationError,
  defaultDBOperationError,
  rescueDBOperation,
  DBOperation,
} from "@/app/graphql-helpers/graphql-errors";
import {
  tablePrimaryKey,
  entityName,
  getTableColumns,
} from "./table-constants";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_ColumnFiltersState,
} from "material-react-table";
import OrderViewAddPage from "../components/order-view-add-page/OrderViewAddPage";

const PurchaseOrders = () => {
  const { push } = useRouter();
  const [tableData, setTableData] = useState<PurchaseOrder[]>([]);

  const handleRowClick = (row: MRT_Row<PurchaseOrder>) => {
    const poId = row.getValue('id')
    push(`purchase-orders/view/${poId}`);
  }
  const handleAddRow = () => push('/purchase-orders/create');
  const handleDeleteRow = (row: MRT_Row<PurchaseOrder>, setDBOperationError: React.Dispatch<SetStateAction<DBOperationError>>) => {
    const deletedPurchaseOrder = { ...row.original, isDeleted: true };
      rescueDBOperation(
        () => updatePurchaseOrderAPI(deletedPurchaseOrder),
        setDBOperationError,
        DBOperation.DELETE,
        () => {
          tableData.splice(row.index, 1);
          setTableData([...tableData]);
        }
      );
  }
  const handleFetchPurchaseOrders = (setDBOperationError: React.Dispatch<SetStateAction<DBOperationError>>) => {
    rescueDBOperation(
      () => listPurchaseOrderAPI({}),
      setDBOperationError,
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
      tablePrimaryKey={tablePrimaryKey}
      entityName={entityName}
      getTableColumns={getTableColumns}
    />
  )
}

export default PurchaseOrders;