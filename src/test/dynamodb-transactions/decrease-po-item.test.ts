import { UpdateOrderTransactionInput } from "@/dynamodb-transactions/update-tshirt-order/update-tshirt-order-transaction";
import { getDummyTShirtOrder, po } from "./__fixtures__/create-order-fixtures";
import { getDecreasePOItemStatements } from "@/dynamodb-transactions/update-tshirt-order/decrease-po-statements";


describe("Decrease PO Item", () => {
    it("should succeed delete 2 items and update 1 item", () => {
        const changeTShirtId = 'some_id';
        let newPo = {...po};
        let defaultTShirtOrder = { tShirtOrderTshirtId: changeTShirtId };
        let updatedTShirtOrder = getDummyTShirtOrder({...defaultTShirtOrder, id: '0' });
        let newTShirtOrders = [
            getDummyTShirtOrder({ tShirtOrderTshirtId: 'SOMETHING_ELSE', id: '-1'}),
            getDummyTShirtOrder({...defaultTShirtOrder, quantity: 10, amountReceived: 1, id: '0', createdAt: '2020-01-01T10:10:10Z'}),
            getDummyTShirtOrder({...defaultTShirtOrder, amountReceived: 3, id: '2', createdAt: '2020-01-01T10:10:14Z'}),
            getDummyTShirtOrder({...defaultTShirtOrder, amountReceived: 2, id: '1', createdAt: '2020-01-01T10:10:11Z'}),
        ]
        newPo.orderedItems = {
            __typename: 'ModelTShirtOrderConnection',
            items: newTShirtOrders
        }
        const input: UpdateOrderTransactionInput = {
            updatedTShirtOrder: updatedTShirtOrder,
            parentOrder: newPo,
            inventoryQtyDelta: 0,
            createOrderChangeInput: {
                reason: '',
                fieldChanges: [{
                    oldValue: '5',
                    newValue: '1',
                    fieldName: 'amountReceived'
                }],
                orderChangeTshirtId: changeTShirtId
            },
            prevUpdatesTshirtIdsMap: {}
        }
        let amtRecvDelta = -5;
        let res = getDecreasePOItemStatements(newPo, input, amtRecvDelta);
        let statements = res.updateTShirtOrderStatements;
        let earliestTShirtOrderDate = res.earliestTShirtOrderDate;

        statements.forEach((res, i) => {
            expect(res.Statement?.includes('DELETE')).toBeTruthy()
            let expectedAttrVal = { S: (statements.length - i).toString()}
            expect(res.Parameters?.find(x => x.S === expectedAttrVal.S)).toBeDefined()
        })
        expect(statements.length).toBe(2);
        expect(statements.find(x => x.Parameters?.at(0)?.S === '0')).toBeUndefined()
        expect(earliestTShirtOrderDate).toBe(newTShirtOrders[3].createdAt)

        newTShirtOrders.push(getDummyTShirtOrder({
            ...defaultTShirtOrder, id: '3', amountReceived: 3, createdAt: '2020-01-01T10:10:12Z'}))
        amtRecvDelta = -7;
        res = getDecreasePOItemStatements(newPo, input, amtRecvDelta);
        statements = res.updateTShirtOrderStatements;
        earliestTShirtOrderDate = res.earliestTShirtOrderDate;
        
        expect(statements.length).toBe(3)
        expect(statements[0].Statement?.includes('DELETE')).toBeTruthy();
        expect(statements[1].Statement?.includes('DELETE')).toBeTruthy();
        expect(statements[2].Statement?.includes('UPDATE')).toBeTruthy();
        expect(earliestTShirtOrderDate).toBe(newTShirtOrders[3].createdAt)

        // Test deleting everything
        amtRecvDelta = -9;
        res = getDecreasePOItemStatements(newPo, input, amtRecvDelta);
        statements = res.updateTShirtOrderStatements;
        earliestTShirtOrderDate = res.earliestTShirtOrderDate;

        expect(statements.length).toBe(4);
        expect(earliestTShirtOrderDate).toBe(newTShirtOrders[1].createdAt);
        expect(statements[3].Statement?.includes('UPDATE')).toBeTruthy();
        statements.slice(0, 3).forEach(x => expect(x.Statement?.includes('DELETE')).toBeTruthy())
    })
})