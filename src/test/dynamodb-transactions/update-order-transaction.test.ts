import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { assembleUpdateOrderTransactionStatements } from "@/dynamodb-transactions/update-order-transaction";
import { negativeUpdateOrderInput, updateOrderInput } from "./__fixtures__/update-order-fixtures";
import { DBOperation } from "@/contexts/DBErrorContext";
import { compileUpdateStatement, toJson } from "./__fixtures__/json-parsing";
import { OrderChange } from "@/API";
import { ParameterizedStatement } from "@aws-sdk/client-dynamodb";

const getUpdateStatementLines = (statements: ParameterizedStatement[]): string[][] => statements
    .map(compileUpdateStatement)
    .map(compiledStatement =>
        compiledStatement
            .split('\n')
            .map(x => x.trim())
            .filter(x => x != "")
    )

describe("Update Order Transaction", () => {

    describe("Order Change Record Creation", () => {
        it("should insert a PurchaseOrderChange record and return the record locally", () => {
            const { transactionStatements, response } = assembleUpdateOrderTransactionStatements(updateOrderInput, DBOperation.UPDATE, EntityType.PurchaseOrder, false);
            const insertOrderChangeStatement = transactionStatements[3];

            const json = toJson(insertOrderChangeStatement) as OrderChange;
            expect(json.orderedQuantityChange).toBe(updateOrderInput.orderedQtyDelta?.toString());
            expect(json.quantityChange).toBe(updateOrderInput.tshirtTableQtyDelta.toString());
            expect(json.reason).toBe(updateOrderInput.createOrderChangeInput.reason);

            const orderChange = response?.orderChange;
            const newTShirtOrderId = response?.newTShirtOrderId;
            const orderUpdatedAtTimestamp = response?.orderUpdatedAtTimestamp;
            expect(orderChange).toBeDefined();
            expect(newTShirtOrderId).toBeUndefined(); // due to the DBOperation.UPDATE
            expect(orderUpdatedAtTimestamp).toBeDefined();
            expect(orderChange?.reason).toBe(updateOrderInput.createOrderChangeInput.reason);
            expect(orderChange?.orderedQuantityChange).toBe(updateOrderInput.orderedQtyDelta);
        })

        it("should insert a CustomerOrderChange record and return the record locally", () => {
            const { transactionStatements, response } = assembleUpdateOrderTransactionStatements(updateOrderInput, DBOperation.CREATE, EntityType.CustomerOrder, false);
            const insertOrderChangeStatement = transactionStatements[3];

            const json = toJson(insertOrderChangeStatement) as OrderChange;
            // The tshirt table's quantity should be decremented and reflected in the order change
            expect(json.orderedQuantityChange).toBe(updateOrderInput.tshirtTableQtyDelta.toString());
            expect(json.reason).toBe(updateOrderInput.createOrderChangeInput.reason);

            const orderChange = response?.orderChange;
            const newTShirtOrderId = response?.newTShirtOrderId;
            const orderUpdatedAtTimestamp = response?.orderUpdatedAtTimestamp;
            expect(orderChange).toBeDefined();
            expect(newTShirtOrderId).toBeDefined(); // due to the DBOperation.CREATE
            expect(orderUpdatedAtTimestamp).toBeDefined();
            expect(orderChange?.reason).toBe(updateOrderInput.createOrderChangeInput.reason);
            expect(orderChange?.orderedQuantityChange).toBe(updateOrderInput.tshirtTableQtyDelta);
        })
    })

    describe("TShirt, TShirtOrder, and Order Updates", () => {
        const tshirtLinePrefix = "quantityOnHand + ";
        const tshirtOrderLineQtyPrefix = "quantity + ";
        const tshirtOrderLineAmtRecvPrefix = "amountReceived + ";

        const extractLineVal = (partiqlLine: string, searchValPrefix: string): number => {
            let idx = partiqlLine.indexOf(searchValPrefix);
            let val = partiqlLine.substring(idx + searchValPrefix.length);
            return parseInt(val);
        }

        describe("Purchase Order", () => {
            let result = assembleUpdateOrderTransactionStatements(updateOrderInput, DBOperation.UPDATE, EntityType.PurchaseOrder, false);
            let compiledStatements = getUpdateStatementLines(result.transactionStatements);
            let updateTshirtStatement = compiledStatements[1];
            let updateTshirtOrderStatement = compiledStatements[2];

            it("should update the TShirtOrder table accordingly", () => {
                updateTshirtOrderStatement.forEach(line => {
                    // PO: quantity field is the amount ordered
                    // amount received field affects tshirt inventory (on hand count)
                    if (line.includes(tshirtOrderLineQtyPrefix)) {
                        let v = extractLineVal(line, tshirtOrderLineQtyPrefix);
                        expect(v).toBe(updateOrderInput.orderedQtyDelta);
                    } else if (line.includes(tshirtOrderLineAmtRecvPrefix)) {
                        let v = extractLineVal(line, tshirtOrderLineAmtRecvPrefix);
                        expect(v).toBe(updateOrderInput.tshirtTableQtyDelta);
                    }
                })
            })
            it("should add positive values (when positive) to the TShirt table qty column", () => {
                updateTshirtStatement.forEach(line => {
                    if (line.includes(tshirtLinePrefix)) {
                        let v = extractLineVal(line, tshirtLinePrefix)
                        expect(v > 0).toBeTruthy();
                    }
                })
            })
            it("should subtract values (when qty is negative) to the TShirt table qty column", () => {
                result = assembleUpdateOrderTransactionStatements(negativeUpdateOrderInput, DBOperation.UPDATE, EntityType.PurchaseOrder, false);
                compiledStatements = getUpdateStatementLines(result.transactionStatements);
                updateTshirtStatement = compiledStatements[1];

                let hadNegativeInventoryCondition = false;
                updateTshirtStatement.forEach(line => {
                    hadNegativeInventoryCondition = hadNegativeInventoryCondition || line.includes("and");

                    if (line.includes(tshirtLinePrefix)) {
                        let v = extractLineVal(line, tshirtLinePrefix)
                        expect(v < 0).toBeTruthy();
                    }
                })
                expect(hadNegativeInventoryCondition).toBeTruthy();
            })
        })

        describe("Customer Order", () => {
            let result = assembleUpdateOrderTransactionStatements(updateOrderInput, DBOperation.UPDATE, EntityType.CustomerOrder, false);
            let compiledStatements = getUpdateStatementLines(result.transactionStatements);
            let updateTshirtStatement = compiledStatements[1];
            let updateTshirtOrderStatement = compiledStatements[2];
            it("should update the TShirtOrder table accordingly", () => {
                updateTshirtOrderStatement.forEach(line => {
                    // CO: quantity field is the amount ordered and affects tshirt inventory (on hand count)
                    // amount received field is unused
                    if (line.includes(tshirtOrderLineQtyPrefix)) {
                        let v = extractLineVal(line, tshirtOrderLineQtyPrefix);
                        expect(v).toBe(updateOrderInput.tshirtTableQtyDelta);
                    } else if (line.includes(tshirtOrderLineAmtRecvPrefix)) {
                        let v = extractLineVal(line, tshirtOrderLineAmtRecvPrefix);
                        expect(v).toBe(0);
                    }
                })
            })
            it("should invert qty updates from + to - when updating the TShirt table quantityOnHand column", () => {
                let hadNegativeInventoryCondition = false;
                updateTshirtStatement.forEach(line => {
                    hadNegativeInventoryCondition = hadNegativeInventoryCondition || line.includes("and");
                    if (line.includes(tshirtLinePrefix)) {
                        let v = extractLineVal(line, tshirtLinePrefix)
                        expect(v < 0).toBeTruthy();
                    }
                })
                expect(hadNegativeInventoryCondition).toBeTruthy();
            })
            it("should invert qty updates from - to + when updating the TShirt table quantityOnHand column", () => {
                result = assembleUpdateOrderTransactionStatements(negativeUpdateOrderInput, DBOperation.UPDATE, EntityType.CustomerOrder, false);
                compiledStatements = getUpdateStatementLines(result.transactionStatements);
                updateTshirtStatement = compiledStatements[1];
                updateTshirtStatement.forEach(line => {
                    if (line.includes(tshirtLinePrefix)) {
                        let v = extractLineVal(line, tshirtLinePrefix)
                        expect(v > 0).toBeTruthy();
                    }
                })
            })
        })

        describe("Both CO and PO", () => {
            it("should update the Order updatedAt timestamp", () => {
                const result = assembleUpdateOrderTransactionStatements(updateOrderInput, DBOperation.UPDATE, EntityType.PurchaseOrder, true);
                const compiledStatements = getUpdateStatementLines(result.transactionStatements);
                const updateOrderStatement = compiledStatements[0];

                let hadUpdatedAt = false;
                updateOrderStatement.forEach(line => {
                    if (line.includes("updatedAt")) hadUpdatedAt = true;
                })
                expect(hadUpdatedAt).toBeTruthy();
            })
        })
    })
})