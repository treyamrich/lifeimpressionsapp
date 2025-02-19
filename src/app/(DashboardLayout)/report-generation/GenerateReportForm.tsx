"use client";

import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import PageContainer from "../components/container/PageContainer";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { useState } from "react";
import {
  getEndOfDay,
  getStartOfDay,
  getStartOfMonth,
} from "@/utils/datetimeConversions";
import { useDBOperationContext } from "@/contexts/DBErrorContext";
import { handleGenerateSubmission } from "./report-form-handlers";

export enum ReportType {
  HighLevel = "highLevel",
  Detailed = "detailed",
  InventoryValue = "inventoryValue",
}

export enum ReportFormFields {
  includePOs = "includePOs",
  includeCOs = "includeCOs",
  includeDeletedPOs = "includeDeletedPOs",
  includeDeletedCOs = "includeDeletedCOs",
  includeZeroQtyOrders = "includeZeroQtyOrders",
}

const checkboxLabels: Record<ReportFormFields, string> = {
  [ReportFormFields.includePOs]: "Purchase Orders",
  [ReportFormFields.includeCOs]: "Customer Orders",
  [ReportFormFields.includeDeletedPOs]: "Deleted Purchase Orders",
  [ReportFormFields.includeDeletedCOs]: "Deleted Customer Orders",
  [ReportFormFields.includeZeroQtyOrders]: "Orders with 0 items",
};

const radiobuttons: any = {
  orderLevel: {
    label: "High level",
    value: ReportType.HighLevel,
  },
  tshirtLevel: {
    label: "Detailed with T-Shirt info",
    value: ReportType.Detailed,
  },
  inventoryValueLevel: {
    label: "Inventory Value",
    value: ReportType.InventoryValue,
  },
};

const dateRangeInputTitle = {
  [ReportType.HighLevel]:  "Order Date Placed Range:",
  [ReportType.Detailed]: "Transaction Date Range:",
  [ReportType.InventoryValue]: "Report Month:"
}

export type FormState = {
  dateStart: Dayjs;
  dateEnd: Dayjs;

  includePOs: boolean;
  includeCOs: boolean;

  includeDeletedPOs: boolean;
  includeDeletedCOs: boolean;

  includeZeroQtyOrders: boolean;

  reportType: ReportType;

  errMsg: string;

  yearAndMonth: Dayjs; // For inventory balance
};

const getInitialFormState = (): FormState => ({
  dateStart: getStartOfDay(-1),
  dateEnd: getEndOfDay(0),
  includePOs: true,
  includeCOs: true,
  includeDeletedPOs: false,
  includeDeletedCOs: false,
  includeZeroQtyOrders: false,
  reportType: ReportType.HighLevel,
  errMsg: "",
  yearAndMonth: getStartOfMonth(-1),
});

const ReportGenerationForm = () => {
  const { rescueDBOperationBatch, rescueDBOperation } = useDBOperationContext();
  const [formState, setFormState] = useState(getInitialFormState());
  const [isDownloading, setIsDownloading] = useState(false);
  const { dateStart, dateEnd, errMsg, yearAndMonth, reportType } = formState;

  const updateFormField = (key: string, value: any) => {
    setFormState({ ...formState, [key]: value });
  };

  const validateForm = () => {
    if (dateStart.isAfter(dateEnd)) {
      updateFormField("errMsg", "Start date cannot be after end date");
      return false;
    }
    const noSelectedFilters = !formState.includePOs && !formState.includeCOs;
    const isFilteredQuery = reportType === ReportType.Detailed || reportType === ReportType.HighLevel;
    if (noSelectedFilters && isFilteredQuery) {
      updateFormField("errMsg", "Please select at least one order type");
      return false;
    }
    return true;
  }

  const handleSubmit = async () => {
    updateFormField("errMsg", "");
    if (!validateForm()) return;

    // Constraint to ensure that deleted orders are only included if the non-deleted orders are included
    formState.includeDeletedCOs = formState.includeCOs && formState.includeDeletedCOs;
    formState.includeDeletedPOs = formState.includePOs && formState.includeDeletedPOs;

    if (isDownloading) return;
    setIsDownloading(true)

    try {
      await handleGenerateSubmission(formState, rescueDBOperation, rescueDBOperationBatch);
    } catch (e) {
      updateFormField("errMsg", "Error generating report.");
    } finally {
      setIsDownloading(false);
    }
  };

  const renderDateRangeInput = () => (
    <FormControl>
      <FormLabel component="legend" sx={{marginBottom: 2}}>{dateRangeInputTitle[reportType]}</FormLabel>
      <FormGroup row>
        <Stack direction={"row"} spacing={3}>
          {reportType !== ReportType.InventoryValue ? (
            <>
              <DatePicker
                label="Start of day"
                value={dateStart}
                onChange={(newVal: any) => updateFormField("dateStart", newVal)}
                views={["year", "month", "day"]}
              />
              <DatePicker
                label="End of day"
                value={dateEnd}
                onChange={(newVal: any) => updateFormField("dateEnd", newVal)}
                views={["year", "month", "day"]}
              />
            </>
          ) : (
            <DatePicker
              label="Date"
              value={yearAndMonth}
              onChange={(newVal: any) => updateFormField("yearAndMonth", newVal)}
              views={["year", "month"]}
              openTo="month"
              maxDate={getStartOfMonth(-1)}
            />
          )}
        </Stack>
      </FormGroup>
    </FormControl>
  );

  const renderCheckBoxes = () => {
    const filteredCheckBoxes = Object.keys(checkboxLabels).filter((key) => {
      if (key === ReportFormFields.includeDeletedPOs && !formState.includePOs) return false;
      if (key === ReportFormFields.includeDeletedCOs && !formState.includeCOs) return false;
      return true;
    });
    return (
    <FormControl>
      <FormLabel component="legend">Include in report:</FormLabel>
      <FormGroup row>
        {filteredCheckBoxes.map((key, idx) => (
          <FormControlLabel
            key={`Checkbox-${idx}`}
            label={checkboxLabels[key as keyof typeof checkboxLabels]}
            control={
              <Checkbox
                checked={formState[key as keyof FormState] as boolean}
                onChange={(e) => updateFormField(key, e.target.checked)}
              />
            }
          ></FormControlLabel>
        ))}
      </FormGroup>
    </FormControl>
  )}

  const renderRadioButtons = () => (
    <FormControl>
      <FormLabel component="legend">Report Type:</FormLabel>
      <RadioGroup
        row
        value={formState.reportType}
        onChange={(e) => setFormState({ 
          ...formState, 
          errMsg: "", 
          reportType: e.target.value as ReportType 
        })}
      >
        {Object.keys(radiobuttons).map((key, idx) => (
          <FormControlLabel
            key={`Radio-${idx}`}
            label={radiobuttons[key].label}
            value={radiobuttons[key].value}
            control={<Radio />}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );

  const renderErrorMessages = () => {
    return (
      errMsg !== "" && (
        <Alert color="error" variant="filled">
          {errMsg}
        </Alert>
      )
    );
  };

  const renderSubmitButton = () => (
    <Box>
      <Button
        color="primary"
        variant="contained"
        size="large"
        fullWidth
        onClick={handleSubmit}
        type="submit"
        disabled={isDownloading}
      >
        <DownloadIcon />
      </Button>
    </Box>
  );
  return (
    <PageContainer
      title="Report Generation"
      description={`this is the report generation page`}
    >
      <DashboardCard title="">
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: "100%",
              minWidth: { xs: "300px", sm: "360px", md: "400px" },
              gap: "1.5rem",
            }}
          >
            {renderDateRangeInput()}
            {reportType !== ReportType.InventoryValue && (renderCheckBoxes())}
            {renderRadioButtons()}

            {renderErrorMessages()}

            {renderSubmitButton()}
          </Stack>
        </form>
      </DashboardCard>
    </PageContainer>
  );
};

export default ReportGenerationForm;
