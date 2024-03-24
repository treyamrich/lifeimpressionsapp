import { listTShirtOrdersAPI } from "@/graphql-helpers/list-apis";
import { TShirtOrder } from "@/API";
import { handleDetailedReportRequest } from "@/app/(DashboardLayout)/report-generation/report-requests";
import {
  buildFormState,
  buildOrderMinInfo,
  buildTShirtOrder,
} from "./fixtures";
import { rescueDBOperationBatch } from "@/contexts/db-context-funcs";
import { AsyncBatchItem } from "@/contexts/DBErrorContext";
import { getOrderMinInfoAPI } from "@/graphql-helpers/get-apis";
import { OrderMinInfo } from "@/my-graphql-queries/types";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";

jest.mock("@/graphql-helpers/list-apis", () => ({
  listTShirtOrdersAPI: jest.fn(),
}));

jest.mock("@/graphql-helpers/get-apis", () => ({
  getOrderMinInfoAPI: jest.fn(),
}));

function rescueDBOperationBatchMock<T>(
  batchItems: AsyncBatchItem<T>[],
  customMasterErrMsg?: string | undefined
) {
  return rescueDBOperationBatch(() => {}, batchItems, customMasterErrMsg);
}

const setMockListResp = (orderItems: TShirtOrder[] = []) => {
  (listTShirtOrdersAPI as jest.Mock).mockResolvedValue({
    result: orderItems,
    nextToken: null,
  });
};

const setMockGetResp = (x: OrderMinInfo) => {
  (getOrderMinInfoAPI as jest.Mock).mockResolvedValueOnce(x);
};

describe("Report Generation Requests", () => {

  describe("Handle Detailed Report Request", () => {
    beforeEach(jest.clearAllMocks);
    const num_orders = 10;
    const num_items_per_order = 5;

    const setupMocks = (otherOrderItems: TShirtOrder[] = []) => {
      const getOrderType = (i: number) =>
        i % 2 == 0 ? EntityType.PurchaseOrder : EntityType.CustomerOrder;
      const orders = [];
      const tshirtOrder = [];
      for (let i = 0; i < num_orders; i++) {
        orders.push(buildOrderMinInfo(i.toString(), getOrderType(i)));
        for (let j = 0; j < num_items_per_order; j++) {
          tshirtOrder.push(
            buildTShirtOrder(i.toString(), `${i},${j}`, getOrderType(i))
          );
        }
      }
      otherOrderItems.forEach(oi => tshirtOrder.push(oi))
      orders.forEach((o) => setMockGetResp(o));
      setMockListResp(tshirtOrder);
    };

    it("should not display any transactions", async () => {
      setMockListResp([]);
      const form = buildFormState({});
      const res = await handleDetailedReportRequest(
        form,
        rescueDBOperationBatchMock
      );
      expect(res.length).toBe(0);
    });

    it("should not contain any adjustment transactions", async () => {
      setupMocks();
      const form = buildFormState({});
      const res = await handleDetailedReportRequest(
        form,
        rescueDBOperationBatchMock
      );

      expect(res.length).toBe(num_orders);
      res.forEach(o => {
        expect(o.orderedItems.length).toBe(num_items_per_order)
        o.orderedItems.forEach((i, idx) => {
            expect(i.id).toBe(`${o.id},${idx}`)
        })
      })
      res.forEach((v) => expect(v.__typename !== "Adjustment").toBeTruthy());
    });

    it("should contain 5 adjustment transactions", async () => {
        let adjustments = [];
        for (let i = 0; i < 5; i++) {
            adjustments.push(buildTShirtOrder(`adj-${i}`, `adj-${i}`));
        }
        setupMocks(adjustments);
        const form = buildFormState({});
        const res = await handleDetailedReportRequest(
          form,
          rescueDBOperationBatchMock
        );
  
        expect(res.length).toBe(num_orders + adjustments.length);
        const adjCount = res.reduce((total, curr) => 
            total + (curr.__typename === 'Adjustment' ? 1 : 0), 0)
        expect(adjCount).toBe(adjustments.length);
        expect(listTShirtOrdersAPI).toHaveBeenCalledTimes(1);
        expect(getOrderMinInfoAPI).toHaveBeenCalledTimes(num_orders)
      });
  });
});
