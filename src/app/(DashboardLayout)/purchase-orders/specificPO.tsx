"use client";

import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";

import { Typography, Grid, CardContent } from "@mui/material";

const PurchaseOrders = () => {
  return (
    <PageContainer
      title="Purchase Orders"
      description="this is Purchase Orders"
    >
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <DashboardCard title="Purchase Orders">
            <Grid container spacing={3}>
              <Grid item sm={12}>
                <BlankCard>
                  <CardContent>
                    <Typography variant="h1">h1. Heading</Typography>
                    <Typography variant="body1" color="textSecondary">
                      font size: 30 | line-height: 45 | font weight: 500
                    </Typography>
                  </CardContent>
                </BlankCard>
              </Grid>
            </Grid>
          </DashboardCard>
        </Grid>
        <Grid item sm={12}>
          <DashboardCard title="Search Purchase Orders">
            <Grid container spacing={3}>
              <Grid item sm={12}>
                <BlankCard>
                  <CardContent>
                    <Typography variant="h1">h1. Heading</Typography>
                    <Typography variant="body1" color="textSecondary">
                      font size: 30 | line-height: 45 | font weight: 500
                    </Typography>
                  </CardContent>
                </BlankCard>
              </Grid>
            </Grid>
          </DashboardCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default PurchaseOrders;
