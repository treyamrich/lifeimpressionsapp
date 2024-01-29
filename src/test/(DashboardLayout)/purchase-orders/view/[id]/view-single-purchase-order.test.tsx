import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/util/render";

import { mockNextRouterPush } from "../../../../../../setupTests";
import { updatePurchaseOrderAPI } from "@/graphql-helpers/update-apis";
import {
  getPurchaseOrderAPI,
  listTShirtAPI,
} from "@/graphql-helpers/fetch-apis";
import ViewPurchaseOrder from "@/app/(DashboardLayout)/purchase-orders/view/[id]/page";
import { validPO, validTShirts } from "./view-single-purchase-order.fixtures";
import { POStatus } from "@/API";

jest.mock("@/graphql-helpers/fetch-apis", () => ({
  getPurchaseOrderAPI: jest.fn(),
  listTShirtAPI: jest.fn(),
}));

jest.mock("@/graphql-helpers/update-apis", () => ({
  updatePurchaseOrderAPI: jest.fn(),
}));

describe("View Single PO page", () => {
  afterEach(jest.clearAllMocks);
  (getPurchaseOrderAPI as jest.Mock).mockResolvedValue(validPO);
  (listTShirtAPI as jest.Mock).mockResolvedValue(validTShirts);
  (updatePurchaseOrderAPI as jest.Mock).mockResolvedValue({});

  describe("Metadata header section", () => {
    it("should display the metadata info for the Purchase Order", async () => {
      await act(() =>
        renderWithProviders(<ViewPurchaseOrder params={{ id: validPO.id }} />)
      );
      let elm = screen.getByText("Purchase Order: " + validPO.orderNumber);
      expect(elm).toBeInTheDocument();

      elm = screen.getByText("Open");
      expect(elm).toBeInTheDocument();

      elm = screen.getByText(validPO.vendor);
      expect(elm).toBeInTheDocument();

      expect(listTShirtAPI).toHaveBeenCalledTimes(1);
      expect(listTShirtAPI).toHaveBeenCalledWith({ isDeleted: { ne: true } });

      expect(getPurchaseOrderAPI).toHaveBeenCalledTimes(1);
      expect(getPurchaseOrderAPI).toHaveBeenCalledWith({ id: validPO.id });
    });

    // Not testable because alert is used
    it.skip("should call the delete PO api on delete", async () => {
      await act(() =>
        renderWithProviders(<ViewPurchaseOrder params={{ id: validPO.id }} />)
      );

      const elm = screen.getByText("Delete Purchase Order");
      fireEvent.click(elm);

      expect(updatePurchaseOrderAPI).toHaveBeenCalledTimes(1);
      expect(updatePurchaseOrderAPI).toHaveBeenCalledWith({
        id: validPO.id,
        isDeleted: true,
      });
      expect(mockNextRouterPush).toHaveBeenCalledTimes(1);
      expect(mockNextRouterPush).toHaveBeenCalledWith("/purchase-orders/view");
    });

    it("should update the purchase order status to closed", async () => {
      await act(() =>
        renderWithProviders(<ViewPurchaseOrder params={{ id: validPO.id }} />)
      );
      act(() => {
        const elm = screen.getByText("Open");
        fireEvent.click(elm);
      });

      expect(updatePurchaseOrderAPI).toHaveBeenCalledTimes(1);
      // Component should modfiy the timestamps
      expect(updatePurchaseOrderAPI).toHaveBeenCalledWith({
        ...validPO,
        orderedItems: undefined,
        changeHistory: undefined,
        status: POStatus.Closed,
        createdAt: "2023-01-01T10:10:10",
        updatedAt: "2023-01-01T10:10:10",
      });

      waitFor(() => {
        const closedElm = screen.getByText(POStatus.Closed);
        expect(closedElm).toBeInTheDocument();
      });
    });
  });
});
