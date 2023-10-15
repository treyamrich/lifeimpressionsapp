"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { Alert } from "@mui/material";
import { ReactElement } from "react";

type Props = {
    children: ReactElement
}

const AuthLayout = ({
    children
}: Props) => {
    const { authError, setAuthError } = useAuthContext();
    return (
        <>
            {authError.errMsg !== "" && (
                <Alert
                    severity="error"
                    onClose={() => setAuthError({ errMsg: "" })}
                >
                    {authError.errMsg}
                </Alert>
            )}
            {children}
        </>
    );
}

export default AuthLayout;