import { Delete, Edit } from "@mui/icons-material";
import { Box, IconButton, Tooltip } from "@mui/material";

const TableRowActions = ({ onEdit, onDelete}: {
    onEdit: () => void;
    onDelete: () => void;
}) => (
    <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip arrow placement="left" title="Edit">
            <IconButton
                onClick={onEdit}
            >
                <Edit />
            </IconButton>
        </Tooltip>
        <Tooltip arrow placement="right" title="Delete">
            <IconButton color="error" onClick={onDelete}>
                <Delete />
            </IconButton>
        </Tooltip>
    </Box>
);

export default TableRowActions