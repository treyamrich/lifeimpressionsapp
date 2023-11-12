import ConfirmPopup from "./ConfirmPopup";

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