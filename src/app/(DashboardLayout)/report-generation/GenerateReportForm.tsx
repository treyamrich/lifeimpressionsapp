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
import DownloadIcon from '@mui/icons-material/Download';
import { DateTimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { useState } from "react";
import { getEndOfDay, getStartOfDay } from "@/utils/datetimeConversions";

const checkboxes: any = {
  includePOs: {
    label: "Purchase Orders",
  },
  includeCOs: {
    label: "Customer Orders",
  },
  includeDeletedPOs: {
    label: "Deleted Purchase Orders",
  },
  includeDeletedCOs: {
    label: "Deleted Customer Orders",
  },
};

export enum ReportType {
  HighLevel = "highLevel",
  Detailed = "detailed",
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
};

export type FormState = {
  dateStart: Dayjs;
  dateEnd: Dayjs;
  includePOs: boolean;
  includeCOs: boolean;
  includeDeletedPOs: boolean;
  includeDeletedCOs: boolean;
  reportType: ReportType;
  errMsg: string;
};

const getInitialFormState = (): FormState => ({
  dateStart: getStartOfDay(-1),
  dateEnd: getEndOfDay(0),
  includePOs: true,
  includeCOs: true,
  includeDeletedPOs: false,
  includeDeletedCOs: false,
  reportType: ReportType.HighLevel,
  errMsg: "",
});

const ReportGenerationForm = ({
  onSubmit,
}: {
  onSubmit: (form: FormState) => void;
}) => {
  const [formState, setFormState] = useState(getInitialFormState());

  const { dateStart, dateEnd, errMsg } = formState;

  const updateFormField = (key: string, value: any) => {
    setFormState({ ...formState, [key]: value });
  };
  const resetForm = () => setFormState(getInitialFormState());

  const handleSubmit = () => {
    if (dateStart.isAfter(dateEnd)) {
      updateFormField("errMsg", "Start date cannot be after end date");
      return;
    }
    onSubmit({ ...formState });
    //resetForm();
  };

  const renderDateRangeInput = () => (
    <Stack direction={"row"} spacing={3}>
      <DateTimePicker
        label="Start of day"
        value={dateStart}
        onChange={(newVal: any) => updateFormField("dateStart", newVal)}
        views={["year", "month", "day"]}
      />
      <DateTimePicker
        label="End of day"
        value={dateEnd}
        onChange={(newVal: any) => updateFormField("dateEnd", newVal)}
        views={["year", "month", "day"]}
      />
    </Stack>
  );

  const renderCheckboxes = () => (
    <FormControl>
      <FormLabel component="legend">Include in report:</FormLabel>
      <FormGroup row>
        {Object.keys(checkboxes).map((key, idx) => (
          <FormControlLabel
            key={`Checkbox-${idx}`}
            label={checkboxes[key].label}
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
        <DownloadIcon/>
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
            {renderCheckboxes()}
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
