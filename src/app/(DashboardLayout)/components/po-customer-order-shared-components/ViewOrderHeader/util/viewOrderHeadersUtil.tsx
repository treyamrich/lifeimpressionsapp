import { Grid, Typography } from "@mui/material";
import { ReactElement } from "react";

export const getTextField = (content: string) => (
    <Typography variant="body1" color="textSecondary">
        {content}
    </Typography>
);

export const getFieldWithHeader = (header: string, children: ReactElement, columnSize?: number) => (
    <Grid item xs={columnSize}>
        <Grid container direction="column" spacing={1}>
            <Grid item>
                <Typography variant="h6" color="textSecondary">
                    {header}
                </Typography>
            </Grid>
            <Grid item>
                {children}
            </Grid>
        </Grid>
    </Grid>
);