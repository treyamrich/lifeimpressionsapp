import { UpdateOrderTransactionInput } from "@/dynamodb-transactions/update-tshirt-order/update-tshirt-order-transaction";
import { getDummyTShirtOrder } from "./__fixtures__/create-order-fixtures";
import { getDecreasePOItemStatement, getIncreasePOItemStatement } from "@/dynamodb-transactions/update-tshirt-order/get-update-po-statement";
import { POReceival } from "@/API";
import { fromAttrVals } from "@/dynamodb-transactions/util";
import { getUpdateTShirtOrderTablePartiQL } from "@/dynamodb-transactions/partiql-helpers";

type UpdatePOResult = { poReceivals: POReceival[], earliestTShirtOrderDate: string }

describe("Update PO Item", () => {

    const getPOReceival = ({
        quantity = 0,
        timestamp = ''
    }): POReceival => ({
        __typename: 'POReceival', 
        quantity: quantity, 
        timestamp: timestamp
    })

    const receivals = [
        getPOReceival({ quantity: 5, timestamp: '2020-01-01T10:10:10Z'}),
        getPOReceival({ quantity: 3, timestamp: '2020-01-01T10:10:12Z'}),
        getPOReceival({ quantity: 2, timestamp: '2020-01-01T10:10:14Z'}),
    ]

    const getTShirtOrder = (tshirtOrder = {}, arr = receivals) => getDummyTShirtOrder(tshirtOrder, [...arr]);

    const decreaseTestHelper = (amtRecvDelta: number): UpdatePOResult => {
        let updatedTShirtOrder = getTShirtOrder();
        let res = getDecreasePOItemStatement(updatedTShirtOrder, amtRecvDelta);
        updatedTShirtOrder.receivals = res.newPOReceivals;
        let statement = getUpdateTShirtOrderTablePartiQL(updatedTShirtOrder);
        let poReceivals = fromAttrVals(statement.Parameters![3]['L']) ?? [];
        let earliestTShirtOrderDate = res.earliestTShirtOrderDate;
        return { poReceivals, earliestTShirtOrderDate }
    }

    describe('Decrease PO qty received', () => {
        it("should remove all receivals", () => {
            let amtRecvDelta = -10;
            const { earliestTShirtOrderDate, poReceivals } = decreaseTestHelper(amtRecvDelta)
            expect(poReceivals.length).toBe(0)
            expect(earliestTShirtOrderDate).toBe(receivals[0].timestamp)
        })

        it("should remove the last receival when the qty becomes 0", () => {
            let amtRecvDelta = -2;
            const { earliestTShirtOrderDate, poReceivals } = decreaseTestHelper(amtRecvDelta)
            expect(poReceivals.length).toBe(2)
            expect(earliestTShirtOrderDate).toBe(receivals[2].timestamp)
            expect(poReceivals[1].quantity).toBe(3)
        })

        it("should update the last receival when more than one receivals remain", () => {
            let amtRecvDelta = -3;
            const { earliestTShirtOrderDate, poReceivals } = decreaseTestHelper(amtRecvDelta)
            expect(poReceivals.length).toBe(2)
            expect(earliestTShirtOrderDate).toBe(receivals[1].timestamp)
            expect(poReceivals[1].quantity).toBe(2)
        })

        it("should update the receival when there is 1 receival obj left", () => {
            let amtRecvDelta = -6;
            const { earliestTShirtOrderDate, poReceivals } = decreaseTestHelper(amtRecvDelta)
            expect(poReceivals.length).toBe(1)
            expect(earliestTShirtOrderDate).toBe(receivals[0].timestamp)
            expect(poReceivals[0].quantity).toBe(4)
        })
    })

    const increaseTestHelper = (
        amtRecvDelta: number, 
        receivedAtDatetime: string,
        updatedTShirtOrder = getTShirtOrder()): UpdatePOResult => {
        let res = getIncreasePOItemStatement(updatedTShirtOrder, amtRecvDelta, receivedAtDatetime);
        updatedTShirtOrder.receivals = res.newPOReceivals;
        let statement = getUpdateTShirtOrderTablePartiQL(updatedTShirtOrder);
        let poReceivals = fromAttrVals(statement.Parameters![3]['L']) ?? [];
        let earliestTShirtOrderDate = res.earliestTShirtOrderDate;
        return { poReceivals, earliestTShirtOrderDate }
    }

    describe('Increase PO qty received', () => {
        it("should create a new list and add a new receival when the list is null", () => {
            let receivedAtDatetime = '2020-01-01T10:10:13Z'
            let amtRecvDelta = 5;
            const { earliestTShirtOrderDate, poReceivals } = 
                increaseTestHelper(
                    amtRecvDelta,
                    receivedAtDatetime,
                    getDummyTShirtOrder({}, null)
                )
            expect(poReceivals.length).toBe(1);
            expect(earliestTShirtOrderDate).toBe(receivedAtDatetime);
            expect(poReceivals[0].quantity).toBe(amtRecvDelta);
        })
        it("should add in the middle of the receival array", () => {
            let receivedAtDatetime = '2020-01-01T10:10:13Z'
            let amtRecvDelta = 5;
            const { earliestTShirtOrderDate, poReceivals } = 
                increaseTestHelper(
                    amtRecvDelta,
                    receivedAtDatetime
                )
            expect(poReceivals.length).toBe(receivals.length + 1);
            expect(earliestTShirtOrderDate).toBe(receivedAtDatetime);
            expect(poReceivals[2].quantity).toBe(amtRecvDelta);
        })
        it("should add at the end of the receival array", () => {
            let receivedAtDatetime = '2020-01-01T10:10:15Z'
            let amtRecvDelta = 5;
            const { earliestTShirtOrderDate, poReceivals } = 
                increaseTestHelper(
                    amtRecvDelta,
                    receivedAtDatetime
                )
            expect(poReceivals.length).toBe(receivals.length + 1);
            expect(earliestTShirtOrderDate).toBe(receivedAtDatetime);
            expect(poReceivals[3].quantity).toBe(amtRecvDelta);
        })
    })
})