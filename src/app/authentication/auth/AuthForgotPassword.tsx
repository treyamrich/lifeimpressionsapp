"use client";

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';

import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';
import { useAuthContext } from '@/contexts/AuthContext';

interface forgotPasswordType {
    title?: string;
    subtitle?: JSX.Element | JSX.Element[];
    subtext?: JSX.Element | JSX.Element[];
}

const AuthForgotPassword = ({ title, subtitle, subtext }: forgotPasswordType) => {
    const { forgotPassword } = useAuthContext();
    const [username, setUsername] = useState<string>("");
    const resetForm = () => setUsername("");
    const onSubmit = () => {
        forgotPassword(username);
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
                        fontWeight={600} component="label" htmlFor='email' mb="5px" mt="25px">Email Address</Typography>
                    <CustomTextField id="email"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e: any) => setUsername(e.target.value)}
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
            {subtitle}
        </>
    );
}

export default AuthForgotPassword;
