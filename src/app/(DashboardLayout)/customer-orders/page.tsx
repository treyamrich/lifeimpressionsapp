"use client";

import { CustomerOrder, ModelSortDirection } from "@/API";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { columnInfo, getTableColumns } from "./table-constants";
import {
  type MRT_Row,
  type MRT_ColumnFiltersState,
} from "material-react-table";
import OrderViewAddPage from "../components/po-customer-order-shared-components/ViewOrdersPage";
import { usePagination } from "@/hooks/use-pagination";
import {
  listCustomerOrdersBaseQueryKey,
  useListCustomerOrder,
} from "@/api/hooks/list-hooks";
import { LRUCache } from "@/api/hooks/lru-cache";
import { queryClient } from "@/api/hooks/query-client";

const uiPageSize = 20;
const fetchPageSize = 100;

const CustomerOrders = () => {
  const { push } = useRouter();
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [customerNameFilter, setCustomerNameFilter] = useState("");
  const lruCacheRef = useRef<LRUCache<string>>(
    new LRUCache<string>({
      name: "ListCustomerOrders",
      maxSize: 3,
      onEviction: (evictedKey: string) => {
        queryClient.removeQueries({
          queryKey: [listCustomerOrdersBaseQueryKey, evictedKey],
        });
      },
    })
  );

  const handleRowClick = (row: MRT_Row<CustomerOrder>) => {
    const orderId = row.getValue("id");
    push(`/customer-orders/view/${orderId}`);
  };

  // If ever adding logic to add a row in the table on this page, tanstack query caches need to be cleared
  const handleAddRow = () => push("/customer-orders/create");

  const handleColFiltersChange = () => {
    let idx = columnFilters.findIndex((x: any) => x.id === "customerName");
    if (idx >= 0) {
      setCustomerNameFilter(columnFilters[idx].value as string);
    } else {
      setCustomerNameFilter("");
    }
  };

  useEffect(() => {
    handleColFiltersChange();
  }, [columnFilters]);

  const usePaginationReturn = usePagination<CustomerOrder>({
    query: () =>
      useListCustomerOrder(
        {
          filters: { isDeleted: { ne: true } },
          sortDirection: ModelSortDirection.DESC,
          limit: fetchPageSize,
        },
        customerNameFilter,
        lruCacheRef.current
      ),
    pageSize: uiPageSize,
  });

  return (
    <OrderViewAddPage
      usePaginationReturn={usePaginationReturn}
      pageSize={uiPageSize}
      onRowClick={handleRowClick}
      onAddRow={handleAddRow}
      pageTitle="Customer Orders"
      getTableColumns={getTableColumns}
      columnInfo={columnInfo}
      columnFiltersState={{ columnFilters, setColumnFilters }}
    />
  );
};

export default CustomerOrders;
