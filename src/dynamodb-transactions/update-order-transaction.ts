import { ExecuteTransactionCommand, ParameterizedStatement } from "@aws-sdk/client-dynamodb";
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
    updatedTShirtOrder: TShirtOrder;
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

export type AssembleUpdateStatementsResult = {
    transactionStatements: ParameterizedStatement[];
    response: UpdateOrderTransactionResponse;
}
export const assembleUpdateOrderTransactionStatements = (
    input: UpdateOrderTransactionInput,
    tshirtOrderTableOperation: DBOperation,
    entityType: EntityType,
    allowNegativeInventory: boolean
): AssembleUpdateStatementsResult => {
    const { updatedTShirtOrder, parentOrderId, reason, tshirtTableQtyDelta, orderedQtyDelta } = input;
    const tshirtOrderId = updatedTShirtOrder.id;

    let maybeNegatedTShirtTableQtyDelta = entityType === EntityType.CustomerOrder ?
        -tshirtTableQtyDelta : tshirtTableQtyDelta;

    // Insertion fields for new OrderChange
    const createdAtTimestamp = toAWSDateTime(dayjs());
    const orderChangeUuid = v4();
    const typename = entityType === EntityType.CustomerOrder ? "CustomerOrderChange" : "PurchaseOrderChange";
    const parentOrderIdFieldName = `${entityType}OrderChangeHistoryId`
    const associatedTShirtIdFieldName = `${entityType}OrderChangeTshirtId`

    const newTShirtOrderId = tshirtOrderTableOperation === DBOperation.CREATE ? v4() : "";

    const getUpdateTShirtOrderStatement = () => {
        if (tshirtOrderTableOperation === DBOperation.CREATE) {
            return getInsertTShirtOrderTablePartiQL(
                entityType,
                parentOrderId,
                createdAtTimestamp,
                updatedTShirtOrder,
                newTShirtOrderId
            )
        }
        if (entityType === EntityType.CustomerOrder) {
            return getUpdateTShirtOrderTablePartiQL(
                tshirtTableQtyDelta, // amount ordered affects the tshirt table
                0, // Field unused
                createdAtTimestamp,
                tshirtOrderId
            )
        }
        return getUpdateTShirtOrderTablePartiQL(
            orderedQtyDelta ? orderedQtyDelta : 0, // amount ordered does not affect tshirt table
            tshirtTableQtyDelta, // Amount received affects tshirt table
            createdAtTimestamp,
            tshirtOrderId
        )

    }

    const transactionStatements: ParameterizedStatement[] = [
        getUpdateOrderPartiQL(
            entityType,
            parentOrderId,
            createdAtTimestamp
        ),
        getUpdateTShirtTablePartiQL(
            maybeNegatedTShirtTableQtyDelta,
            allowNegativeInventory,
            createdAtTimestamp,
            updatedTShirtOrder.tshirt.id
        ),
        getUpdateTShirtOrderStatement(),
        getInsertOrderChangePartiQL(
            entityType,
            orderChangeUuid,
            typename,
            parentOrderIdFieldName,
            associatedTShirtIdFieldName,
            reason,
            parentOrderId,
            updatedTShirtOrder.tshirt.id,
            createdAtTimestamp,
            tshirtTableQtyDelta,
            orderedQtyDelta
        )
    ];

    // Assemble response
    const orderChange = {
        __typename: typename,
        id: orderChangeUuid,
        createdAt: createdAtTimestamp,
        updatedAt: createdAtTimestamp,
        [parentOrderIdFieldName]: parentOrderId,
        [associatedTShirtIdFieldName]: updatedTShirtOrder.tshirt.id,
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
    orderChange.tshirt = updatedTShirtOrder.tshirt;

    const response: UpdateOrderTransactionResponse = {
        orderChange: orderChange as OrderChange,
        orderUpdatedAtTimestamp: createdAtTimestamp,
        newTShirtOrderId: tshirtOrderTableOperation === DBOperation.CREATE ?
            newTShirtOrderId : undefined
    };

    return { transactionStatements, response }
};


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

    try {
        const { transactionStatements, response } =
            assembleUpdateOrderTransactionStatements(input, tshirtOrderTableOperation, entityType, allowNegativeInventory);

        const command = new ExecuteTransactionCommand({
            TransactStatements: transactionStatements
        });
        const dynamodbClient = await createDynamoDBObj(user);
        return dynamodbClient.send(command)
            .then((onFulfilled) => response)
    } catch (e) {
        if (!allowNegativeInventory) {
            return null;
        }
        console.log(e);
        throw new Error(`Failed to update ${entityType} order`);
    }
}