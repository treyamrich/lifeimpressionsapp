"use client";

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';

import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';
import { useAuthContext } from '@/contexts/AuthContext';

interface confirmRegisterType {
    title?: string;
    subtext?: JSX.Element | JSX.Element[];
    username: string;
}

const AuthConfirmRegister = ({ title, subtext, username }: confirmRegisterType) => {
    const { confirmRegister } = useAuthContext();
    const [confirmationCode, setConfirmationCode] = useState<string>("");
    const resetForm = () => setConfirmationCode("");
    const onSubmit = () => {
        confirmRegister({ username: username, confirmationCode: confirmationCode });
        resetForm();
    }
    return (
        <>
            {title ? (
                <Typography fontWeight="700" variant="h2" mb={1}>
                    {title}
                </Typography>
            ) : null}

            {subtext}

            <Box>
                <Stack mb={3}>
                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='confirmation-code' mb="5px" mt="25px">Confirmation Code</Typography>
                    <CustomTextField id="confirmation-code"
                        variant="outlined"
                        fullWidth
                        value={confirmationCode}
                        onChange={(e: any) => setConfirmationCode(e.target.value)}
                    />
                </Stack>
                <Box>
                    <Button
                        color="primary"
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={onSubmit}
                        type="submit"
                    >
                        Submit
                    </Button>
                </Box>
            </Box>
        </>
    );
}

export default AuthConfirmRegister;
