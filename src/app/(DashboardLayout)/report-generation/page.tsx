"use client";

import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import PageContainer from "../components/container/PageContainer";
import GenerateReportForm, { FormState, ReportType } from "./GenerateReportForm";
import { CacheExpiration, InventoryValueCache, TShirtOrder } from "../../../API";
import { handleHighLevelReportRequest } from "./report-requests";
import { downloadDetailedReport, downloadHighLevelReport, downloadInventoryValueCSV } from "./report-downloads";
import { DBOperation, useDBOperationContext } from "@/contexts/DBErrorContext";
import { getTodayInSetTz, toReadableDateTime } from "@/utils/datetimeConversions";
import { OrderTotal, calculateOrderTotal } from "@/utils/orderTotal";
import { getCacheExpirationAPI, getInventoryValueAPI } from "@/graphql-helpers/get-apis";

export interface Order {
  __typename: string;
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  taxRate: number;
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
    let today = toReadableDateTime(getTodayInSetTz().toString())
    const showDeletedOrderColumn = form.includeDeletedCOs || form.includeDeletedPOs;
    switch(form.reportType) {
      case ReportType.Detailed:
        downloadDetailedReport([], today, showDeletedOrderColumn)
        break
      default:
        const orders = await handleHighLevelReportRequest(form, rescueDBOperationBatch);
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
      () => getCacheExpirationAPI(),
      DBOperation.GET,
      (resp: CacheExpiration) => {
        // is not datetime; assumes form YYYY-MM-DD
        let earliestExpiredDate = resp.earliestExpiredDate ?? '';
        
        if(earliestExpiredDate !== '' && earliestExpiredDate <= createdAt)
          throw new Error(`This report for ${form.yearAndMonth.format('ll')} is expired due to modifications to orders in the past.`)
        
        rescueDBOperation(
          () => getInventoryValueAPI({createdAt}),
          DBOperation.GET,
          (resp: InventoryValueCache) => {
            downloadInventoryValueCSV(resp);
          }
        )
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
