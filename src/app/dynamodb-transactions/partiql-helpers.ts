import { CustomerOrder, CustomerOrderStatus, PurchaseOrder, TShirtOrder } from "@/API";
import { EntityType } from "../(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage"
import { customerOrderChangeTable, customerOrderTable, getStrOrNull, purchaseOrderChangeTable, purchaseOrderTable, tshirtOrderTable, tshirtTable } from "./dynamodb"
import { v4 } from 'uuid';
import { ParameterizedStatement } from "@aws-sdk/client-dynamodb";
import { PurchaseOrderOrCustomerOrder } from "../graphql-helpers/create-apis";

export const getInsertOrderChangePartiQL = (
    entityType: EntityType,
    orderChangeUuid: string,
    typename: string,
    parentOrderIdFieldName: string,
    associatedTShirtStyleNumberFieldName: string,
    tshirtOrderQtyChange: string,
    reason: string,
    orderId: string,
    tshirtStyleNumber: string,
    createdAtTimestamp: string,
    qtyDeltaStr: string = "",
    qtyDelta2Str: string = ""
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
                    '${associatedTShirtStyleNumberFieldName}': ?,
                    'createdAt': ?,
                    'updatedAt': ?
                }`,
            Parameters: [
                { S: orderChangeUuid },
                { S: typename },
                { N: tshirtOrderQtyChange },
                { S: reason },
                { S: orderId },
                { S: tshirtStyleNumber },
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
}

export const getUpdateTShirtTablePartiQL = (
    tshirtQtyChange: string,
    allowNegativeInventory: boolean,
    createdAtTimestamp: string,
    tshirtStyleNumber: string
): ParameterizedStatement => {
    return {
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
            { N: tshirtQtyChange }
        ]
    }
}

export const getUpdateTShirtOrderTablePartiQL = (
    qtyDeltaStr: string,
    qtyDelta2Str: string,
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
            { N: qtyDeltaStr },
            { N: qtyDelta2Str },
            { S: createdAtTimestamp },
            { S: tshirtOrderId },
        ]
    }
}

export const getInsertTShirtOrderTablePartiQL = (
    entityType: EntityType,
    parentOrderUuid: string,
    createdAtTimestamp: string,
    tshirtOrder: TShirtOrder
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
                'tShirtOrderTshirtStyleNumber': ?,
                'createdAt': ?,
                'updatedAt': ?
            }
        `,
        Parameters: [
            { S: "TShirtOrder" },
            { S: v4() },
            { N: tshirtOrder.quantity.toString() },
            { N: tshirtOrder.amountReceived ? tshirtOrder.amountReceived.toString() : "0" },
            { S: parentOrderUuid },
            { S: tshirtOrder.tShirtOrderTshirtStyleNumber },
            { S: createdAtTimestamp },
            { S: createdAtTimestamp },
        ]
    }
}

export const getInsertOrderStatement = (
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
            { S: createdAt },
            { S: createdAt },
        ]
    }
}