"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import React, { useEffect, useMemo, useState } from "react";

import {
    Button,
} from "@mui/material";
import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_ColumnFiltersState,
} from "material-react-table";


function OrderViewAddPage<T extends Record<any, any>>({
    tableData,
    onRowClick,
    onAddRow,
    onFetchTableData,
    pageTitle,
    entityName,
    getTableColumns
}: {
    tableData: T[],
    onRowClick: (row: MRT_Row<T>) => void,
    onAddRow: () => void,
    onFetchTableData: () => void,
    pageTitle: string,
    entityName: string,
    getTableColumns: () => MRT_ColumnDef<T>[]
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
                        muiTableBodyRowProps={({ row }) => ({
                            onClick: (event) => {
                                onRowClick(row);
                            },
                            sx: {
                                cursor: 'pointer', //you might want to change the cursor too when adding an onClick
                            },
                        })}
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
                        renderTopToolbarCustomActions={() => (
                            <Button
                                color="primary"
                                onClick={onAddRow}
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

export default OrderViewAddPage;