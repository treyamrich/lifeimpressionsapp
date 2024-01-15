import { render } from '@testing-library/react'
import { ThemeProvider } from "@mui/material/styles";
import { AuthContextProvider } from "@/contexts/AuthContext";
import CssBaseline from "@mui/material/CssBaseline";
import { DBOperationContextProvider } from "@/contexts/DBErrorContext";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { baselightTheme } from '@/utils/theme/DefaultColors';

export const renderWithProviders = async (children: React.ReactElement) => {
    return render(
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
    )
}