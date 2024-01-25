"use client";

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';

import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';
import { RegisterCredentials, useAuthContext } from '@/contexts/AuthContext';

interface registerType {
    title?: string;
    subtitle?: JSX.Element | JSX.Element[];
    subtext?: JSX.Element | JSX.Element[];
}

const initialRegisterCredentials: RegisterCredentials = {
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: ""
}
const AuthRegister = ({ title, subtitle, subtext }: registerType) => {
    const { register } = useAuthContext();
    const [registerCreds, setRegisterCreds] = useState<RegisterCredentials>({ ...initialRegisterCredentials });
    const resetForm = () => setRegisterCreds({ ...initialRegisterCredentials });
    const onSubmit = () => {
        register(registerCreds);
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

            <Box style={{textAlign: "center"}}>
                <Typography fontWeight={"600"}>
                    Please contact your administrator for an account.
                </Typography>
                {/* <Stack mb={3}>
                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='name' mb="5px">Name</Typography>
                    <CustomTextField id="name"
                        data-testid="name-input"
                        variant="outlined"
                        fullWidth
                        value={registerCreds.name}
                        onChange={(e: any) => setRegisterCreds({...registerCreds, name: e.target.value})}
                    />

                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='email' mb="5px" mt="25px">Email Address</Typography>
                    <CustomTextField id="email"
                        data-testid="email-input"
                        variant="outlined"
                        fullWidth
                        value={registerCreds.email}
                        onChange={(e: any) => setRegisterCreds({...registerCreds, username: e.target.value, email: e.target.value})}
                    />

                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='password' mb="5px" mt="25px">Password</Typography>
                    <CustomTextField id="password"
                        data-testid="password-input"
                        variant="outlined"
                        fullWidth
                        value={registerCreds.password}
                        onChange={(e: any) => setRegisterCreds({...registerCreds, password: e.target.value})}
                        type="password"
                    />

                    <Typography variant="subtitle1"
                        fontWeight={600} component="label" htmlFor='confirm-password' mb="5px" mt="25px">Confirm Password</Typography>
                    <CustomTextField id="confirm-password"
                        data-testid="confirm-password-input"
                        variant="outlined"
                        fullWidth
                        value={registerCreds.confirmPassword}
                        onChange={(e: any) => setRegisterCreds({...registerCreds, confirmPassword: e.target.value})}
                        type="password"
                    />
                </Stack>
                <Box>
                    <Button
                        data-testid="submit-button"
                        color="primary"
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={onSubmit}
                        type="submit"
                    >
                        Sign Up
                    </Button>
                </Box> */}
            </Box>
            {subtitle}
        </>
    );
}

export default AuthRegister;
