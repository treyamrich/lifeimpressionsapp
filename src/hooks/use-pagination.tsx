"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FetchNextPageOptions,
  InfiniteData,
  InfiniteQueryObserverResult,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { MRT_PaginationState } from "material-react-table";
import { Page } from "@/api/types";

export type UsePaginationProps<T> = {
  query: () => UseInfiniteQueryResult<InfiniteData<Page<T>, unknown>, Error>;
  pageSize?: number;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
};

export function usePagination<T>({
  query,
  pageSize,
  setData,
}: UsePaginationProps<T>) {
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    error,
    isFetchNextPageError,
    fetchNextPage,
    hasNextPage,
  } = query();

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: pageSize ?? 10,
  });

  const { pages, currentPage, numRows } = useMemo(() => {
    const pages = data?.pages ?? [];
    const currentPage = pages[pagination.pageIndex]?.items ?? [];
    const numRows = pages.reduce((acc, page) => acc + page.items.length, 0);

    return {
      pages,
      currentPage,
      numRows,
    };
  }, [pagination.pageIndex, data]);

  useEffect(() => {
    const shouldFetchNext =
      pagination.pageIndex >= pages.length &&
      hasNextPage &&
      !isFetching &&
      !isFetchNextPageError;

    if (shouldFetchNext) {
      fetchNextPage();
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    if (!isLoading && data) {
      setData(data.pages.flatMap((page) => page.items));
    }
  }, [isLoading, data]);

  return {
    currentPage,
    pagination,
    setPagination,
    numRows,
    isLoading: isLoading || isFetchingNextPage || error != null,
    error,
    disabledNextButton: !hasNextPage || isFetchingNextPage || isFetchNextPageError,
  };
}
