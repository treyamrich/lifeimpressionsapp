"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { Amplify } from "aws-amplify";
import awsConfig from "../../src/aws-exports";
import { ReactElement } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { AuthContextProvider } from "@/contexts/AuthContext";
import CssBaseline from "@mui/material/CssBaseline";
import { DBOperationContextProvider } from "@/contexts/DBErrorContext";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/api/hooks/query-client";

Amplify.configure({ ...awsConfig, ssr: true });

type Props = {
  children: ReactElement;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>
          <DBOperationContextProvider>
            <QueryClientProvider client={queryClient}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <ThemeProvider theme={baselightTheme}>
                  {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                  <CssBaseline />
                  {children}
                </ThemeProvider>
              </LocalizationProvider>
            </QueryClientProvider>
          </DBOperationContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
