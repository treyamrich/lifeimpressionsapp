import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";
import { ListAPIResponse } from "@/graphql-helpers/types";
import { IconButton, Tooltip } from "@mui/material";
import CloudSyncIcon from "@mui/icons-material/CloudSync";

import React, { SetStateAction, useEffect, useState } from "react";
import { Page } from "@/api/types";

export type LoadMorePaginationButtonProps<T> = {
  items: T[];
  setItems: React.Dispatch<SetStateAction<T[]>>;
  fetchFunc: (
    nextToken: string | undefined | null
  ) => Promise<Page<T>>;
  filterDuplicates?: {
    getHashkey: (obj: T) => string;
  }
  updatedFetchFn?: {
    updated: boolean;
    setUpdated: React.Dispatch<SetStateAction<boolean>>;
  }
  setIsLoading?: React.Dispatch<SetStateAction<boolean>>;
};

function LoadMorePaginationButton<T>({
  items,
  setItems,
  fetchFunc,
  setIsLoading,
  filterDuplicates,
  updatedFetchFn
}: LoadMorePaginationButtonProps<T>) {
  const { rescueDBOperation } = useDBOperationContext();
  const [nextToken, setNextToken] = useState<string | undefined | null>(
    undefined
  );
  
  const _filterDuplicates = (results: T[]): T[] => {
    const seen = new Set<string>(items.map(x => filterDuplicates!.getHashkey(x)));
    const filteredResults: T[] = [];
    results.forEach(a => {
      let key = filterDuplicates!.getHashkey(a);
      if (!seen.has(key)) {
        seen.add(key);
        filteredResults.push(a);
      }
    });
    return filteredResults;
  }

  const handleLoadMore = (expireNextToken = false) => {
    if(setIsLoading) setIsLoading(true);
    let token = expireNextToken ? undefined : nextToken;

    rescueDBOperation(
      () => fetchFunc(token),
      DBOperation.LIST,
      (resp: Page<T> | ListAPIResponse<T>) => {
        let newRes: T[] = [];

        if ('items' in resp) {
          newRes = resp.items;
        } else if ('result' in resp) {
          newRes = resp.result;
        }

        if (expireNextToken) {
          setItems(newRes);
        } 
        else {
          if(filterDuplicates) {
            newRes = _filterDuplicates(newRes)
          }
          setItems(items.concat(newRes));
        }

        setNextToken(resp.nextToken);
        if(setIsLoading) setIsLoading(false);
      }
    );
  };

  // Fetch first page
  const depArr = updatedFetchFn ? [updatedFetchFn.updated] : [];
  useEffect(() => {
    if (updatedFetchFn && updatedFetchFn.updated) {
      setNextToken(undefined);
      handleLoadMore(true);
      updatedFetchFn.setUpdated(false);
    } else if(!updatedFetchFn) {
      handleLoadMore();
    }
  }, depArr);

  return (
    <Tooltip title="Loads more table items">
      <span>
        <IconButton
          disabled={!nextToken}
          onClick={() => handleLoadMore()}
          color="success"
          size="small"
        >
          Load More <CloudSyncIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
}

export default LoadMorePaginationButton;
