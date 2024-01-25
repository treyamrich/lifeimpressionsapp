// jest.mock("@/dynamodb-transactions/dynamodb", () => ({
//   createDynamoDBObj: jest.fn(),
// }));

// jest.mock("@aws-sdk/client-dynamodb", () => ({
//     DynamoDBClient: jest.fn(),
// }));

import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { assembleCreateOrderTransactionStatements } from "@/dynamodb-transactions/create-order-transaction";
import { co, coWithNulls, po, tshirtOrders } from './__fixtures__/create-order-fixtures';
import { compileUpdateStatement, toJson } from "./__fixtures__/json-parsing";
import { CustomerOrder, PurchaseOrder, TShirtOrder } from "@/API";
import { filterGeneratedFields } from "./__fixtures__/util";

const tshirtOrder1 = tshirtOrders[0];
const tshirtOrder2 = tshirtOrders[1];

describe("Create Order Transaction", () => {
  describe("Purchase Order", () => {
    // Should only have 1 Purchase order statement and 2 TShirtOrder statements
    it("should return the statements in the correct order", () => {
      const statements = assembleCreateOrderTransactionStatements(po, EntityType.PurchaseOrder, false).map(toJson);
      const insertOrderStatement = statements[0];
      const insertTShirtOrderStatement = statements[1];
      const insertTShirtOrderStatement2 = statements[2];

      filterGeneratedFields(insertOrderStatement).forEach(key => {
        expect(insertOrderStatement[key]).toBe(po[key as keyof PurchaseOrder]?.toString());
      })
      filterGeneratedFields(insertTShirtOrderStatement).forEach(key => {
        expect(insertTShirtOrderStatement[key]).toBe(tshirtOrder1[key as keyof TShirtOrder]?.toString());
      })
      filterGeneratedFields(insertTShirtOrderStatement2).forEach(key => {
        expect(insertTShirtOrderStatement2[key]).toBe(tshirtOrder2[key as keyof TShirtOrder]?.toString());
      })
    });
  });

  describe("Customer Order", () => {
    it("should have null in the CO fields orderNotes, customerEmail, customerPhoneNumber when empty string is passed", () => {
      const statements = assembleCreateOrderTransactionStatements(coWithNulls, EntityType.CustomerOrder, false);
      const insertOrderStatement = toJson(statements[0]);
      filterGeneratedFields(insertOrderStatement).forEach(key => {
        // These values should've become NULL accroding to dynamodb
        if (["orderNotes", "customerEmail", "customerPhoneNumber"].includes(key)) {
          expect(insertOrderStatement[key]).toBe("true");
          return
        }
        expect(insertOrderStatement[key]).toBe(coWithNulls[key as keyof CustomerOrder]?.toString());
      })
    });

    it("should return correct statements for the CO and TShirtOrder objects", () => {
      const statements = assembleCreateOrderTransactionStatements(co, EntityType.CustomerOrder, false);
      const insertOrderStatement = toJson(statements[0]);
      const insertTshirtOrderStatement = toJson(statements[2]);
      const insertTshirtOrderStatement2 = toJson(statements[4]);


      filterGeneratedFields(insertOrderStatement).forEach(key => {
        expect(insertOrderStatement[key]).toBe(co[key as keyof CustomerOrder]?.toString());
      })

      filterGeneratedFields(insertTshirtOrderStatement).forEach(key => {
        expect(insertTshirtOrderStatement[key]).toBe(tshirtOrder1[key as keyof TShirtOrder]?.toString());
      })

      filterGeneratedFields(insertTshirtOrderStatement2).forEach(key => {
        expect(insertTshirtOrderStatement2[key]).toBe(tshirtOrder2[key as keyof TShirtOrder]?.toString());
      })
    });

    it("should ONLY decrement from the TShirt table", () => {
      const statements =
        assembleCreateOrderTransactionStatements(co, EntityType.CustomerOrder, true)
          .map(compileUpdateStatement);
      const updateTshirtStatements = [statements[1], statements[3]];

      updateTshirtStatements.map((compiledStatement, index) => {
        const cleanedLines = compiledStatement
          .split('\n')
          .map(x => x.trim())
          .filter(x => x != "")

        let hadQtyOnHandLine = false;
        cleanedLines.forEach(line => {
          if(line.includes("quantityOnHand")) {
            hadQtyOnHandLine = true;

            const searchStr = "quantityOnHand + "
            let qtyUpdateStr = line.substring(line.indexOf(searchStr) + searchStr.length);
            let qtyUpdate = parseInt(qtyUpdateStr);

            expect(qtyUpdate < 0).toBeTruthy();
            expect(qtyUpdate).toBe(-tshirtOrders[index].quantity);
          }
        })
        expect(hadQtyOnHandLine).toBeTruthy();
      })
    });

    it("should contain a quantity guard when allowNegativeInventory is false", () => {
      const statements =
        assembleCreateOrderTransactionStatements(co, EntityType.CustomerOrder, false)
          .map(compileUpdateStatement);
      const updateTshirtStatements = [statements[1], statements[3]];

      updateTshirtStatements.map((compiledStatement, index) => {
        const cleanedLines = compiledStatement
          .split('\n')
          .map(x => x.trim())
          .filter(x => x != "")
        let hadANDLine = false;
        cleanedLines.forEach(line => {
          if(line.includes("AND")) {
            hadANDLine = true;
            const searchStr = "quantityOnHand >= "
            let qtyConditionStr = line.substring(line.indexOf(searchStr) + searchStr.length);
            let qtyCondition = parseInt(qtyConditionStr);

            expect(qtyCondition).toBe(tshirtOrders[index].quantity);
          }
        })
        expect(hadANDLine).toBeTruthy();
      })
    });
  })
});
