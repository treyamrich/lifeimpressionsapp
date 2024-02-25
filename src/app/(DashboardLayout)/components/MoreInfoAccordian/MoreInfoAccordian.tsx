import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import React from "react";
import { OrderStatusColors } from "../po-customer-order-shared-components/ViewOrderHeader/OrderStatusSelect";

export type MoreInfoAccordianVariant = "success" | "error" | "info" | "warn";

const variantToOrderStatusColor = {
  success: OrderStatusColors.Green,
  error: OrderStatusColors.Red,
  info: OrderStatusColors.Blue,
  warn: OrderStatusColors.Yellow,
};

const getIcon = (variant: MoreInfoAccordianVariant | undefined) => {
  switch (variant) {
    case "warn":
      return <WarningIcon />;
    default:
      return <InfoIcon />;
  }
};

const getHeaderText = (variant: MoreInfoAccordianVariant | undefined) => {
  switch (variant) {
    case "warn":
      return "Warning";
    default:
      return "More Info";
  }
};

const MoreInfoAccordian = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: MoreInfoAccordianVariant;
}) => {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
        sx={
          variant
            ? { backgroundColor: variantToOrderStatusColor[variant] }
            : undefined
        }
      >
        <Box display={"flex"} alignItems={"center"} columnGap={1}>
          <Typography variant="body2" fontWeight={600}>
            {getHeaderText(variant)}
          </Typography>
          {getIcon(variant)}
        </Box>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

export default MoreInfoAccordian;
