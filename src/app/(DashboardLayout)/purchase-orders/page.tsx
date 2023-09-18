"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { PurchaseOrder } from "@/API";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Delete, Edit } from "@mui/icons-material";
import { createPurchaseOrderAPI } from "@/app/graphql-helpers/create-apis";
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
  type MaterialReactTableProps,
  type MRT_ColumnDef,
  type MRT_Cell,
  type MRT_Row,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";
import { listPurchaseOrders } from "@/graphql/queries";

const PurchaseOrders = () => {
  const { push } = useRouter();
  const [tableData, setTableData] = useState<PurchaseOrder[]>([]);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [dbOperationError, setDBOperationError] = useState({
    ...defaultDBOperationError,
  } as DBOperationError);

  const handleCreateNewRow = (values: PurchaseOrder) => {
    rescueDBOperation(
      () => createPurchaseOrderAPI(values),
      setDBOperationError,
      DBOperation.CREATE,
      (resp: PurchaseOrder) => setTableData([...tableData, resp])
    );
  };

  const handleDeleteRow = useCallback(
    (row: MRT_Row<PurchaseOrder>) => {
      if (
        !confirm(
          `Are you sure you want to delete ${row.getValue(tablePrimaryKey)}`
        )
      ) {
        return;
      }
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
    },
    [tableData]
  );

  const columns = useMemo<MRT_ColumnDef<PurchaseOrder>[]>(
    () => getTableColumns(),
    []
  );

  const fetchPurchaseOrders = () => {
    console.log(listPurchaseOrders);
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
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);
  return (
    <PageContainer title="Purchase Orders" description="this is Purchase Orders page">
      {dbOperationError.errorMessage !== undefined ? (
        <Alert
          severity="error"
          onClose={() => setDBOperationError({ ...defaultDBOperationError })}
        >
          {dbOperationError.errorMessage}
        </Alert>
      ) : (
        <></>
      )}
      <DashboardCard title="Purchase Orders">
        <>
          <MaterialReactTable
            displayColumnDefOptions={{
              "mrt-row-actions": {
                muiTableHeadCellProps: {
                  align: "center",
                },
                size: 120,
              },
            }}
            columns={columns}
            data={tableData}
            initialState={{ showColumnFilters: true }}
            editingMode="modal" //default
            enableColumnOrdering
            enableHiding={false}
            onColumnFiltersChange={setColumnFilters}
            state={{
              columnFilters,
            }}
            renderRowActions={({ row, table }) => (
              <Box sx={{ display: "flex", gap: "1rem" }}>
                <Tooltip arrow placement="left" title="Edit">
                  <IconButton onClick={() => table.setEditingRow(row)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip arrow placement="right" title="Delete">
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteRow(row)}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            renderTopToolbarCustomActions={() => (
              <Button
                color="secondary"
                onClick={() => push('/purchase-orders/create')}
                variant="contained"
              >
                Create New {entityName}
              </Button>
            )}
          />
        </>
      </DashboardCard>
    </PageContainer>
  );
};

export default PurchaseOrders;