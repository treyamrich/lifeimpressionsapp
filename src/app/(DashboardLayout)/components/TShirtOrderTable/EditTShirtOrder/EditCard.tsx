import { CardContent, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, TextField } from "@mui/material";
import BlankCard from "../../shared/BlankCard";
import { EntityType } from "../../po-customer-order-shared-components/CreateOrderPage";
import { TableMode } from "../TShirtOrderTable";
import NumberInput from "../../inputs/NumberInput";
import QuantityChanger from "./QuantityChanger";
import { FormValue } from "./EditTShirtOrderPopup";
import { TShirtOrderFields, toTShirtOrderColumnHeaderMap } from "../table-constants";
import EditReasonRadioGroup, { EditReasonFormState } from "../../EditReasonRadioGroup/EditReasonRadioGroup";

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

    currentDiscount: number;
    newDiscount: FormValue<number>;
    setNewDiscount: React.Dispatch<React.SetStateAction<FormValue<number>>>;

    editReason: EditReasonFormState;
    setEditReason: React.Dispatch<React.SetStateAction<EditReasonFormState>>;

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

    currentDiscount,
    newDiscount,
    setNewDiscount,

    editReason,
    setEditReason,

    entityType,
    mode
}: EditCardProps) => {

    return (
        <BlankCard>
            <CardContent>
                <FormControl>
                    <Grid container direction="column" spacing={2}>
                        {entityType === EntityType.PurchaseOrder && mode === TableMode.Edit && (
                            <Grid item>
                                <QuantityChanger
                                    title="Amount On Hand"
                                    newQty={newAmtReceived}
                                    setNewQty={setNewAmtReceived}
                                    currentQty={currentAmtReceived}
                                    allowNewQtyToBeZero={true}
                                />
                            </Grid>
                        )}
                        <Grid item>
                            <QuantityChanger
                                title="Amount Ordered"
                                newQty={newAmtOrdered}
                                setNewQty={setNewAmtOrdered}
                                currentQty={currentAmtOrdered}
                                allowNewQtyToBeZero={true}
                            />
                        </Grid>
                        <Grid item>
                            <NumberInput
                                label="Cost/Unit $"
                                initialValue={currentCostPerUnit}
                                isFloat
                                isValidFn={(newValue: number) => {
                                    let err = newValue < 0 ? "Cost/Unit cannot be negative" : "";
                                    setNewCostPerUnit({ value: newValue, hasError: err !== "" });
                                    return err
                                }}
                                onChange={(newValue: number, hasError: boolean) => {
                                    setNewCostPerUnit({ value: newValue, hasError: hasError });
                                }}
                                name="costPerUnit"
                            />
                        </Grid>
                        <Grid item>
                            <NumberInput
                                label={toTShirtOrderColumnHeaderMap[TShirtOrderFields.Discount]}
                                initialValue={currentDiscount}
                                isFloat
                                isValidFn={(newValue: number) => {
                                    let err = newValue < 0 ? "Discount cannot be negative" : "";
                                    setNewDiscount({ value: newValue, hasError: err !== "" });
                                    return err
                                }}
                                onChange={(newValue: number, hasError: boolean) => {
                                    setNewDiscount({ value: newValue, hasError: hasError });
                                }}
                                name="discount"
                            />
                        </Grid>
                        {mode === TableMode.Edit && (
                            <Grid item>
                                <EditReasonRadioGroup
                                    formState={editReason}
                                    setFormState={setEditReason}
                                    showMandatoryRadioButtons={entityType === EntityType.PurchaseOrder}
                                />
                            </Grid>
                        )}
                    </Grid>
                </FormControl>
            </CardContent>
        </BlankCard>
    );
};

export default EditCard;