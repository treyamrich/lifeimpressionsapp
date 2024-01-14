import { CustomerOrder, CustomerOrderStatus, PurchaseOrder, TShirtOrder } from "@/API";
import { EntityType } from "../app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage"
import { customerOrderChangeTable, customerOrderTable, getStrOrNull, purchaseOrderChangeTable, purchaseOrderTable, tshirtOrderTable, tshirtTable } from "./dynamodb"
import { ParameterizedStatement } from "@aws-sdk/client-dynamodb";
import { PurchaseOrderOrCustomerOrder } from "../graphql-helpers/create-apis";

export const getInsertOrderChangePartiQL = (
    entityType: EntityType,
    orderChangeUuid: string,
    typename: string,
    parentOrderIdFieldName: string,
    associatedTshirtIdFieldName: string,
    reason: string,
    orderId: string,
    tshirtId: string,
    createdAtTimestamp: string,
    tshirtTableQtyDelta: number,
    orderedQtyDelta: number = 0
): ParameterizedStatement => {
    return entityType === EntityType.CustomerOrder ?
        {
            Statement: `
                INSERT INTO "${customerOrderChangeTable.tableName}"
                value {
                    'id': ?,
                    '__typename': ?,
                    'orderedQuantityChange': ?,
                    'reason': ?,
                    '${parentOrderIdFieldName}': ?,
                    '${associatedTshirtIdFieldName}': ?,
                    'createdAt': ?,
                    'updatedAt': ?
                }`,
            Parameters: [
                { S: orderChangeUuid },
                { S: typename },
                { N: tshirtTableQtyDelta.toString() },
                { S: reason },
                { S: orderId },
                { S: tshirtId },
                { S: createdAtTimestamp },
                { S: createdAtTimestamp }
            ]
        } : {
            Statement: `
                INSERT INTO "${purchaseOrderChangeTable.tableName}"
                value {
                    'id': ?,
                    '__typename': ?,
                    'orderedQuantityChange': ?, 
                    'quantityChange': ?, 
                    'reason': ?, 
                    '${parentOrderIdFieldName}': ?, 
                    '${associatedTshirtIdFieldName}': ?,
                    'createdAt': ?,
                    'updatedAt': ?
                }`,
            Parameters: [
                { S: orderChangeUuid },
                { S: typename },
                { N: orderedQtyDelta.toString() },
                { N: tshirtTableQtyDelta.toString() },
                { S: reason },
                { S: orderId },
                { S: tshirtId },
                { S: createdAtTimestamp },
                { S: createdAtTimestamp }
            ]
        }
}

export const getUpdateTShirtTablePartiQL = (
    tshirtQtyChange: number,
    allowNegativeInventory: boolean,
    createdAtTimestamp: string,
    tshirtId: string
): ParameterizedStatement => {
    return {
        Statement: `
            UPDATE "${tshirtTable.tableName}"
            SET ${tshirtTable.quantityFieldName[0]} = ${tshirtTable.quantityFieldName[0]} + ?
            SET updatedAt = ?
            WHERE ${tshirtTable.pkFieldName} = ?
            ${!allowNegativeInventory && tshirtQtyChange < 0 ? `AND  ${tshirtTable.quantityFieldName[0]} >= ?` : ""}
        `,
        Parameters: [
            { N: tshirtQtyChange.toString() },
            { S: createdAtTimestamp },
            { S: tshirtId },
            { N: Math.abs(tshirtQtyChange).toString() }
        ]
    }
}

export const getUpdateTShirtOrderTablePartiQL = (
    amountOrderedDelta: number,
    amountReceivedDelta: number,
    createdAtTimestamp: string,
    tshirtOrderId: string
): ParameterizedStatement => {
    return {
        Statement: `
            UPDATE "${tshirtOrderTable.tableName}"
            SET ${tshirtOrderTable.quantityFieldName[0]} = ${tshirtOrderTable.quantityFieldName[0]} + ?
            SET ${tshirtOrderTable.quantityFieldName[1]} = ${tshirtOrderTable.quantityFieldName[1]} + ?
            SET updatedAt = ?
            WHERE ${tshirtOrderTable.pkFieldName} = ?
        `,
        Parameters: [
            { N: amountOrderedDelta.toString() },
            { N: amountReceivedDelta.toString() },
            { S: createdAtTimestamp },
            { S: tshirtOrderId },
        ]
    }
}

export const getInsertTShirtOrderTablePartiQL = (
    entityType: EntityType,
    parentOrderUuid: string,
    createdAtTimestamp: string,
    tshirtOrder: TShirtOrder,
    tshirtOrderUuid: string
): ParameterizedStatement => {
    return {
        Statement: `
            INSERT INTO "${tshirtOrderTable.tableName}"
            value {
                '__typename': ?,
                'id': ?,
                'quantity': ?,
                'amountReceived': ?,
                '${entityType}OrderOrderedItemsId': ?,
                'tShirtOrderTshirtId': ?,
                'createdAt': ?,
                'updatedAt': ?
            }
        `,
        Parameters: [
            { S: "TShirtOrder" },
            { S: tshirtOrderUuid },
            { N: tshirtOrder.quantity.toString() },
            { N: tshirtOrder.amountReceived ? tshirtOrder.amountReceived.toString() : "0" },
            { S: parentOrderUuid },
            { S: tshirtOrder.tshirt.id },
            { S: createdAtTimestamp },
            { S: createdAtTimestamp },
        ]
    }
}

export const getInsertOrderPartiQL = (
    order: PurchaseOrderOrCustomerOrder,
    entityType: EntityType,
    createdAt: string,
    orderUuid: string
): ParameterizedStatement => {
    const typename = entityType === EntityType.CustomerOrder ? "CustomerOrder" : "PurchaseOrder";
    if (entityType === EntityType.PurchaseOrder) {
        const purchaseOrder = order as any as PurchaseOrder;
        return {
            Statement: `
            INSERT INTO "${purchaseOrderTable}"
            value {
                '__typename': ?,
                'id': ?,
                'orderNumber': ?,
                'vendor': ?,
                'status': ?,
                'isDeleted': ?,
                'type': ?,
                'createdAt': ?,
                'updatedAt': ?
            }
        `,
            Parameters: [
                { S: typename },
                { S: orderUuid },
                { S: purchaseOrder.orderNumber },
                { S: purchaseOrder.vendor },
                { S: purchaseOrder.status },
                { BOOL: false },
                { S: typename },
                { S: createdAt },
                { S: createdAt },
            ]
        }
    }
    const customerOrder = order as any as CustomerOrder;
    return {
        Statement: `
        INSERT INTO "${customerOrderTable}"
        value {
          '__typename': ?,
          'id': ?,
          'customerName': ?,
          'customerEmail': ?,
          'customerPhoneNumber': ?,
          'orderNumber': ?,
          'orderStatus': ?,
          'orderNotes': ?,
          'dateNeededBy': ?,
          'isDeleted': ?,
          'type': ?,
          'createdAt': ?,
          'updatedAt': ?
        }
      `,
        Parameters: [
            { S: typename },
            { S: orderUuid },
            { S: customerOrder.customerName },
            getStrOrNull(customerOrder.customerEmail),
            getStrOrNull(customerOrder.customerPhoneNumber),
            { S: customerOrder.orderNumber },
            { S: CustomerOrderStatus.NEW },
            getStrOrNull(customerOrder.orderNotes),
            { S: customerOrder.dateNeededBy },
            { BOOL: false },
            { S: typename },
            { S: createdAt },
            { S: createdAt },
        ]
    }
};

export const getUpdateOrderPartiQL = (
    entityType: EntityType,
    orderId: string,
    updatedAtTimestamp: string
): ParameterizedStatement => {
    return {
        Statement: `
            UPDATE "${entityType === EntityType.PurchaseOrder ? purchaseOrderTable : customerOrderTable}"
            SET updatedAt = ?
            WHERE id = ?
        `,
        Parameters: [
            { S: updatedAtTimestamp },
            { S: orderId }
        ]
    }
}