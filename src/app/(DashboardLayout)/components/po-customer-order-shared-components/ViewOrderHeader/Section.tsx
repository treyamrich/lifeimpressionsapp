import { Grid, Stack, Typography } from "@mui/material"
import { ReactNode } from "react"

const DashboardSection = ({ header, children, columnWidth }: { 
    header: string; 
    children: ReactNode;
    columnWidth: number;
}) => (
    <Grid item xs={columnWidth}>
        <Stack
            sx={{
                width: "100%",
                minWidth: { xs: "300px", sm: "360px", md: "400px" },
                gap: "1rem",
            }}
        >
            <Typography variant="h6" color="textSecondary">
                {header}
            </Typography>
            {children}
        </Stack>
    </Grid>
)

export default DashboardSection