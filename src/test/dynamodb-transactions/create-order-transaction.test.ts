// jest.mock("@/dynamodb-transactions/dynamodb", () => ({
//   createDynamoDBObj: jest.fn(),
// }));

// jest.mock("@aws-sdk/client-dynamodb", () => ({
//     DynamoDBClient: jest.fn(),
// }));

import { POStatus, PurchaseOrder } from "@/API";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { assembleCreateOrderTransactionStatements } from "@/dynamodb-transactions/create-order-transaction";

const po: PurchaseOrder = {
    __typename: "PurchaseOrder",
    id: '',
    orderNumber: "123",
    vendor: "Adidas",
    orderedItems: [] as any,
    status: POStatus.Open,
    changeHistory: null,
    createdAt: '',
    updatedAt: '',
};

describe("Create Order Transaction", () => {
  it("should succeed with Purchase Orders", () => {
    assembleCreateOrderTransactionStatements(po, EntityType.PurchaseOrder, false);
  });
});
