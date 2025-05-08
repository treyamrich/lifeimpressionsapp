"use client";

import { OrderChange } from "@/API";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { Grid } from "@mui/material";
import React, { useState } from "react";
import Section from "../components/po-customer-order-shared-components/ViewOrderHeader/Section";
import OrderChangeHistory from "../components/po-customer-order-shared-components/OrderChangeHistory/OrderChangeHistory";
import InventoryTable from "./InventoryTable/InventoryTable";

const InventoryPage = () => {
  return (
    <PageContainer title="Inventory" description="this is Inventory">
      <DashboardCard title="Inventory">
        <Grid container rowSpacing={5} columnSpacing={5}>
          <Section header="Items" columnWidth={12}>
            <InventoryTable/>
          </Section>
          <Section header="Change History" columnWidth={12}>
            <></>
            <OrderChangeHistory
              entityType={undefined}
            />
          </Section>
        </Grid>
      </DashboardCard>
    </PageContainer>
  );
};

export default InventoryPage;
