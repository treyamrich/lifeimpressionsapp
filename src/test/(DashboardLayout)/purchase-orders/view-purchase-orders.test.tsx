import {
  act,
  fireEvent,
  screen,
} from "@testing-library/react";
import { renderWithProviders } from "@/test/util/render";
import PurchaseOrders from "@/app/(DashboardLayout)/purchase-orders/page";
import { validPO } from "./view-purchase-orders.fixtures";
import { listPurchaseOrderAPI } from "@/graphql-helpers/fetch-apis";
import { ModelSortDirection } from "@/API";
import { mockNextRouterPush } from "../../../../setupTests";

jest.mock("@/graphql-helpers/fetch-apis", () => ({
  listPurchaseOrderAPI: jest.fn(),
}));

describe("View Purchase Orders", () => {
  afterEach(jest.clearAllMocks);
  (listPurchaseOrderAPI as jest.Mock).mockResolvedValue([]);

  describe("List Purchase Orders", () => {
    it("should display non-deleted purchase orders", async () => {
      (listPurchaseOrderAPI as jest.Mock).mockResolvedValueOnce([validPO]);
      await act(() => renderWithProviders(<PurchaseOrders />));
      const expectedElements = [
        screen.getByText("JDS"),
        screen.getByText("ValidPoOrderNum"),
      ];
      expectedElements.forEach((elm) => expect(elm).toBeInTheDocument());

      expect(screen.getByText("Purchase Orders")).toBeInTheDocument();

      expect(listPurchaseOrderAPI).toHaveBeenCalledWith(
        { isDeleted: { ne: true } },
        ModelSortDirection.DESC
      );
      expect(listPurchaseOrderAPI).toHaveBeenCalledTimes(1);
    });
    it("should display a message when no shirts are received", async () => {
      await act(() => renderWithProviders(<PurchaseOrders />));
      const expectedElements = [screen.getByText("No records to display")];
      expectedElements.forEach((elm) => expect(elm).toBeInTheDocument());
      expect(listPurchaseOrderAPI).toHaveBeenCalledTimes(1);
    });
  });

  describe("Go To 'Create Purchase Order' Page Button", () => {
    it("should link the user to the create purchase order page", async () => {
      await act(() => renderWithProviders(<PurchaseOrders />));
      const createPOButton = screen.getByText("Place New Purchase Order");
      fireEvent.click(createPOButton);
      expect(mockNextRouterPush).toHaveBeenCalledTimes(1);
      expect(mockNextRouterPush).toHaveBeenCalledWith("/purchase-orders/create");
    });
  });
  
  describe("Go To 'View Single Purchase Order' Page", () => {
    it("should link the user to the respective page with the PO id when clicking the record", async () => {
      (listPurchaseOrderAPI as jest.Mock).mockResolvedValueOnce([validPO]);
      await act(() => renderWithProviders(<PurchaseOrders />));
      const tableRow = screen.getByText("ValidPoOrderNum");
      fireEvent.click(tableRow);

      expect(mockNextRouterPush).toHaveBeenCalledTimes(1);
      expect(mockNextRouterPush).toHaveBeenCalledWith(`/purchase-orders/view/${validPO.id}`);
    });
  });
});
