import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";
import { ListAPIResponse } from "@/graphql-helpers/fetch-apis";
import { IconButton, Tooltip } from "@mui/material";
import CloudSyncIcon from "@mui/icons-material/CloudSync";

import React, { SetStateAction, useEffect, useState } from "react";

export type LoadMorePaginationButtonProps<T> = {
  items: T[];
  setItems: React.Dispatch<SetStateAction<T[]>>;
  fetchFunc: (
    nextToken: string | undefined | null
  ) => Promise<ListAPIResponse<T>>;
  itemTransformerFn?: (item: T) => T;
  setIsLoading?: React.Dispatch<SetStateAction<boolean>>;
};

function LoadMorePaginationButton<T>({
  items,
  setItems,
  fetchFunc,
  itemTransformerFn,
  setIsLoading
}: LoadMorePaginationButtonProps<T>) {
  const { rescueDBOperation } = useDBOperationContext();
  const [nextToken, setNextToken] = useState<string | undefined | null>(
    undefined
  );

  const handleLoadMore = () => {
    if(setIsLoading) setIsLoading(true);

    rescueDBOperation(
      () => fetchFunc(nextToken),
      DBOperation.LIST,
      (resp: ListAPIResponse<T>) => {
        let newRes = resp.result;
        if (itemTransformerFn) {
          newRes = newRes.map(itemTransformerFn);
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
