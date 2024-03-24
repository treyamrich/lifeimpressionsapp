import { FormState, ReportType } from "./GenerateReportForm";
import { CacheExpiration, InventoryValueCache } from "../../../API";
import {
  handleDetailedReportRequest,
  handleHighLevelReportRequest,
} from "./report-requests";
import {
  downloadDetailedReport,
  downloadHighLevelReport,
  downloadInventoryValueCSV,
} from "./report-downloads";
import { AsyncBatchItem, DBOperation } from "@/contexts/DBErrorContext";
import {
  getTodayInSetTz,
  toReadableDateTime,
} from "@/utils/datetimeConversions";
import { OrderTotal, calculateOrderTotal } from "@/utils/orderTotal";
import {
  getCacheExpirationAPI,
  getInventoryValueAPI,
} from "@/graphql-helpers/get-apis";

export const handleGenerateSubmission = async (
  form: FormState,
  rescueDBOperation: (
    func: () => void,
    operation: DBOperation,
    onSuccess: any,
    customErrorMessage?: string | undefined
  ) => void,
  rescueDBOperationBatch: <T>(batchItems: AsyncBatchItem<T>[]) => Promise<void>
) => {
  if (form.reportType === ReportType.InventoryValue) {
    await handleInventoryValueReport(form, rescueDBOperation);
    return;
  }
  await handleOrderReports(form, rescueDBOperationBatch);
};

const handleOrderReports = async (
  form: FormState,
  rescueDBOperationBatch: <T>(batchItems: AsyncBatchItem<T>[]) => Promise<void>
) => {
  let today = toReadableDateTime(getTodayInSetTz().toString());
  const showDeletedOrderColumn =
    form.includeDeletedCOs || form.includeDeletedPOs;
  switch (form.reportType) {
    case ReportType.Detailed:
      const detailedOrders = await handleDetailedReportRequest(
        form,
        rescueDBOperationBatch
      );
      downloadDetailedReport(detailedOrders, today, showDeletedOrderColumn);
      break;
    default:
      const highLevelOrders = await handleHighLevelReportRequest(
        form,
        rescueDBOperationBatch
      );
      let orderIdToTotalMap = new Map<string, OrderTotal>(
        highLevelOrders.map((order) => {
          const total = calculateOrderTotal(order, order.orderedItems);
          return [order.id, total];
        })
      );
      downloadHighLevelReport(
        highLevelOrders,
        orderIdToTotalMap,
        today,
        showDeletedOrderColumn
      );
  }
};

const handleInventoryValueReport = async (
  form: FormState,
  rescueDBOperation: (
    func: () => void,
    operation: DBOperation,
    onSuccess: any,
    customErrorMessage?: string | undefined
  ) => void
) => {
  const createdAt = form.yearAndMonth.format("YYYY-MM-DD");

  rescueDBOperation(
    () => getCacheExpirationAPI(),
    DBOperation.GET,
    (resp: CacheExpiration) => {
      // is not datetime; assumes form YYYY-MM-DD
      let earliestExpiredDate = resp.earliestExpiredDate ?? "";

      if (earliestExpiredDate !== "" && earliestExpiredDate <= createdAt)
        throw new Error(
          `This report for ${form.yearAndMonth.format(
            "ll"
          )} is expired due to modifications to orders in the past.`
        );

      rescueDBOperation(
        () => getInventoryValueAPI({ createdAt }),
        DBOperation.GET,
        (resp: InventoryValueCache) => {
          downloadInventoryValueCSV(resp);
        }
      );
    }
  );
};
