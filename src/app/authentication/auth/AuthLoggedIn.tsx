import React from "react";
import {
  Typography,
} from "@mui/material";

interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}

const AuthLoggedIn = ({ title, subtitle, subtext }: loginType) => {
  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}
      {subtitle}
    </>
  );
}
export default AuthLoggedIn;
