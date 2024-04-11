"use client";

import { CustomerOrder, ModelSortDirection } from "@/API";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listCustomerOrderAPI } from "@/graphql-helpers/list-apis";

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

const CustomerOrders = () => {
  const { push } = useRouter();
  const [tableData, setTableData] = useState<CustomerOrder[]>([]);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [didUpdateFetchFn, setDidUpdateFetchFn] = useState(false);
  const [customerNameFilter, setCustomerNameFilter] = useState('');

  const handleRowClick = (row: MRT_Row<CustomerOrder>) => {
    const orderId = row.getValue("id");
    push(`/customer-orders/view/${orderId}`);
  };
  const handleAddRow = () => push("/customer-orders/create");

  const fetchCustomerOrdersNoFilterFn = (
    nextToken: string | null | undefined
  ) => {
    const deletedFilter = { isDeleted: { ne: true } };
    return listCustomerOrderAPI({
      filters: deletedFilter,
      nextToken: nextToken,
      sortDirection: ModelSortDirection.DESC,
    });
  };

  const fetchCustomerOrdersByCustomerNameFn = (customerName: string) => {
    const deletedFilter = { isDeleted: { ne: true }};
    return (nextToken: string | null | undefined) => listCustomerOrderAPI({
      filters: deletedFilter,
      doCompletePagination: true,
      nextToken,
      indexPartitionKey: customerName
    },
    "byCustomerName");
  }

  const fetchOrdersPaginationFn = useMemo(() => {
    setDidUpdateFetchFn(true);
    if (customerNameFilter !== '') {
      return fetchCustomerOrdersByCustomerNameFn(customerNameFilter);
    }
    return fetchCustomerOrdersNoFilterFn;
  }, [customerNameFilter]);

  const handleColFiltersChange = () => {
    let idx = columnFilters.findIndex((x: any) => x.id === 'customerName')
    if (idx >= 0) {
      setCustomerNameFilter(columnFilters[idx].value as string);
    } else {
      setCustomerNameFilter('');
    }
  }

  useEffect(() => {
    handleColFiltersChange();
  }, [columnFilters])

  return (
    <OrderViewAddPage
      tableData={tableData}
      setTableData={setTableData}
      onRowClick={handleRowClick}
      onAddRow={handleAddRow}
      pageTitle="Customer Orders"
      entityType={EntityType.CustomerOrder}
      getTableColumns={getTableColumns}
      columnInfo={columnInfo}
      columnFiltersState={{ columnFilters, setColumnFilters }}
      fetchOrdersPaginationFn={fetchOrdersPaginationFn}
      didUpdateFetchFnState={{ updated: didUpdateFetchFn, setUpdated: setDidUpdateFetchFn }}
    />
  );
};

export default CustomerOrders;
