"use client";

import { ModelOrderChangeFilterInput, OrderChange } from "@/API";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { Grid } from "@mui/material";
import React, { useState } from "react";
import Section from "../components/po-customer-order-shared-components/ViewOrderHeader/Section";
import OrderChangeHistory from "../components/po-customer-order-shared-components/OrderChangeHistory/OrderChangeHistory";
import InventoryTable from "./InventoryTable/InventoryTable";
import { listOrderChangeHistoryAPI } from "@/graphql-helpers/fetch-apis";

const InventoryPage = () => {
  const [editHistory, setEditHistory] = useState<OrderChange[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchChangeHistoryPaginationFn = (nextToken: string | null | undefined) => {
    const filter: ModelOrderChangeFilterInput = { 
      purchaseOrderChangeHistoryId: { attributeExists: false },
      customerOrderChangeHistoryId: { attributeExists: false },
    };
    return listOrderChangeHistoryAPI({ filters: filter, nextToken: nextToken });
  }

  return (
    <PageContainer title="Inventory" description="this is Inventory">
      <DashboardCard title="Inventory">
        <Grid container rowSpacing={5} columnSpacing={5}>
          <Section header="Items" columnWidth={12}>
            <InventoryTable
              editHistory={editHistory}
              setEditHistory={setEditHistory}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </Section>
          <Section header="Change History" columnWidth={12}>
            <OrderChangeHistory
              changeHistory={editHistory}
              paginationProps={{
                fetchChangeHistoryPaginationFn: fetchChangeHistoryPaginationFn,
                setChangeHistory: setEditHistory,
                setIsLoading: setIsLoading
              }}
            />
          </Section>
        </Grid>
      </DashboardCard>
    </PageContainer>
  );
};

export default InventoryPage;
