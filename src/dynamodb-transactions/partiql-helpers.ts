import { CustomerOrder, CustomerOrderStatus, FieldChange, PurchaseOrder, TShirtOrder } from "@/API";
import { EntityType } from "../app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage"
import { customerOrderTable, getStrOrNull, orderChangeTable, purchaseOrderTable, tshirtOrderTable, tshirtTable } from "./dynamodb"
import { AttributeValue, ParameterizedStatement } from "@aws-sdk/client-dynamodb";
import { PurchaseOrderOrCustomerOrder } from "../graphql-helpers/create-apis";
import { TShirtOrderFields } from "@/app/(DashboardLayout)/components/TShirtOrderTable/table-constants";

export const getInsertOrderChangePartiQL = (
    orderChangeUuid: string,
    typename: string,
    parentOrderIdFieldName: string,
    orderId: string,
    tshirtId: string,
    createdAtTimestamp: string,
    reason: string,
    fieldChanges: FieldChange[]
): ParameterizedStatement => {
    const attributeValues = fieldChanges.map(fieldChange => {
        let mapAttributeVal: any = {};
        Object.keys(fieldChange).forEach(key => { 
            mapAttributeVal[key] = { S: fieldChange[key as keyof FieldChange].toString() }
        });
        return { M: mapAttributeVal } as unknown as AttributeValue;
    });

    return {
        Statement: `
                INSERT INTO "${orderChangeTable.tableName}"
                value {
                    'id': ?,
                    '__typename': ?,
                    'fieldChanges': ?,
                    'reason': ?,
                    '${parentOrderIdFieldName}': ?,
                    'orderChangeTshirtId': ?,
                    'createdAt': ?,
                    'updatedAt': ?
                }`,
        Parameters: [
            { S: orderChangeUuid },
            { S: typename },
            { L: attributeValues },
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
            SET ${tshirtTable.quantityOnHandField} = ${tshirtTable.quantityOnHandField} + ?
            SET updatedAt = ?
            WHERE ${tshirtTable.pkFieldName} = ?
            ${!allowNegativeInventory && tshirtQtyChange < 0 ? `AND  ${tshirtTable.quantityOnHandField} >= ?` : ""}
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
    tshirtOrder: TShirtOrder,
    createdAtTimestamp: string,
): ParameterizedStatement => {
    let amtReceived = tshirtOrder.amountReceived ? tshirtOrder.amountReceived.toString() : "0";
    return {
        Statement: `
            UPDATE "${tshirtOrderTable.tableName}"
            SET ${TShirtOrderFields.Qty} = ?
            SET ${TShirtOrderFields.AmtReceived} = ?
            SET ${TShirtOrderFields.CostPerUnit} = ?
            SET updatedAt = ?
            WHERE ${tshirtOrderTable.pkFieldName} = ?
        `,
        Parameters: [
            { N: tshirtOrder.quantity.toString() },
            { N: amtReceived },
            { N: tshirtOrder.costPerUnit.toString() },
            { S: createdAtTimestamp },
            { S: tshirtOrder.id },
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
                'costPerUnit': ?,
                '${entityType}OrderOrderedItemsId': ?,
                'tShirtOrderTshirtId': ?,
                'createdAt': ?,
                'updatedAt': ?
            }
        `,
        Parameters: [
            { S: "TShirtOrder" } as AttributeValue,
            { S: tshirtOrderUuid },
            { N: tshirtOrder.quantity.toString() },
            { N: tshirtOrder.amountReceived ? tshirtOrder.amountReceived.toString() : "0" },
            { N: tshirtOrder.costPerUnit.toString() },
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