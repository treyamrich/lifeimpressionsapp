"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
    Button,
} from "@mui/material";
import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_ColumnFiltersState,
    MRT_VisibilityState,
} from "material-react-table";
import { ColumnInfo } from "../../purchase-orders/table-constants";


function ViewOrdersPage<T extends Record<any, any>>({
    tableData,
    onRowClick,
    onAddRow,
    onFetchTableData,
    pageTitle,
    entityName,
    getTableColumns,
    columnInfo
}: {
    tableData: T[],
    onRowClick: (row: MRT_Row<T>) => void,
    onAddRow: () => void,
    onFetchTableData: () => void,
    pageTitle: string,
    entityName: string,
    getTableColumns: () => MRT_ColumnDef<T>[],
    columnInfo: Map<string | number | symbol | undefined, ColumnInfo>
}) {
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
        []
    );

    const columns = useMemo<MRT_ColumnDef<T>[]>(
        () => getTableColumns(),
        []
    );

    useEffect(() => {
        onFetchTableData();
    }, []);

    const hiddenColumns = useRef<()=>MRT_VisibilityState>(() => {
        const res = {} as any;
        columns.forEach(col => {
            const key = col.accessorKey;
            if (columnInfo.get(key)?.hideInTable)
                res[key as string] = false
        });
        return res
    });

    return (
        <PageContainer title={`${pageTitle}`} description={`this is ${pageTitle} page`}>
            <DashboardCard title={`${pageTitle}`}>
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
                        muiTableBodyRowProps={({ row }: { row: any }) => ({
                            onClick: () => {
                                onRowClick(row);
                            },
                            sx: {
                                cursor: 'pointer', //you might want to change the cursor too when adding an onClick
                            },
                        })}
                        columns={columns}
                        data={tableData}
                        initialState={{ showColumnFilters: true, columnVisibility: hiddenColumns.current() }}
                        editingMode="modal" //default
                        enableColumnOrdering
                        enableHiding={false}
                        onColumnFiltersChange={setColumnFilters}
                        state={{
                            columnFilters,
                        }}
                        renderTopToolbarCustomActions={() => (
                            <Button
                                color="primary"
                                onClick={onAddRow}
                                variant="contained"
                            >
                                Place New {entityName}
                            </Button>
                        )}
                    />
                </>
            </DashboardCard>
        </PageContainer>
    );
};

export default ViewOrdersPage;