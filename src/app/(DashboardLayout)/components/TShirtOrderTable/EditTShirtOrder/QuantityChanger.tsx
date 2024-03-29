import { Box, Button, FormLabel, Grid, Typography } from "@mui/material";
import { SetStateAction } from "react";
import StrictIntegerInput from "../../inputs/StrictNumberInput";

type QuantityChangerProps = {
    newQty: number;
    setNewQty: React.Dispatch<SetStateAction<number>>;
    title: String;
    currentQty: number;
    allowNewQtyToBeZero: boolean;
};

const QuantityChanger = ({ newQty, setNewQty, title, currentQty, allowNewQtyToBeZero }: QuantityChangerProps) => {
    const newTotal = newQty + currentQty;
    return (
        <Grid container direction="column" spacing={1}>
            <Grid item>
                <Grid container direction="column">
                    <Grid item>
                        <FormLabel id={`title-label-${title}`}>
                            <Typography variant="h6">
                                {title}
                            </Typography>
                        </FormLabel>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Grid container alignItems={"center"} spacing={2}>
                    <Grid item>
                        New Total: {newTotal}
                    </Grid>
                    <Grid item>
                        <Grid container spacing={2} alignItems={"center"}>
                            <Grid item>
                                <Button
                                    color="error"
                                    variant="contained"
                                    size="small"
                                    disabled={newTotal === 0 || (!allowNewQtyToBeZero && newTotal === 1)}
                                    onClick={() =>
                                        setNewQty((prev: number) => prev - 1)
                                    }
                                >
                                    -
                                </Button>
                            </Grid>
                            <Grid item>
                                <Box width={100}>
                                    <StrictIntegerInput
                                        initialValue={newQty}
                                        onChange={newVal => setNewQty(newVal)}
                                        name="qty-changer-int-input"
                                    />
                                </Box>
                            </Grid>
                            <Grid item>
                                <Button
                                    color="success"
                                    variant="contained"
                                    size="small"
                                    onClick={() =>
                                        setNewQty((prev: number) => prev + 1)
                                    }
                                >
                                    +
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
};

export default QuantityChanger;