"use client";

import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import PageContainer from "../components/container/PageContainer";
import GenerateReportForm, { FormState, ReportType } from "./GenerateReportForm";
import { InventoryValueCache, TShirtOrder } from "../../../API";
import { downloadDetailedReport, downloadHighLevelReport, downloadInventoryValueCSV, handleOrderReportRequest } from "./util";
import dayjs from "dayjs";
import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";
import { getTodayInSetTz, toReadableDateTime } from "@/utils/datetimeConversions";
import { OrderTotal, calculateOrderTotal } from "@/utils/orderTotal";
import { getInventoryValueAPI } from "@/graphql-helpers/fetch-apis";

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
  const { rescueDBOperationBatch, rescueDBOperation } = useDBOperationContext();

  const handleGenerateSubmission = (form: FormState) => {
    if(form.reportType === ReportType.InventoryValue) {
      handleInventoryValueReport(form);
      return;
    }
    handleOrderReports(form);
  };

  const handleOrderReports = async (form: FormState) => {
    const orders = await handleOrderReportRequest(form, rescueDBOperationBatch);

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
  }

  const handleInventoryValueReport = async (form: FormState) => {
    const createdAt = form.yearAndMonth.format('YYYY-MM-DD');
    rescueDBOperation(
      () => getInventoryValueAPI({createdAt}),
      DBOperation.GET,
      (resp: InventoryValueCache) => {
        downloadInventoryValueCSV(resp);
      }
    )
  }

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
