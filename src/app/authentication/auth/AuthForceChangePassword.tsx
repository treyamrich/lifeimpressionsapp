"use client";

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';

import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';
import { useAuthContext } from '@/contexts/AuthContext';

interface forceChangePasswordType {
    title?: string;
    subtitle?: JSX.Element | JSX.Element[];
    subtext?: JSX.Element | JSX.Element[];
}

const initialFormState = {
    newPassword: "",
    name: "",
}
const AuthForgotPassword = ({ title, subtitle, subtext }: forceChangePasswordType) => {
    const { completeNewPassword, user } = useAuthContext();
    const [newPassword, setNewPassword] = useState<string>("");
    const [formState, setFormState] = useState({ ...initialFormState });
    const resetForm = () => setNewPassword("");
    const onSubmit = () => {
        completeNewPassword(formState.newPassword, formState.name);
        resetForm();
    }

    if(!user) {
        return <> Invalid Page </>
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
                        fontWeight={600} component="label" htmlFor='name' mb="5px" mt="25px">Name</Typography>
                    <CustomTextField id="name"
                        variant="outlined"
                        fullWidth
                        onChange={(e: any) => setFormState({ ...formState, name: e.target.value })}
                        type="text"
                    />
                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='new-password' mb="5px" mt="25px">New Password</Typography>
                    <CustomTextField id="new-password"
                        variant="outlined"
                        fullWidth
                        onChange={(e: any) => setFormState({ ...formState, newPassword: e.target.value })}
                        type="password"
                    />
                    <Typography variant="subtitle1"
                        color="grey"
                        fontWeight={400} mb="5px" mt="25px">
                        Passwords must have 8+ characters
                    </Typography>
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
