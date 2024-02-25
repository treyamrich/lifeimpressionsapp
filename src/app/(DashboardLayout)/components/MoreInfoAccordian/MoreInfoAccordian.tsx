import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Typography,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import InfoIcon from "@mui/icons-material/Info";
import React from "react";
  
  
  const MoreInfoAccordian = ({ children }: { children: React.ReactNode }) => {
    return (
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Box display={"flex"} alignItems={"center"} columnGap={1}>
            <Typography variant="body2" fontWeight={600}>
              More Info
            </Typography>
            <InfoIcon />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {children}
        </AccordionDetails>
      </Accordion>
    );
  };
  
  export default MoreInfoAccordian;
  