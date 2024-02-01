"use client";

import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import PageContainer from '../components/container/PageContainer';
import { Alert, Box, Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Stack, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';

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
}

export type FormState = {
    dateStart: Dayjs;
    dateEnd: Dayjs;
    includePOs: boolean;
    includeCOs: boolean;
    includeDeletedPOs: boolean;
    includeDeletedCOs: boolean;
    errMsg: string;
}

const getInitialFormState = (): FormState => ({
    dateStart: dayjs().add(-1, 'day'),
    dateEnd: dayjs(),
    includePOs: true,
    includeCOs: true,
    includeDeletedPOs: false,
    includeDeletedCOs: false,
    errMsg: ""
});

const ReportGenerationForm = ({ onSubmit }: {
    onSubmit: (form: FormState) => void;
}) => {
    const [formState, setFormState] = useState(getInitialFormState());

    const {
        dateStart,
        dateEnd,
        errMsg,
    } = formState;

    const updateFormField = (key: string, value: any) => {
        setFormState({ ...formState, [key]: value });
    }
    const resetForm = () => setFormState(getInitialFormState());

    const handleSubmit = () => {
        if (dateStart.isAfter(dateEnd)) {
            updateFormField("errMsg", "Start date cannot be after end date")
            return;
        }
        onSubmit({ ...formState });
        //resetForm();
    }

    const renderDateRangeInput = () => (
        <Stack direction={"row"} spacing={3}>
            <DateTimePicker
                label="Date Start"
                value={dateStart}
                onChange={(newVal: any) => updateFormField("dateStart", newVal)}
                views={['year', 'month', 'day', 'hours', 'minutes']}
            />
            <DateTimePicker
                label="Date End"
                value={dateEnd}
                onChange={(newVal: any) => updateFormField("dateEnd", newVal)}
                views={['year', 'month', 'day', 'hours', 'minutes']}
            />
        </Stack>
    )

    const renderCheckboxes = () => {
        return (
            <FormControl>
                <FormLabel component="legend">Include in report:</FormLabel>
                <FormGroup row>
                    {Object.keys(checkboxes).map((key, idx) => (
                        <FormControlLabel key={idx} label={checkboxes[key].label} control={
                            <Checkbox
                                checked={formState[key as keyof FormState] as boolean}
                                onChange={e => updateFormField(key, e.target.checked)}
                            />
                        }>
                        </FormControlLabel>
                    ))}
                </FormGroup>
            </FormControl>
        )
    }

    const renderErrorMessages = () => {
        return errMsg !== "" && (
            <Alert color="error">
                <Typography color="error">
                    {errMsg}
                </Typography>
            </Alert>
        )
    }

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
                Generate Report
            </Button>
        </Box>
    )
    return (
        <PageContainer
            title="Report Generation"
            description={`this is the report generation page`}
        >
            <DashboardCard title="Generate Report">
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

                        {renderErrorMessages()}

                        {renderSubmitButton()}
                    </Stack>
                </form>
            </DashboardCard>
        </PageContainer>
    );
}

export default ReportGenerationForm;