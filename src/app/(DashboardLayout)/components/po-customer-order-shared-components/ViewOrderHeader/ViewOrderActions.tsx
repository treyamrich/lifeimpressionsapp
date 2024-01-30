import { Box, Button, Grid } from "@mui/material"

const ViewOrderActions = ({ onEdit, onDelete}: {
    onEdit: () => void;
    onDelete: () => void;
}) => {
    const getButtonField = ({ text, onClick, color, id, columnSize }: {
        text: string, onClick: () => void, color: string, id: string, columnSize: number
    }) => (
        <Grid item xs={columnSize}>
            <Box display="flex" justifyContent="flex-end">
                <Button
                    id={id}
                    color={color as any}
                    variant="contained"
                    size="small"
                    onClick={onClick}
                >
                    {text}
                </Button>
            </Box>
        </Grid>
    )
    return (
        <Grid container style={{ marginBottom: "15px" }} justifyContent="flex-end">
            {getButtonField({
                text: "Edit Order Details",
                onClick: onEdit,
                color: "success",
                id: "edit-order-button",
                columnSize: 2
            })}
            {getButtonField({
                text: "Delete Order",
                onClick: onDelete,
                color: "error",
                id: "delete-order-button",
                columnSize: 2
            })}
        </Grid>
    )
}

export default ViewOrderActions;