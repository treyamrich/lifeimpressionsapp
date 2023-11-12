import { ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { createDynamoDBObj, customerOrderChangeTable, purchaseOrderChangeTable, tshirtOrderTable, tshirtTable } from '../dynamodb-transactions/dynamodb';
import { EntityType } from "../(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { CognitoUser } from '@aws-amplify/auth';
import { toAWSDateTime } from "@/utils/datetimeConversions";
import dayjs from "dayjs";
import { v4 } from 'uuid';
import { OrderChange } from "../(DashboardLayout)/components/tshirt-order-table/table-constants";
import { TShirtOrder } from "@/API";
import { getInsertOrderChangePartiQL, getUpdateTShirtOrderTablePartiQL, getUpdateTShirtTablePartiQL } from "./partiql-helpers";

export type UpdateOrderTransactionInput = {
    tshirtOrder: TShirtOrder;
    orderId: string;
    reason: string;
    quantityDelta: number;
    quantityDelta2: number | undefined;
}

// Used when updating the TShirtOrder row in an order. Returns null if allowNegativeInventory is false and the inventory will become negative in the TShirt table.
export const updateOrderTransactionAPI = async (input: UpdateOrderTransactionInput, entityType: EntityType, user: CognitoUser, allowNegativeInventory: boolean): Promise<OrderChange | null> => {
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
    const tshirtOrderQtyChange = quantityDelta.toString();

    const transactionStatements = [
        getUpdateTShirtTablePartiQL(
            tshirtQtyChange,
            allowNegativeInventory,
            createdAtTimestamp,
            tshirtStyleNumber
        ),
        getUpdateTShirtOrderTablePartiQL(
            qtyDeltaStr,
            qtyDelta2Str,
            createdAtTimestamp,
            tshirtOrderId
        ),
        getInsertOrderChangePartiQL(
            entityType,
            orderChangeUuid,
            typename,
            parentOrderIdFieldName,
            associatedTShirtStyleNumberFieldName,
            tshirtOrderQtyChange,
            reason,
            orderId,
            tshirtStyleNumber,
            createdAtTimestamp,
            qtyDeltaStr,
            qtyDelta2Str
        )
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
                tshirt: {},
                reason: reason
            };
            if (entityType === EntityType.PurchaseOrder) {
                orderChange.quantityChange = quantityDelta2 ? quantityDelta2 : 0;
            }
            return orderChange as OrderChange;
        })
        .catch((e) => {
            if (!allowNegativeInventory) {
                return null;
            }
            console.log(e);
            throw new Error(`Failed to update ${entityType} order`);
        });
}