"use client";

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';

import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';
import { ForgotPasswordInput, useAuthContext } from '@/contexts/AuthContext';

interface forgotPasswordType {
    title?: string;
    subtitle?: JSX.Element | JSX.Element[];
    subtext?: JSX.Element | JSX.Element[];
    username: string;
}

const initialForgotPasswordType: ForgotPasswordInput = {
    username: "",
    code: "",
    newPassword: "",
    confirmNewPassword: ""
}
const AuthForgotPasswordConfirm = ({ title, subtitle, subtext, username }: forgotPasswordType) => {
    const { forgotPasswordSubmit } = useAuthContext();
    const [forgotPasswordInput, setForgotPasswordInput] = useState<ForgotPasswordInput>({ ...initialForgotPasswordType });
    const resetForm = () => setForgotPasswordInput({ ...initialForgotPasswordType });
    const onSubmit = () => {
        forgotPasswordSubmit({...forgotPasswordInput, username: username});
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
                        fontWeight={600} component="label" htmlFor='new-password' mb="5px" mt="25px">New Password</Typography>
                    <CustomTextField id="new-password"
                        variant="outlined"
                        fullWidth
                        value={forgotPasswordInput.newPassword}
                        onChange={(e: any) => setForgotPasswordInput({ ...forgotPasswordInput, newPassword: e.target.value })}
                        type="password"
                    />

                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='confirm-new-password' mb="5px" mt="25px">Confirm New Password</Typography>
                    <CustomTextField id="confirm-new-password"
                        variant="outlined"
                        fullWidth
                        value={forgotPasswordInput.confirmNewPassword}
                        onChange={(e: any) => setForgotPasswordInput({ ...forgotPasswordInput, confirmNewPassword: e.target.value })}
                        type="password"
                    />

                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='confirmation-code' mb="5px" mt="25px">Code</Typography>
                    <CustomTextField id="confirmation-code"
                        variant="outlined"
                        fullWidth
                        value={forgotPasswordInput.code}
                        onChange={(e: any) => setForgotPasswordInput({ ...forgotPasswordInput, code: e.target.value })}
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

export default AuthForgotPasswordConfirm;
