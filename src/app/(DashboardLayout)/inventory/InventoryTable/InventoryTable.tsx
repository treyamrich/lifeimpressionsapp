"use client";

import { createTShirtAPI } from "@/graphql-helpers/create-apis";
import { updateTShirtAPI } from "@/graphql-helpers/update-apis";

import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";
import {
  tshirtPrimaryKey,
  entityName,
  getTableColumns,
  hiddenColumns,
} from "./table-constants";
import { CardContent, Stack, Typography } from "@mui/material";
import {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_ColumnFiltersState,
} from "material-react-table";
import CreateTShirtModal from "./CreateTShirtModal";
import TableToolbar from "../../components/Table/TableToolbar";
import TableInfoHeader from "../../components/Table/TableInfoHeader";
import EditTShirtModal from "./EditTShirtModal";
import TableRowActions from "../../components/Table/TableRowActions";
import {
  UpdateTShirtTransactionAPI,
  UpdateTShirtTransactionInput,
  UpdateTShirtTransactionResponse,
} from "@/dynamodb-transactions/update-tshirt-transaction";
import { useAuthContext } from "@/contexts/AuthContext";
import BlankCard from "../../components/shared/BlankCard";
import { CreateOrderChangeInput, TShirt } from "@/API";
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { downloadInventoryCSV, fetchAllNonDeletedTShirts } from "../util";
import {
  addTShirtMutation,
  deleteTShirtMutation,
  editTShirtMutation,
  prependOrderChangeHistory,
} from "@/api/hooks/mutations";
import { dummyOrderIdForInventoryAdjustment } from "../../components/po-customer-order-shared-components/OrderChangeHistory/OrderChangeHistory";
import { Page } from "@/api/types";
import { listTShirtBaseQueryKey, useListTShirt } from "@/api/hooks/list-hooks";
import { usePagination } from "@/hooks/use-pagination";
import { LRUCache } from "@/api/hooks/lru-cache";
import { queryClient } from "@/api/hooks/query-client";
import { MRTable } from "../../components/Table/MRTable";

type EditRowState = {
  showEditPopup: boolean;
  row: MRT_Row<TShirt> | undefined;
};

const uiPageSize = 20;
const fetchPageSize = 20;

const InventoryTable = () => {
  const { rescueDBOperation } = useDBOperationContext();
  const { user, refreshSession } = useAuthContext();
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editRowState, setEditRowState] = useState<EditRowState>({
    showEditPopup: false,
    row: undefined,
  });
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [styleNoFilter, setStyleNoFilter] = useState("");
  const resetStyleNoFilter = () => {
    setStyleNoFilter("");
    setColumnFilters((old) =>
      old.filter((filter) => filter.id !== "styleNumber")
    );
  };

  const lruCacheRef = useRef<LRUCache<string>>(
    new LRUCache<string>({
      name: "InventoryTable",
      maxSize: 3,
      onEviction: (evictedKey: string) => {
        queryClient.removeQueries({
          queryKey: [listTShirtBaseQueryKey, evictedKey],
        });
      },
    })
  );

  const {
    pagination,
    setPagination,
    currentPage,
    numRows,
    isLoading,
    disabledNextButton,
    error,
    normalizedPages,
  } = usePagination<TShirt>({
    query: () => useListTShirt(styleNoFilter, lruCacheRef.current, fetchPageSize),
    pageSize: uiPageSize,
  });

  const closeEditModal = () =>
    setEditRowState({ row: undefined, showEditPopup: false });

  const handleCreateNewRow = (value: TShirt) => {
    rescueDBOperation(
      () => createTShirtAPI(value),
      DBOperation.CREATE,
      (resp: TShirt) => {
        addTShirtMutation(value, lruCacheRef.current, resetStyleNoFilter);
      }
    );
  };

  const handleUpdateTShirt = (
    row: MRT_Row<TShirt>,
    createInventoryChangeInput: CreateOrderChangeInput,
    resetForm: () => void
  ) => {
    if (createInventoryChangeInput.fieldChanges.length <= 0) {
      closeEditModal();
      resetForm();
      return;
    }

    const oldTShirt = row.original;
    const newTShirt: any = { ...oldTShirt };
    createInventoryChangeInput.fieldChanges.forEach((fieldChange) => {
      newTShirt[fieldChange.fieldName] = fieldChange.newValue;
    });

    const input: UpdateTShirtTransactionInput = {
      updatedTShirt: newTShirt,
      createInventoryChangeInput: createInventoryChangeInput,
    };
    rescueDBOperation(
      () => UpdateTShirtTransactionAPI(input, user, refreshSession),
      DBOperation.UPDATE,
      (resp: UpdateTShirtTransactionResponse) => {
        newTShirt.updatedAt = resp.tshirtUpdatedAtTimestamp;
        editTShirtMutation(newTShirt, lruCacheRef.current);
        prependOrderChangeHistory({
          newOrderChanges: [resp.orderChange],
          orderId: dummyOrderIdForInventoryAdjustment,
        });
        closeEditModal();
        resetForm();
      }
    );
  };

  const handleDeleteRow = useCallback(
    (row: MRT_Row<TShirt>) => {
      if (
        !confirm(
          `Are you sure you want to delete ${row.getValue(tshirtPrimaryKey)}`
        )
      ) {
        return;
      }
      const deletedTShirt = { ...row.original, isDeleted: true };
      rescueDBOperation(
        () => updateTShirtAPI(deletedTShirt),
        DBOperation.DELETE,
        () => {
          deleteTShirtMutation(deletedTShirt.id, lruCacheRef.current);
        }
      );
    },
    [normalizedPages]
  );

  const columns = useMemo<MRT_ColumnDef<TShirt>[]>(() => getTableColumns(), []);

  const handleColFiltersChange = () => {
    let idx = columnFilters.findIndex((x: any) => x.id === "styleNumber");
    if (idx >= 0) {
      setStyleNoFilter(columnFilters[idx].value as string);
    } else {
      setStyleNoFilter("");
    }
  };

  useEffect(() => {
    handleColFiltersChange();
  }, [columnFilters]);

  return (
    <BlankCard>
      <CardContent>
        <Stack>
          <TableInfoHeader subheaderText="This table loads records with the lowest quantity first." />
          <MRTable
            displayColumnDefOptions={{
              "mrt-row-actions": {
                muiTableHeadCellProps: {
                  align: "center",
                },
                size: 120,
              },
            }}
            columns={columns}
            data={currentPage}
            initialState={{
              showColumnFilters: true,
              sorting: [
                {
                  id: "quantityOnHand",
                  desc: false,
                },
              ],
              pagination: { pageIndex: 0, pageSize: 25 },
            }}
            onColumnFiltersChange={setColumnFilters}
            // Pagination
            muiToolbarAlertBannerProps={
              error
                ? {
                    color: "error",
                    children: (
                      <Typography
                        sx={{
                          color: "#FA896B",
                          fontWeight: "bold",
                        }}
                      >
                        Error loading data
                      </Typography>
                    ),
                  }
                : undefined
            }
            state={{
              columnFilters,
              columnVisibility: hiddenColumns,
              isLoading,
              pagination,
              showAlertBanner: error != null,
            }}
            manualPagination
            onPaginationChange={setPagination}
            muiTablePaginationProps={{
              rowsPerPageOptions: [uiPageSize],
              nextIconButtonProps: {
                disabled: disabledNextButton,
              },
            }}
            rowCount={numRows}
            muiTableBodyRowProps={({ row }: { row: MRT_Row<TShirt> }) => ({
              sx: {
                opacity: row.original.quantityOnHand <= 0 ? "50%" : "100%",
              },
            })}
            enableEditing
            enableColumnOrdering
            enableGlobalFilter={false}
            filterFns={{
              noOpFilterFn: (row, id, filterValue) => {
                return true;
              },
            }}
            renderRowActions={({ row, table }) => (
              <TableRowActions
                onEdit={() =>
                  setEditRowState({ showEditPopup: true, row: row })
                }
                onDelete={() => handleDeleteRow(row)}
                showEditButton
                showDeleteButton
              />
            )}
            renderTopToolbarCustomActions={() => (
              <TableToolbar
                addButton={{
                  onAdd: () => setCreateModalOpen(true),
                }}
                exportButton={{
                  onExportAll: () => {
                    fetchAllNonDeletedTShirts(
                      rescueDBOperation,
                      (resp: Page<TShirt>) => {
                        downloadInventoryCSV(resp.items);
                      }
                    );
                  },
                  onExportResults: () => {
                    downloadInventoryCSV(normalizedPages);
                  },
                }}
              />
            )}
          />
          <CreateTShirtModal
            columns={columns}
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={handleCreateNewRow}
            entityName={entityName}
            records={[]}
          />
          <EditTShirtModal
            open={editRowState.showEditPopup}
            row={editRowState.row}
            onSubmit={handleUpdateTShirt}
            onClose={() => closeEditModal()}
            getTableColumns={getTableColumns}
          />
        </Stack>
      </CardContent>
    </BlankCard>
  );
};

export default InventoryTable;
