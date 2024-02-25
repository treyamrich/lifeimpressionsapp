import ConfirmPopup from "./ConfirmPopup";

// Shared with CustomerOrder and PurchaseOrder view page
export type NegativeInventoryWarningState = {
    show: boolean;
    cachedFunctionCall: () => void;
    failedTShirts: string[];
}
export const initialNegativeInventoryWarningState = {
    show: false,
    cachedFunctionCall: () => { },
    failedTShirts: []
};

type NegativeInventoryConfirmPopupProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
    failedTShirts: string[];
}

const NegativeInventoryConfirmPopup = ({ open, onClose, onSubmit, failedTShirts }: NegativeInventoryConfirmPopupProps) => (
    <ConfirmPopup
        open={open}
        onClose={onClose}
        onSubmit={onSubmit}
        title="Warning Negative Inventory"
        confirmationMsg={`The inventory values for the following tshirts will be negative: ${failedTShirts.toString()}. Would you like to continue?`}
        submitButtonMsg="Continue"
        cancelButtonMsg="Cancel"
    />
)

export default NegativeInventoryConfirmPopup;