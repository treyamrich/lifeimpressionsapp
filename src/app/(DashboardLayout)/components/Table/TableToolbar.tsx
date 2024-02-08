import { IconButton, Stack, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LoadMorePaginationButton, { LoadMorePaginationButtonProps } from "../pagination/LoadMorePaginationButton";
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
  paginationProps,
  onAdd,
  addButtonText,

  showAddButton,
  showPaginationButton,
}: {
  paginationProps?: LoadMorePaginationButtonProps<T>;

  showAddButton?: boolean;
  showPaginationButton?: boolean;

  onAdd?: () => void;
  addButtonText?: string;
}) {
  return (
    <Stack direction={"row"} gap={1} padding={1}>
      {showPaginationButton && paginationProps && (
        <LoadMorePaginationButton
          {...paginationProps}
        />
      )}
      {showAddButton && (
        <AddNewEntityButton text={addButtonText} onClick={onAdd} />
      )}
    </Stack>
  );
}
export default TableToolbar;
