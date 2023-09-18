"use client";

import { Button, CardContent, Dialog, DialogContent, DialogTitle, Grid, Typography } from "@mui/material";
import BlankCard from "../../shared/BlankCard";

interface ConfirmPopupProps {
    onClose: () => void;
    onSubmit: () => void;
    open: boolean;
    confirmationMsg: string;
    submitButtonMsg: string;
    cancelButtonMsg: string;
    title: string;
}

const ConfirmPopup = ({ open, onClose, onSubmit, confirmationMsg, submitButtonMsg, cancelButtonMsg, title }: ConfirmPopupProps) => {
    return (
        <Dialog open={open} maxWidth="xs">
            <DialogTitle textAlign="center">{title}</DialogTitle>
            <DialogContent style={{ padding: "25px" }}>
                <Grid container spacing={3} direction="column">
                    <Grid item>
                        <BlankCard>
                            <CardContent>
                                <Typography textAlign={"center"}>
                                    {confirmationMsg}
                                </Typography>
                            </CardContent>
                        </BlankCard>
                    </Grid>
                    <Grid item>
                        <Grid container justifyContent={"space-between"}>
                            <Grid item>
                                <Button
                                    color="error"
                                    size="small"
                                    variant="contained"
                                    onClick={onClose}>
                                    {cancelButtonMsg}
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    size="small"
                                    onClick={onSubmit}
                                    type="submit">
                                    {submitButtonMsg}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    )
}

export default ConfirmPopup