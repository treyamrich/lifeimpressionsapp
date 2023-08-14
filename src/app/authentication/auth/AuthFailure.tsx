import React from "react";
import Link from "next/link";
import {
  Typography,
  Box,
  Button
} from "@mui/material";

interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}

const AuthFailure = ({ title, subtitle, subtext }: loginType) => {
  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}
      <Box>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          component={Link} href="/authentication/login"
          type="submit"
        >
          Retry login
        </Button>
      </Box>
      {subtitle}
    </>
  );
}
export default AuthFailure;
