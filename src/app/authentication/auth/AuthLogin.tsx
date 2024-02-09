"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { LoginCredentials, useAuthContext } from "@/contexts/AuthContext";

import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import Link from "next/link";

interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}

const initialLoginCredsState: LoginCredentials = {
  username: "",
  password: ""
}

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const { login } = useAuthContext();
  const [loginCreds, setLoginCreds] = useState<LoginCredentials>({ ...initialLoginCredsState });
  const resetForm = () => {
    setLoginCreds({ ...initialLoginCredsState })
  }
  const onSubmit = () => {
    login(loginCreds);
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

      <Stack>
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="email"
            mb="5px"
          >
            Email
          </Typography>
          <CustomTextField id="email"
            variant="outlined" 
            fullWidth 
            value={loginCreds.username}
            onChange={(e: any) => setLoginCreds({...loginCreds, username: e.target.value})}
          />
        </Box>
        <Box mt="25px">
          <Typography id="password"
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="password"
            mb="5px"
          >
            Password
          </Typography>
          <CustomTextField
            type="password"
            variant="outlined"
            fullWidth
            value={loginCreds.password}
            onChange={(e: any) => setLoginCreds({...loginCreds, password: e.target.value})}
          />
        </Box>
        <Stack
          justifyContent="end"
          direction="row"
          alignItems="center"
          my={2}
        >
          {/*<FormGroup>
            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label="Remember this Device"
            />
        </FormGroup>*/}
          <Typography
            component={Link}
            href="/authentication/forgot"
            fontWeight="500"
            sx={{
              textDecoration: "none",
              color: "primary.main",
            }}
          >
            Forgot Password ?
          </Typography>
        </Stack>
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
          Sign In
        </Button>
      </Box>
      {subtitle}
    </>
  );
}
export default AuthLogin;
