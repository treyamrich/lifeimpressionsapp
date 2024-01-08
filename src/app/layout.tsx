"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import { AuthContextProvider } from "@/contexts/AuthContext";
import CssBaseline from "@mui/material/CssBaseline";
import { Amplify } from "aws-amplify";
import awsConfig from "../../src/aws-exports";
import { ReactElement } from "react";
import { DBOperationContextProvider } from "@/contexts/DBErrorContext";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Amplify.configure({ ...awsConfig, ssr: true });
Amplify.configure(awsConfig);

type Props = {
  children: ReactElement
}

export default function RootLayout({
  children
}: Props) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>
          <DBOperationContextProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <ThemeProvider theme={baselightTheme}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                {children}
              </ThemeProvider>
            </LocalizationProvider>
          </DBOperationContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
