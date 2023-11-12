import { ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { createDynamoDBObj, customerOrderChangeTable, purchaseOrderChangeTable, tshirtOrderTable, tshirtTable } from '../dynamodb-transactions/dynamodb';
import { EntityType } from "../(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { CognitoUser } from '@aws-amplify/auth';
import { toAWSDateTime } from "@/utils/datetimeConversions";
import dayjs from "dayjs";
import { v4 } from 'uuid';
import { OrderChange } from "../(DashboardLayout)/components/tshirt-order-table/table-constants";
import { TShirtOrder } from "@/API";

export type UpdateOrderTransactionInput = {
    tshirtOrder: TShirtOrder;
    orderId: string;
    reason: string;
    quantityDelta: number;
    quantityDelta2: number | undefined;
}

export const updateOrderTransactionAPI = async (input: UpdateOrderTransactionInput, entityType: EntityType, user: CognitoUser, allowNegativeInventory: boolean): Promise<OrderChange> => {
    const { tshirtOrder, orderId, reason, quantityDelta, quantityDelta2 } = input;
    const tshirtOrderId = tshirtOrder.id;
    const tshirtStyleNumber = tshirtOrder.tShirtOrderTshirtStyleNumber;

    let qtyDelta = entityType === EntityType.CustomerOrder ? -quantityDelta : quantityDelta;
    const qtyDeltaStr = qtyDelta.toString();
    const qtyDelta2Str = quantityDelta2 ? quantityDelta2.toString() : "0";

    // Insertion fields for new OrderChange
    const createdAtTimestamp = toAWSDateTime(dayjs());
    const orderChangeUuid = v4();
    const typename = entityType === EntityType.CustomerOrder ? "CustomerOrderChange" : "PurchaseOrderChange";
    const parentOrderIdFieldName = `${entityType}OrderChangeHistoryId`
    const associatedTShirtStyleNumberFieldName = `${entityType}OrderChangeTshirtStyleNumber`

    // PurchaseOrder uses amountReceived (quantityDelta2) column as the column affecting TShirt table qty
    const tshirtQtyChange = entityType === EntityType.CustomerOrder ? qtyDeltaStr : qtyDelta2Str;

    const transactionStatements = [
        {
            Statement: `
                UPDATE "${tshirtTable.tableName}"
                SET ${tshirtTable.quantityFieldName[0]} = ${tshirtTable.quantityFieldName[0]} + ?
                SET updatedAt = ?
                WHERE ${tshirtTable.pkFieldName} = ?
                ${allowNegativeInventory ? "" : `AND ${tshirtTable.quantityFieldName[0]} >= ?`}
            `,
            Parameters: [
                { N: tshirtQtyChange },
                { S: createdAtTimestamp },
                { S: tshirtStyleNumber },
                { N: tshirtQtyChange}
            ]
        },
        {
            Statement: `
                UPDATE "${tshirtOrderTable.tableName}"
                SET ${tshirtOrderTable.quantityFieldName[0]} = ${tshirtOrderTable.quantityFieldName[0]} + ?
                SET ${tshirtOrderTable.quantityFieldName[1]} = ${tshirtOrderTable.quantityFieldName[1]} + ?
                SET updatedAt = ?
                WHERE ${tshirtOrderTable.pkFieldName} = ?
            `,
            Parameters: [
                { N: qtyDeltaStr },
                { N: qtyDelta2Str },
                { S: createdAtTimestamp },
                { S: tshirtOrderId },
            ]
        },
        entityType === EntityType.CustomerOrder ?
            {
                Statement: `
          INSERT INTO "${customerOrderChangeTable.tableName}"
          value {
            'id': ?,
            '__typename': ?,
            'orderedQuantityChange': ?,
            'reason': ?,
            '${parentOrderIdFieldName}': ?,
            '${associatedTShirtStyleNumberFieldName}': ?,
            'createdAt': ?,
            'updatedAt': ?
          }`,
                Parameters: [
                    { S: orderChangeUuid },
                    { S: typename },
                    { N: qtyDeltaStr },
                    { S: reason },
                    { S: orderId },
                    { S: tshirtStyleNumber },
                    { S: createdAtTimestamp },
                    { S: createdAtTimestamp }
                ]
            } : {
                Statement: `INSERT INTO "${purchaseOrderChangeTable.tableName}"
          value {
            'id': ?,
            '__typename': ?,
            'orderedQuantityChange': ?, 
            'quantityChange': ?, 
            'reason': ?, 
            '${parentOrderIdFieldName}': ?, 
            '${associatedTShirtStyleNumberFieldName}': ?,
            'createdAt': ?,
            'updatedAt': ?
          }`,
                Parameters: [
                    { S: orderChangeUuid },
                    { S: typename },
                    { N: qtyDeltaStr },
                    { N: qtyDelta2Str },
                    { S: reason },
                    { S: orderId },
                    { S: tshirtStyleNumber },
                    { S: createdAtTimestamp },
                    { S: createdAtTimestamp }
                ]
            }
    ];
    const command = new ExecuteTransactionCommand({
        TransactStatements: transactionStatements
    });
    const dynamodbClient = await createDynamoDBObj(user);
    return dynamodbClient.send(command)
        .then((onFulfilled) => {
            const orderChange = {
                __typename: typename,
                id: orderChangeUuid,
                createdAt: createdAtTimestamp,
                updatedAt: createdAtTimestamp,
                [parentOrderIdFieldName]: orderId,
                [associatedTShirtStyleNumberFieldName]: tshirtStyleNumber,
                orderedQuantityChange: quantityDelta,
                tshirt: {}
            };
            if (entityType === EntityType.PurchaseOrder) {
                orderChange.quantityChange = quantityDelta2 ? quantityDelta2 : 0;
            }
            return orderChange as OrderChange;
        })
        .catch((e) => {
            console.log(e);
            throw new Error(`Failed to update ${entityType} order`);
        });
}