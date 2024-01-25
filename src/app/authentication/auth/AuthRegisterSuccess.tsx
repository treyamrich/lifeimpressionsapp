"use client";

import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import Link from "next/link";
import { loginPath } from '@/contexts/AuthContext';


interface registerType {
    title?: string;
    subtitle?: JSX.Element | JSX.Element[];
    subtext?: JSX.Element | JSX.Element[];
}

const AuthRegisterSuccess = ({ title, subtitle, subtext }: registerType) => {
    return (
        <>
            {title ? (
                <Typography fontWeight="700" variant="h2" mb={1}>
                    {title}
                </Typography>
            ) : null}

            {subtext}

            <Box>
                <Typography
                    component={Link}
                    href={loginPath}
                    fontWeight="500"
                    sx={{
                        textDecoration: "none",
                        color: "primary.main",
                    }}
                >
                    Back to Login
                </Typography>
            </Box>
            {subtitle}
        </>
    );
}

export default AuthRegisterSuccess;
