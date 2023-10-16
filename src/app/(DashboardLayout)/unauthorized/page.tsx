"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { Button, Grid, Typography } from "@mui/material";

const Unauthorized = () => {
    const { logout } = useAuthContext();
    return (
        <Grid container direction="column">
            <Grid item>
                <Typography>
                    Unauthorized
                </Typography>
            </Grid>
            <Grid item>
                <Button
                    id="to-login-button"
                    onClick={logout}
                >
                    Back to login
                </Button>
            </Grid>
        </Grid>
    )
}

export default Unauthorized;