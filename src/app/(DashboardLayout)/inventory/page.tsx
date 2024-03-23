"use client";

import { ModelOrderChangeFilterInput, OrderChange } from "@/API";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { Grid } from "@mui/material";
import React, { useState } from "react";
import Section from "../components/po-customer-order-shared-components/ViewOrderHeader/Section";
import OrderChangeHistory from "../components/po-customer-order-shared-components/OrderChangeHistory/OrderChangeHistory";
import InventoryTable from "./InventoryTable/InventoryTable";
import { listOrderChangeHistoryAPI } from "@/graphql-helpers/list-apis";

const InventoryPage = () => {
  const [editHistory, setEditHistory] = useState<OrderChange[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(false);
  const [isLoadingOrderChanges, setIsLoadingOrderChanges] = useState<boolean>(false);

  const fetchChangeHistoryPaginationFn = (nextToken: string | null | undefined) => {
    return listOrderChangeHistoryAPI({ nextToken: nextToken, indexPartitionKey: 'InventoryChange' });
  }

  return (
    <PageContainer title="Inventory" description="this is Inventory">
      <DashboardCard title="Inventory">
        <Grid container rowSpacing={5} columnSpacing={5}>
          <Section header="Items" columnWidth={12}>
            <InventoryTable
              editHistory={editHistory}
              setEditHistory={setEditHistory}
              isLoading={isLoadingInventory}
              setIsLoading={setIsLoadingInventory}
            />
          </Section>
          <Section header="Change History" columnWidth={12}>
            <OrderChangeHistory
              changeHistory={editHistory}
              paginationProps={{
                fetchChangeHistoryPaginationFn: fetchChangeHistoryPaginationFn,
                setChangeHistory: setEditHistory,
                setIsLoading: setIsLoadingOrderChanges
              }}
              isLoading={isLoadingOrderChanges}
            />
          </Section>
        </Grid>
      </DashboardCard>
    </PageContainer>
  );
};

export default InventoryPage;
