"use client";

import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import PageContainer from '../components/container/PageContainer';
import { Grid } from '@mui/material';
import GenerateReportForm, { FormState } from './GenerateReportForm';
import Section from '../components/po-customer-order-shared-components/ViewOrderHeader/Section';
import { TShirtOrder } from '../../../API';
import { useState } from 'react';
import { handleReportRequest } from './util';
import ViewReport from './ViewReport/ViewReport';
import dayjs from 'dayjs';
import { useDBOperationContext } from '@/contexts/DBErrorContext';

export interface Order {
    __typename: string;
    id: string;
    orderNumber: string;
    createdAt: string;
    updatedAt: string;
    taxRate: number;
    discount: number;
    orderedItems: TShirtOrder[];
}

const ReportGeneration = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const { rescueDBOperationBatch } = useDBOperationContext();

    const handleGenerateSubmission = async (form: FormState) => {
        const newOrders = await handleReportRequest(form, rescueDBOperationBatch);
        // Sorting by the date the order was placed
        newOrders.sort((a, b) => {
            let l, r
            l = dayjs(a.createdAt)
            r = dayjs(b.createdAt)
            if(l.isBefore(r)) return -1;
            if(l.isAfter(r)) return 1;
            return 0;
        })
        setOrders(newOrders);
    }

    return (
        <PageContainer
            title="Report Generation"
            description={`this is the report generation page`}
        >
            <DashboardCard title="Generate Report">
                <Grid container rowSpacing={5} columnSpacing={5}>
                    <Section header="Report Details" columnWidth={12}>
                        <GenerateReportForm onSubmit={handleGenerateSubmission} />
                    </Section>

                    <Section header="Report" columnWidth={12}>
                        <ViewReport orders={orders} />
                    </Section>
                </Grid>
            </DashboardCard>
        </PageContainer>
    );
}

export default ReportGeneration;