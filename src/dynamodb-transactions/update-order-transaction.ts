import { ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { createDynamoDBObj } from './dynamodb';
import { EntityType } from "../app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { CognitoUser } from '@aws-amplify/auth';
import { toAWSDateTime } from "@/utils/datetimeConversions";
import dayjs from "dayjs";
import { v4 } from 'uuid';
import { OrderChange } from "../app/(DashboardLayout)/components/tshirt-order-table/table-constants";
import { TShirtOrder } from "@/API";
import {
    getInsertOrderChangePartiQL,
    getInsertTShirtOrderTablePartiQL,
    getUpdateOrderPartiQL,
    getUpdateTShirtOrderTablePartiQL,
    getUpdateTShirtTablePartiQL
} from "./partiql-helpers";
import { DBOperation } from "@/contexts/DBErrorContext";

export type UpdateOrderTransactionInput = {
    tshirtOrder: TShirtOrder;
    parentOrderId: string;
    reason: string;
    tshirtTableQtyDelta: number;
    orderedQtyDelta: number | undefined;
}

export type UpdateOrderTransactionResponse = {
    orderChange: OrderChange;
    newTShirtOrderId?: string;
    orderUpdatedAtTimestamp: string;
} | null;

// Used when updating the TShirtOrder row in an order. 
// Returns null if allowNegativeInventory is false and the inventory will become negative in the TShirt table.
// tshirtOrderTableOperation is the effect of the transaction. Only support for update and insert.
// If tshirtOrderTableOpeartion is CREATE a new tshirtOrder id will be returned
export const updateOrderTransactionAPI = async (
    input: UpdateOrderTransactionInput,
    entityType: EntityType,
    user: CognitoUser,
    tshirtOrderTableOperation: DBOperation,
    allowNegativeInventory: boolean
): Promise<UpdateOrderTransactionResponse> => {
    if (tshirtOrderTableOperation !== DBOperation.CREATE &&
        tshirtOrderTableOperation !== DBOperation.UPDATE)
        throw Error("Invalid operation" + tshirtOrderTableOperation);

    const { tshirtOrder, parentOrderId, reason, tshirtTableQtyDelta, orderedQtyDelta } = input;
    const tshirtOrderId = tshirtOrder.id;
    const tshirtStyleNumber = tshirtOrder.tShirtOrderTshirtStyleNumber;

    let entitySpecificTShirtTableQtyDelta = entityType === EntityType.CustomerOrder ?
        -tshirtTableQtyDelta : tshirtTableQtyDelta;

    // Insertion fields for new OrderChange
    const createdAtTimestamp = toAWSDateTime(dayjs());
    const orderChangeUuid = v4();
    const typename = entityType === EntityType.CustomerOrder ? "CustomerOrderChange" : "PurchaseOrderChange";
    const parentOrderIdFieldName = `${entityType}OrderChangeHistoryId`
    const associatedTShirtStyleNumberFieldName = `${entityType}OrderChangeTshirtStyleNumber`

    const newTShirtOrderId = tshirtOrderTableOperation === DBOperation.CREATE ? v4() : "";

    const transactionStatements = [
        getUpdateOrderPartiQL(
            entityType,
            parentOrderId,
            createdAtTimestamp
        ),
        getUpdateTShirtTablePartiQL(
            entitySpecificTShirtTableQtyDelta,
            allowNegativeInventory,
            createdAtTimestamp,
            tshirtStyleNumber
        ),
        tshirtOrderTableOperation === DBOperation.UPDATE ?
            getUpdateTShirtOrderTablePartiQL(
                orderedQtyDelta ? orderedQtyDelta : 0,
                entitySpecificTShirtTableQtyDelta,
                createdAtTimestamp,
                tshirtOrderId
            ) :
            getInsertTShirtOrderTablePartiQL(
                entityType,
                parentOrderId,
                createdAtTimestamp,
                tshirtOrder,
                newTShirtOrderId
            ),
        getInsertOrderChangePartiQL(
            entityType,
            orderChangeUuid,
            typename,
            parentOrderIdFieldName,
            associatedTShirtStyleNumberFieldName,
            reason,
            parentOrderId,
            tshirtStyleNumber,
            createdAtTimestamp,
            entitySpecificTShirtTableQtyDelta,
            orderedQtyDelta
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
                [parentOrderIdFieldName]: parentOrderId,
                [associatedTShirtStyleNumberFieldName]: tshirtStyleNumber,
                tshirt: {},
                reason: reason
            };
            // Table specific implementation. 
            // Ordered quantity change field only affects tshirt table for customer orders
            if (entityType === EntityType.PurchaseOrder) {
                orderChange.orderedQuantityChange = orderedQtyDelta ? orderedQtyDelta : 0;
                orderChange.quantityChange = tshirtTableQtyDelta;
            } else {
                orderChange.orderedQuantityChange = tshirtTableQtyDelta;
            }

            return {
                orderChange: orderChange as OrderChange,
                orderUpdatedAtTimestamp: createdAtTimestamp,
                newTShirtOrderId: tshirtOrderTableOperation === DBOperation.CREATE ?
                    newTShirtOrderId : undefined
            };
        })
        .catch((e) => {
            if (!allowNegativeInventory) {
                return null;
            }
            console.log(e);
            throw new Error(`Failed to update ${entityType} order`);
        });
}