import { CardContent, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, TextField } from "@mui/material";
import BlankCard from "../../shared/BlankCard";
import { EntityType } from "../../po-customer-order-shared-components/CreateOrderPage";
import { TableMode } from "../TShirtOrderTable";
import NumberInput from "../../inputs/NumberInput";
import QuantityChanger from "./QuantityChanger";
import { FormValue } from "./EditTShirtOrderPopup";

type EditCardProps = {
    currentAmtReceived: number;
    newAmtReceived: number;
    setNewAmtReceived: React.Dispatch<React.SetStateAction<number>>;

    currentAmtOrdered: number;
    newAmtOrdered: number;
    setNewAmtOrdered: React.Dispatch<React.SetStateAction<number>>;

    currentCostPerUnit: number;
    newCostPerUnit: FormValue<number>;
    setNewCostPerUnit: React.Dispatch<React.SetStateAction<FormValue<number>>>;

    editReason: string;
    setEditReason: React.Dispatch<React.SetStateAction<string>>;

    otherInput: string;
    setOtherInput: React.Dispatch<React.SetStateAction<string>>;
    setOtherInputError: React.Dispatch<React.SetStateAction<boolean>>;
    otherInputError: boolean;

    entityType: EntityType;
    mode: TableMode
};

const EditCard = ({
    currentAmtReceived,
    newAmtReceived,
    setNewAmtReceived,
    currentAmtOrdered,
    newAmtOrdered,
    setNewAmtOrdered,
    currentCostPerUnit,
    newCostPerUnit,
    setNewCostPerUnit,
    editReason,
    setEditReason,
    otherInput,
    setOtherInput,
    otherInputError,
    setOtherInputError,
    entityType,
    mode
}: EditCardProps) => {
    const handleChangeEditReason = (newReason: string) => {
        setEditReason(newReason);
        if (newReason !== "other") setOtherInputError(false);
    };

    return (
        <BlankCard>
            <CardContent>
                <FormControl>
                    <Grid container direction="column" spacing={2}>
                        {entityType === EntityType.PurchaseOrder && mode === TableMode.Edit && (
                            <Grid item>
                                <QuantityChanger
                                    title="Amount Received"
                                    newQty={newAmtReceived}
                                    setNewQty={setNewAmtReceived}
                                    currentQty={currentAmtReceived}
                                />
                            </Grid>
                        )}
                        <Grid item>
                            <QuantityChanger
                                title="Amount Ordered"
                                newQty={newAmtOrdered}
                                setNewQty={setNewAmtOrdered}
                                currentQty={currentAmtOrdered}
                            />
                        </Grid>
                        <Grid item>
                            <NumberInput
                                label="Cost/Unit $"
                                initialValue={currentCostPerUnit}
                                isFloat
                                customErrorMsg="Not a valid dollar value"
                                onChange={(newValue: number, hasError: boolean) => {
                                    setNewCostPerUnit({ value: newValue, hasError: hasError });
                                }}
                            />
                        </Grid>
                        {mode === TableMode.Edit && (
                            <Grid item>
                                <FormLabel id="radio-buttons-group-label">
                                    Please enter the reason for editing
                                </FormLabel>
                                <RadioGroup
                                    aria-labelledby="radio-buttons-group-label"
                                    name="radio-buttons-group"
                                    value={editReason}
                                    onChange={(e) => handleChangeEditReason(e.target.value)}
                                >
                                    {entityType === EntityType.PurchaseOrder && (
                                        <>
                                            <FormControlLabel
                                                value="Received Item"
                                                control={<Radio />}
                                                label="Received Item"
                                            />
                                            <FormControlLabel
                                                value="Damaged Item"
                                                control={<Radio />}
                                                label="Damaged Item"
                                            />
                                        </>
                                    )}
                                    <FormControlLabel
                                        value="other"
                                        control={<Radio />}
                                        label="Other"
                                    />
                                    <TextField
                                        name="other-text-input"
                                        onChange={(e) => setOtherInput(e.target.value)}
                                        variant="standard"
                                        value={otherInput}
                                        disabled={editReason !== "other"}
                                        required={editReason === "other"}
                                        error={otherInputError}
                                        helperText="Other reason"
                                    />
                                </RadioGroup>
                            </Grid>
                        )}
                    </Grid>
                </FormControl>
            </CardContent>
        </BlankCard>
    );
};

export default EditCard;