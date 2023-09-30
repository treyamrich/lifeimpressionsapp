"use client";

import { POStatus, PurchaseOrder } from "@/API";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { getPurchaseOrderAPI } from "@/app/graphql-helpers/fetch-apis";
import { DBOperationError, defaultDBOperationError } from "@/app/graphql-helpers/graphql-errors";

import { Typography, Grid, CardContent, Alert } from "@mui/material";
import { useState, useEffect } from "react";

type ViewPurchaseOrderProps = {
    params: { id: string }
};

const ViewPurchaseOrder = ({ params }: ViewPurchaseOrderProps) => {
    const { id } = params;
    const [po, setPo] = useState<PurchaseOrder>({} as PurchaseOrder);
    const [dbOperationError, setDBOperationError] = useState({
        ...defaultDBOperationError,
    } as DBOperationError);


    const fetchPurchaseOrder = async () => {
        const res = await getPurchaseOrderAPI({ id });
        setPo(res as PurchaseOrder);
    }
    useEffect(() => {
        fetchPurchaseOrder();
    }, []);
    return (
        <PageContainer title="Purchase Orders" description="this is Purchase Orders page">
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
            <DashboardCard title="View Purchase Order">
                <p>{id}</p>
            </DashboardCard>
        </PageContainer>
    );
};

export default ViewPurchaseOrder;
