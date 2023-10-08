"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import { AuthContextProvider } from "@/contexts/AuthContext";
import CssBaseline from "@mui/material/CssBaseline";
import { Amplify } from "aws-amplify";
import awsConfig from "../../src/aws-exports";
import ProtectedRoute from "./(DashboardLayout)/ProtectedRoute";
import { ReactElement } from "react";
import { DBOperationContextProvider } from "@/contexts/DBErrorContext";

if (typeof window !== "undefined") {
  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
  );

  const [
    productionRedirectSignIn,
    localRedirectSignIn
  ] = awsConfig.oauth.redirectSignIn.split(',');

  const [
    productionRedirectSignOut,
    localRedirectSignOut
  ] = awsConfig.oauth.redirectSignOut.split(',');

  const updatedAwsConfig = {
    ...awsConfig,
    oauth: {
      ...awsConfig.oauth,
      redirectSignIn: isLocalhost ? localRedirectSignIn : productionRedirectSignIn,
      redirectSignOut: isLocalhost ? localRedirectSignOut : productionRedirectSignOut,
    },
    ssr: true // for next.js
  }

  Amplify.configure(updatedAwsConfig);
}

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
            <ThemeProvider theme={baselightTheme}>
              {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
              <CssBaseline />
              <ProtectedRoute unprotectedRoutes={['/authentication/login', '/authentication/loggedin']}>
                {children}
              </ProtectedRoute>
            </ThemeProvider>
          </DBOperationContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
