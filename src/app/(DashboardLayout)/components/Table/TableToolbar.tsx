import { IconButton, ListItemIcon, ListItemText, MenuItem, MenuList, Stack, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import LoadMorePaginationButton, { LoadMorePaginationButtonProps } from "../pagination/LoadMorePaginationButton";
import React from "react";
import IconMenu from "../IconMenu/IconMenu";

const TableToolbarButton = ({
  onClick,
  text,
  tooltip,
  icon
}: {
  onClick?: () => void;
  text?: string;
  tooltip: string;
  icon: React.ReactNode;
}) => (
  <Tooltip title={tooltip}>
    <IconButton onClick={onClick} color="primary" size="small">
      {text}
      {icon}
    </IconButton>
  </Tooltip>
);

function TableToolbar<T>({
  pagination,
  addButton,
  exportButton
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
    </Stack>
  );
}
export default TableToolbar;
