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
  Typography,
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

const checkboxLabels: any = {
  includePOs: "Purchase Orders",
  includeCOs: "Customer Orders",
  includeDeletedPOs: "Deleted Purchase Orders",
  includeDeletedCOs: "Deleted Customer Orders",
  includeZeroQtyOrders: "Orders with 0 items",
};

export enum ReportType {
  HighLevel = "highLevel",
  Detailed = "detailed",
  InventoryValue = "inventoryValue",
}

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

const ReportGenerationForm = ({
  onSubmit,
}: {
  onSubmit: (form: FormState) => void;
}) => {
  const [formState, setFormState] = useState(getInitialFormState());

  const { dateStart, dateEnd, errMsg, yearAndMonth, reportType } = formState;

  const updateFormField = (key: string, value: any) => {
    setFormState({ ...formState, [key]: value });
  };

  const handleSubmit = () => {
    if (dateStart.isAfter(dateEnd)) {
      updateFormField("errMsg", "Start date cannot be after end date");
      return;
    }
    onSubmit({ ...formState });
  };

  const renderDateRangeInput = () => (
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
  );

  const renderCheckboxes = () => (
    <FormControl>
      <FormLabel component="legend">Include in report:</FormLabel>
      <FormGroup row>
        {Object.keys(checkboxLabels).map((key, idx) => (
          <FormControlLabel
            key={`Checkbox-${idx}`}
            label={checkboxLabels[key]}
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
  );

  const renderRadiobuttons = () => (
    <FormControl>
      <FormLabel component="legend">Report Type:</FormLabel>
      <RadioGroup
        row
        value={formState.reportType}
        onChange={(e) => updateFormField("reportType", e.target.value)}
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
        <Alert color="error">
          <Typography color="error">{errMsg}</Typography>
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
            {reportType !== ReportType.InventoryValue && (renderCheckboxes())}
            {renderRadiobuttons()}

            {renderErrorMessages()}

            {renderSubmitButton()}
          </Stack>
        </form>
      </DashboardCard>
    </PageContainer>
  );
};

export default ReportGenerationForm;
