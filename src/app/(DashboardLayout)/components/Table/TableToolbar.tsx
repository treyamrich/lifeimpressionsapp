import { IconButton, Stack, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import LoadMorePaginationButton, { LoadMorePaginationButtonProps } from "../pagination/LoadMorePaginationButton";
import React from "react";
import IconMenu from "../IconMenu/IconMenu";
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';

const TableToolbarButton = ({
  onClick,
  text,
  tooltip,
  icon,
  disabled
}: {
  onClick?: () => void;
  text?: string;
  tooltip: string;
  icon: React.ReactNode;
  disabled?: boolean;
}) => (
  <Tooltip title={tooltip}>
    <IconButton onClick={onClick} color="primary" size="small" disabled={disabled}>
      {text}
      {icon}
    </IconButton>
  </Tooltip>
);

function TableToolbar<T>({
  pagination,
  addButton,
  exportButton,
  receiveAllItemsButton,
}: {
  pagination?: LoadMorePaginationButtonProps<T>;
  addButton?: {
    onAdd: () => void;
    text?: string;
  };
  exportButton?: {
    onExportAll: () => void;
    onExportResults: () => void;
    text?: string;
  };
  receiveAllItemsButton?: {
    onReceiveAllItems: () => void;
    isDisabled?: boolean;
  };
}) {
  return (
    <Stack direction={"row"} gap={1} padding={1}>
      {addButton && (
        <TableToolbarButton 
          text={addButton.text}
          onClick={addButton.onAdd}
          icon={<AddIcon />}
          tooltip="Add new item"
        />
      )}
      {pagination && (
        <LoadMorePaginationButton
          {...pagination}
        />
      )}
      {exportButton && (
        <IconMenu
          icon={<MoreHorizIcon/>}
          menuActions={[{
            text: "Export all",
            onClick: exportButton.onExportAll
          },
          {
            text: "Export loaded results",
            onClick: exportButton.onExportResults
          }]}
        />
      )}
      {receiveAllItemsButton && (
        <TableToolbarButton 
          onClick={receiveAllItemsButton.onReceiveAllItems}
          icon={<ChecklistRtlIcon />}
          tooltip="Receive all items"
          disabled={receiveAllItemsButton.isDisabled}
        />
      )}
    </Stack>
  );
}
export default TableToolbar;
