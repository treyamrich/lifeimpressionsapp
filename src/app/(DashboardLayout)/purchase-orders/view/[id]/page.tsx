"use client";

import { PurchaseOrder, TShirtOrder } from "@/API";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import TShirtOrderTable from "@/app/(DashboardLayout)/components/tshirt-order-table/TShirtOrderTable";
import { getPurchaseOrderAPI } from "@/app/graphql-helpers/fetch-apis";
import {
  DBOperation,
  DBOperationError,
  defaultDBOperationError,
  rescueDBOperation,
} from "@/app/graphql-helpers/graphql-errors";

import { Typography, Grid, CardContent, Alert, Button } from "@mui/material";
import { useState, useEffect } from "react";
import ViewPOHeaderFields from "./ViewPOHeaders";

type ViewPurchaseOrderProps = {
  params: { id: string };
};

const ViewPurchaseOrder = ({ params }: ViewPurchaseOrderProps) => {
  const { id } = params;
  const [po, setPo] = useState<PurchaseOrder>({} as PurchaseOrder);
  const [updatedOrderedItems, setUpdatedOrderedItems] = useState<TShirtOrder[]>(
    () => {
      return po.orderedItems ? (po.orderedItems.items as TShirtOrder[]) : [];
    }
  );
  const [dbOperationError, setDBOperationError] = useState({
    ...defaultDBOperationError,
  } as DBOperationError);

  const fetchPurchaseOrder = () => {
    rescueDBOperation(
      () => getPurchaseOrderAPI({ id }),
      setDBOperationError,
      DBOperation.GET,
      (res: PurchaseOrder) => {
        setPo(res);
      }
    );
  };

  useEffect(() => {
    fetchPurchaseOrder();
  }, []);

  return (
    <PageContainer
      title="View Purchase Order"
      description="this is View Purchase Order"
    >
      {dbOperationError.errorMessage !== undefined ? (
        <Alert
          severity="error"
          onClose={() => setDBOperationError({ ...defaultDBOperationError })}
        >
          {dbOperationError.errorMessage}
        </Alert>
      ) : (
        <></>
      )}
      <DashboardCard title={`Purchase Order: ${po.orderNumber}`}>
        <Grid container spacing={3} direction="column" padding={2}>
          <Grid item>
            <ViewPOHeaderFields po={po} setPo={setPo} />
          </Grid>
          <Grid item>
            <OrderedItemsTable
              tableData={updatedOrderedItems}
              setTableData={setUpdatedOrderedItems}
            />
          </Grid>
        </Grid>
      </DashboardCard>
    </PageContainer>
  );
};

export default ViewPurchaseOrder;

type OrderedItemsTableProps = {
  tableData: TShirtOrder[];
  setTableData: React.Dispatch<React.SetStateAction<TShirtOrder[]>>;
};

const OrderedItemsTable = ({
  tableData,
  setTableData,
}: OrderedItemsTableProps) => {
  return (
    <BlankCard>
      <CardContent>
        <TShirtOrderTable tableData={tableData} setTableData={setTableData} />
      </CardContent>
    </BlankCard>
  );
};
