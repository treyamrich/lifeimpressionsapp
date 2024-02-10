import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";
import { ListAPIResponse } from "@/graphql-helpers/fetch-apis";
import { IconButton, Tooltip } from "@mui/material";
import CloudSyncIcon from '@mui/icons-material/CloudSync';

import { SetStateAction, useEffect, useState } from "react";

export type LoadMorePaginationButtonProps<T> = {
  items: T[];
  setItems: React.Dispatch<SetStateAction<T[]>>;
  fetchFunc: (
    nextToken: string | undefined | null
  ) => Promise<ListAPIResponse<T>>;
  itemTransformerFn?: (item: T) => T;
};

function LoadMorePaginationButton<T>({
  items,
  setItems,
  fetchFunc,
  itemTransformerFn,
}: LoadMorePaginationButtonProps<T>) {
  const { rescueDBOperation } = useDBOperationContext();
  const [nextToken, setNextToken] = useState<string | undefined | null>(
    undefined
  );

  const handleLoadMore = () => {
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
      }
    );
  };

  // Fetch first page
  useEffect(() => {
    handleLoadMore();
  }, []);

  return (
    <Tooltip title="Loads more table items">
      <IconButton
        disabled={nextToken === null}
        onClick={handleLoadMore}
        color="success"
        size="small"
      >
        Load More <CloudSyncIcon />
      </IconButton>
    </Tooltip>
  );
}

export default LoadMorePaginationButton;
