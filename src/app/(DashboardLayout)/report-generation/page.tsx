"use client";

import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import PageContainer from "../components/container/PageContainer";
import GenerateReportForm, { FormState, ReportType } from "./GenerateReportForm";
import { TShirtOrder } from "../../../API";
import { useState } from "react";
import { downloadDetailedReport, downloadHighLevelReport, handleReportRequest } from "./util";
import dayjs from "dayjs";
import { useDBOperationContext } from "@/contexts/DBErrorContext";
import { getTodayInSetTz, toReadableDateTime } from "@/utils/datetimeConversions";
import { OrderTotal, calculateOrderTotal } from "@/utils/orderTotal";

export interface Order {
  __typename: string;
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  taxRate: number;
  discount: number;
  orderedItems: TShirtOrder[];
  isDeleted?: boolean | null;
}

const ReportGeneration = () => {
  const { rescueDBOperationBatch } = useDBOperationContext();

  const handleGenerateSubmission = async (form: FormState) => {
    const orders = await handleReportRequest(form, rescueDBOperationBatch);
    // Sorting by the date the order was modified
    orders.sort((a, b) => {
      let l, r;
      l = dayjs(a.updatedAt);
      r = dayjs(b.updatedAt);
      if (l.isBefore(r)) return -1;
      if (l.isAfter(r)) return 1;
      return 0;
    });

    let today = toReadableDateTime(getTodayInSetTz().toString())
    const showDeletedOrderColumn = form.includeDeletedCOs || form.includeDeletedPOs;
    switch(form.reportType) {
        case ReportType.Detailed:
            downloadDetailedReport(orders, today, showDeletedOrderColumn)
            break
        default:
            let orderIdToTotalMap = new Map<string, OrderTotal>(
                orders.map(order => {
                    const total = calculateOrderTotal(order, order.orderedItems);
                    return [order.id, total]
                })
            );
            downloadHighLevelReport(orders, orderIdToTotalMap, today, showDeletedOrderColumn)
    }
  };

  return (
    <PageContainer
      title="Report Generation"
      description={`this is the report generation page`}
    >
      <DashboardCard title="Generate Report">
        <GenerateReportForm onSubmit={handleGenerateSubmission} />
      </DashboardCard>
    </PageContainer>
  );
};

export default ReportGeneration;
