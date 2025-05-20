import { CardContent, Grid, Typography } from "@mui/material";
import BlankCard from "../../shared/BlankCard";
import ConfirmPopup from "./ConfirmPopup";
import React from "react";
import { TShirt } from "@/API";
import { tshirtSizeToLabel } from "@/app/(DashboardLayout)/inventory/InventoryTable/table-constants";

// Shared with CustomerOrder and PurchaseOrder view page
export type NegativeInventoryWarningState = {
    show: boolean;
    cachedFunctionCall: () => void;
    failedTShirts: TShirt[];
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
    failedTShirts: TShirt[];
}

const NegativeInventoryConfirmPopup = ({ open, onClose, onSubmit, failedTShirts }: NegativeInventoryConfirmPopupProps) => {
    const getGridRow = (data: string[], index: number) => {
        const color = index % 2 === 0 ? '#e6e6e6' : '#ffffff';
        const fontWeight = index === 0 ? "bold" : "normal";
        return (<React.Fragment key={`failedtshirt-row-${index}`}>
            {data.map((item, i) => (
            <Grid item xs={4} style={{ backgroundColor: color, padding: "10px" }} key={`failedtshirt-cell-${index}-${i}`}>
                <Typography variant="body1" fontWeight={fontWeight}>{item}</Typography>
            </Grid>
            ))}
        </React.Fragment>)
    }
    return (
    <ConfirmPopup
        open={open}
        onClose={onClose}
        onSubmit={onSubmit}
        title="Warning Negative Inventory"
        confirmationBody={
            <BlankCard>
                <Typography 
                        variant="body1" 
                        fontWeight="bold" 
                        style={{ padding: "5px", textAlign: "center" }}
                    >
                        The inventory values for the following tshirts will be negative. Would you like to continue?
                    </Typography>
                <CardContent style={{ height: "338px", overflowY: "auto", width: "100%" }}>
                    <Grid container rowSpacing={1}>
                        {getGridRow(["Style Number", "Size", "Color"], 0)}
                        {failedTShirts.map((tshirt, index) => {
                            return getGridRow([tshirt.styleNumber, tshirtSizeToLabel[tshirt.size], tshirt.color], index + 1);
                        })}
                    </Grid>
                </CardContent>
            </BlankCard>
        }
        confirmationMsg=""
        submitButtonMsg="Continue"
        cancelButtonMsg="Cancel"
    />
)}

export default NegativeInventoryConfirmPopup;