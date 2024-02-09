import { Delete, Edit } from "@mui/icons-material";
import { Box, IconButton, Tooltip } from "@mui/material";

const TableRowActions = ({
  onEdit,
  onDelete,
  showEditButton,
  showDeleteButton,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
}) => (
  <Box sx={{ display: "flex", gap: "1rem" }}>
    {showEditButton && (
      <Tooltip arrow placement="left" title="Edit">
        <IconButton onClick={onEdit}>
          <Edit />
        </IconButton>
      </Tooltip>
    )}
    {showDeleteButton && (
      <Tooltip arrow placement="right" title="Delete">
        <IconButton color="error" onClick={onDelete}>
          <Delete />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);

export default TableRowActions;
