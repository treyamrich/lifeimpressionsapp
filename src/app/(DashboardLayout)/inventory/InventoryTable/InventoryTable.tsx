"use client";

import { createTShirtAPI } from "@/graphql-helpers/create-apis";
import { listTShirtAPI } from "@/graphql-helpers/list-apis";
import { ListAPIResponse } from "@/graphql-helpers/types";
import { updateTShirtAPI } from "@/graphql-helpers/update-apis";

import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";
import {
  tshirtPrimaryKey,
  entityName,
  getTableColumns,
  hiddenColumns,
} from "./table-constants";
import { CardContent, Stack } from "@mui/material";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_ColumnFiltersState
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
import { CreateOrderChangeInput, OrderChange, TShirt } from "@/API";
import React, {
  useMemo,
  useState,
  useCallback,
  SetStateAction,
  useEffect
} from "react";
import { downloadInventoryCSV, fetchAllNonDeletedTShirts } from "../util";

type EditRowState = {
  showEditPopup: boolean;
  row: MRT_Row<TShirt> | undefined;
};

const InventoryTable = ({
  editHistory,
  setEditHistory,
  isLoading,
  setIsLoading,
}: {
  editHistory: OrderChange[];
  setEditHistory: React.Dispatch<SetStateAction<OrderChange[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<SetStateAction<boolean>>;
}) => {

  const fetchTShirtsNoFilterFn = (nextToken: string | null | undefined) => {
    const deletedFilter = { isDeleted: { ne: true } };
    return listTShirtAPI({ filters: deletedFilter, nextToken: nextToken });
  };

  const fetchTShirtsByStyleNumberFn = (styleNo: string) => {
    const deletedFilter = { isDeleted: { ne: true } };
    return (nextToken: string | null | undefined) => listTShirtAPI(
      { filters: deletedFilter, nextToken: nextToken, indexPartitionKey: styleNo, doCompletePagination: true}, "byStyleNumber")
  }

  const { rescueDBOperation } = useDBOperationContext();
  const { user, refreshSession } = useAuthContext();
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [updatedFetchFn, setUpdatedFetchFn] = useState(false);
  const [editRowState, setEditRowState] = useState<EditRowState>({
    showEditPopup: false,
    row: undefined,
  });
  const [tableData, setTableData] = useState<TShirt[]>([]);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [styleNoFilter, setStyleNoFilter] = useState('');

  const closeEditModal = () =>
    setEditRowState({ row: undefined, showEditPopup: false });

  const handleCreateNewRow = (values: TShirt) => {
    rescueDBOperation(
      () => createTShirtAPI(values),
      DBOperation.CREATE,
      (resp: TShirt) => {
        setTableData([...tableData, resp]);
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

    const oldTShirt = tableData[row.index];
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
        tableData[row.index] = newTShirt;
        setTableData([...tableData]);
        setEditHistory([resp.orderChange, ...editHistory]);
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
          tableData.splice(row.index, 1);
          setTableData([...tableData]);
        }
      );
    },
    [tableData]
  );

  const columns = useMemo<MRT_ColumnDef<TShirt>[]>(() => getTableColumns(), []);

  const fetchTShirtsPaginationFn = useMemo(() => {
    setUpdatedFetchFn(true);
    if (styleNoFilter !== '') {
      return fetchTShirtsByStyleNumberFn(styleNoFilter);
    }
    return fetchTShirtsNoFilterFn;
  }, [styleNoFilter])

  const handleColFiltersChange = () => {
    let idx = columnFilters.findIndex((x: any) => x.id === 'styleNumber')
    if (idx >= 0) {
      setStyleNoFilter(columnFilters[idx].value as string);
    } else {
      setStyleNoFilter('');
    }
  }

  useEffect(() => {
    handleColFiltersChange();
  }, [columnFilters])

  return (
    <BlankCard>
      <CardContent>
        <Stack>
          <TableInfoHeader subheaderText="This table loads records with the lowest quantity first." />
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
            initialState={{
              showColumnFilters: true,
              sorting: [
                {
                  id: "quantityOnHand",
                  desc: false,
                },
              ],
              pagination: { pageIndex: 0, pageSize: 25 }
            }}
            onColumnFiltersChange={setColumnFilters}
            state={{
              columnFilters,
              columnVisibility: hiddenColumns,
              isLoading,
            }}
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
                pagination={{
                  items: tableData,
                  setItems: setTableData,
                  fetchFunc: fetchTShirtsPaginationFn,
                  setIsLoading: setIsLoading,
                  filterDuplicates: {
                    getHashkey: (tshirt: TShirt) => tshirt.id,
                  },
                  updatedFetchFn: { updated: updatedFetchFn, setUpdated: setUpdatedFetchFn }
                }}
                addButton={{
                  onAdd: () => setCreateModalOpen(true),
                }}
                exportButton={{
                  onExportAll: () => {
                    fetchAllNonDeletedTShirts(
                      rescueDBOperation,
                      (resp: ListAPIResponse<TShirt>) => {
                        downloadInventoryCSV(resp.result);
                      }
                    );
                  },
                  onExportResults: () => {
                    downloadInventoryCSV(tableData);
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
            records={tableData}
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
