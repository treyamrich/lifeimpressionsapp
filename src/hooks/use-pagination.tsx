"use client";

import { useState, useEffect, useMemo } from "react";
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { MRT_PaginationState } from "material-react-table";
import { Page } from "@/api/types";

export type UsePaginationProps<T> = {
  query: () => UseInfiniteQueryResult<InfiniteData<Page<T>, unknown>, Error>;
  pageSize?: number;
};

export type UsePaginationReturn<T> = {
  currentPage: T[];
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
  numRows: number;
  isLoading: boolean;
  error: Error | null;
  disabledNextButton: boolean;
  normalizedPages: T[];
  resetToFirstPage: () => void;
};

export function usePagination<T>({
  query,
  pageSize,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    error,
    fetchNextPage,
    hasNextPage,
  } = query();

  // Right now this hook won't respond to page size changes
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: pageSize ?? 10,
  });

  // Pages returned from the BE may not be the same size as we expect
  // Therefore, we need to compact pages to fit the pageSize as configured in the UI
  const { numRows, pages, normalizedPages } = useMemo(() => {
    const infiniteQPages = data?.pages ?? [];
    const normalizedData = infiniteQPages.flatMap((page) => page.items);
    const pages: T[][] = [];
    const pageSize = pagination.pageSize;
    let numRows = 0;
    for (let i = 0; i < normalizedData.length; i += pageSize) {
      const p = normalizedData.slice(i, i + pageSize);
      pages.push(p);
      numRows += p.length;
    }
    // If there's more data to fetch, hide the updated last page if it's not full
    if (
      hasNextPage &&
      pages.length > 1 &&
      pages[pages.length - 1].length < pageSize
    ) {
      const last = pages.pop();
      numRows -= last?.length ?? 0;
    }
    return { pages, numRows, normalizedPages: normalizedData };
  }, [pagination.pageSize, data, hasNextPage]);

  const currentPage = pages[pagination.pageIndex] ?? [];
  const atLastLocalPage = pagination.pageIndex === pages.length - 1;
  const atLastPage = !hasNextPage && atLastLocalPage;

  useEffect(() => {
    const shouldFetchNext =
      pagination.pageIndex >= pages.length && hasNextPage && !isFetching;

    if (shouldFetchNext) {
      fetchNextPage();
    }
  }, [pagination.pageIndex]);

  return {
    currentPage,
    pagination,
    setPagination,
    numRows,
    isLoading: isLoading || isFetchingNextPage || error != null,
    error,
    disabledNextButton: atLastPage || isFetchingNextPage,
    normalizedPages,
    resetToFirstPage: () => setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  };
}
