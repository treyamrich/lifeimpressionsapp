import { IconButton, Stack, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LoadMorePaginationButton from "../pagination/LoadMorePaginationButton";
import { SetStateAction } from "react";
import { ListAPIResponse } from "@/graphql-helpers/fetch-apis";

const AddNewEntityButton = ({
  onClick,
  text,
}: {
  onClick?: () => void;
  text?: string;
}) => (
  <Tooltip title="Add new item">
    <IconButton onClick={onClick} color="primary" size="small">
      {text}
      <AddIcon />
    </IconButton>
  </Tooltip>
);

function TableToolbar<T>({
  items,
  setItems,
  fetchFunc,
  itemTransformerFn,
  onAdd,
  addButtonText,
  showAddButton,
}: {
  items: T[];
  setItems: React.Dispatch<SetStateAction<T[]>>;
  fetchFunc: (
    nextToken: string | undefined | null
  ) => Promise<ListAPIResponse<T>>;
  itemTransformerFn?: (items: T) => T;

  showAddButton?: boolean;
  onAdd?: () => void;
  addButtonText?: string;
}) {
  return (
    <Stack direction={"row"} gap={1} padding={1}>
      <LoadMorePaginationButton
        items={items}
        setItems={setItems}
        fetchFunc={fetchFunc}
        itemTransformerFn={itemTransformerFn}
      />
      {showAddButton && (
        <AddNewEntityButton text={addButtonText} onClick={onAdd} />
      )}
    </Stack>
  );
}
export default TableToolbar;
