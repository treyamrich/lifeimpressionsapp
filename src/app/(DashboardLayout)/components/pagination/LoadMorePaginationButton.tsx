import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";
import { ListAPIResponse } from "@/graphql-helpers/types";
import { IconButton, Tooltip } from "@mui/material";
import CloudSyncIcon from "@mui/icons-material/CloudSync";

import React, { SetStateAction, useEffect, useState } from "react";

export type LoadMorePaginationButtonProps<T> = {
  items: T[];
  setItems: React.Dispatch<SetStateAction<T[]>>;
  fetchFunc: (
    nextToken: string | undefined | null
  ) => Promise<ListAPIResponse<T>>;
  filterDuplicates?: {
    getHashkey: (obj: T) => string;
  }
  setIsLoading?: React.Dispatch<SetStateAction<boolean>>;
};

function LoadMorePaginationButton<T>({
  items,
  setItems,
  fetchFunc,
  setIsLoading,
  filterDuplicates
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

  const handleLoadMore = () => {
    if(setIsLoading) setIsLoading(true);

    rescueDBOperation(
      () => fetchFunc(nextToken),
      DBOperation.LIST,
      (resp: ListAPIResponse<T>) => {
        let newRes = resp.result;
        
        if(filterDuplicates) {
          newRes = _filterDuplicates(newRes)
        }

        setItems(items.concat(newRes));
        setNextToken(resp.nextToken);

        if(setIsLoading) setIsLoading(false);
      }
    );
  };

  // Fetch first page
  useEffect(() => {
    handleLoadMore();
  }, []);

  return (
    <Tooltip title="Loads more table items">
      <span>
        <IconButton
          disabled={!nextToken}
          onClick={handleLoadMore}
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
