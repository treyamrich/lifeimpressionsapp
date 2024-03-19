import { CustomerOrder, CustomerOrderStatus, FieldChange, PurchaseOrder, TShirt, TShirtOrder, UpdateTShirtInput } from "@/API";
import { EntityType } from "../app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage"
import { CACHE_EXPIRATION_ID, cacheExpirationTable, customerOrderTable, getStrOrNull, orderChangeTable, purchaseOrderTable, tshirtOrderTable, tshirtTable } from "./dynamodb"
import { AttributeValue, ParameterizedStatement } from "@aws-sdk/client-dynamodb";
import { TShirtOrderFields } from "@/app/(DashboardLayout)/components/TShirtOrderTable/table-constants";
import { fromUTC, toAWSDateTime } from "@/utils/datetimeConversions";

export type PurchaseOrderOrCustomerOrder = PurchaseOrder | CustomerOrder;

export const getInsertOrderChangePartiQL = (
    orderChangeUuid: string,
    tshirtId: string,
    createdAtTimestamp: string,
    reason: string,
    fieldChanges: FieldChange[],
    optionalParams?: {
        parentOrderIdFieldName?: string;
        orderId?: string | null;
        indexPartitionKey?: string;
    }
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
                    'orderChangeTshirtId': ?,
                    'createdAt': ?,
                    'updatedAt': ?
                    ${optionalParams?.parentOrderIdFieldName ? `,\n'${optionalParams.parentOrderIdFieldName}': ?` : ""}
                    ${optionalParams?.indexPartitionKey ? `,\n'indexField': ?` : ""}
                }`,
        Parameters: [
            { S: orderChangeUuid },
            { S: "OrderChange" },
            { L: attributeValues },
            { S: reason },
            { S: tshirtId },
            { S: createdAtTimestamp },
            { S: createdAtTimestamp },
            ...(optionalParams?.orderId ? [getStrOrNull(optionalParams.orderId)] : []),
            ...(optionalParams?.indexPartitionKey ? [getStrOrNull(optionalParams.indexPartitionKey)] : [])
        ]
    }
}

export const getUpdateTShirtTablePartiQL = (
    updatedTShirt: TShirt,
    updatedAtTimestamp: string
): ParameterizedStatement => ({
    Statement: `
        UPDATE "${tshirtTable.tableName}"
        SET brand = ?
        SET color = ?
        SET "size" = ?
        SET type = ?
        SET ${tshirtTable.quantityOnHandField} = ?
        SET updatedAt = ?
        WHERE ${tshirtTable.pkFieldName} = ?
    `,
    Parameters: [
        { S: updatedTShirt.brand },
        { S: updatedTShirt.color },
        { S: updatedTShirt.size },
        { S: updatedTShirt.type },
        { N: updatedTShirt.quantityOnHand.toString() },
        { S: updatedAtTimestamp },
        { S: updatedTShirt.id },
    ]
})

export const getConditionalUpdateTShirtTablePartiQL = (
    tshirtQtyChange: number,
    allowNegativeInventory: boolean,
    createdAtTimestamp: string,
    tshirtId: string
): ParameterizedStatement => ({
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
})

export const getSoftDeleteTShirtOrderPartiQL = (
    tshirtOrder: TShirtOrder,
    updatedAtTimestamp: string
): ParameterizedStatement => {
    return {
        Statement: `
            UPDATE "${tshirtOrderTable.tableName}"
            SET isDeleted = ?
            SET updatedAt = ?
            WHERE ${tshirtOrderTable.pkFieldName} = ?
        `,
        Parameters: [
            { BOOL: true },
            { S: updatedAtTimestamp },
            { S: tshirtOrder.id },
        ]
    }
}

export const getHardDeleteTShirtOrderPartiQL = (
    tshirtOrder: TShirtOrder,
): ParameterizedStatement => {
    return {
        Statement: `
            DELETE FROM "${tshirtOrderTable.tableName}"
            WHERE ${tshirtOrderTable.pkFieldName} = ?
        `,
        Parameters: [
            { S: tshirtOrder.id },
        ]
    }
}

export const getUpdateTShirtOrderTablePartiQL = (
    tshirtOrder: TShirtOrder,
): ParameterizedStatement => {
    let amtReceived = tshirtOrder.amountReceived ? tshirtOrder.amountReceived.toString() : "0";
    return {
        Statement: `
            UPDATE "${tshirtOrderTable.tableName}"
            SET ${TShirtOrderFields.Qty} = ?
            SET ${TShirtOrderFields.AmtReceived} = ?
            SET ${TShirtOrderFields.CostPerUnit} = ?
            SET ${TShirtOrderFields.Discount} = ?
            WHERE ${tshirtOrderTable.pkFieldName} = ?
        `,
        Parameters: [
            { N: tshirtOrder.quantity.toString() },
            { N: amtReceived },
            { N: tshirtOrder.costPerUnit.toString() },
            { N: tshirtOrder.discount.toString() },
            { S: tshirtOrder.id },
        ]
    }
}

export const getInsertTShirtOrderTablePartiQL = (
    entityType: EntityType,
    parentOrderUuid: string,
    createdAtTimestamp: string,
    tshirtOrder: TShirtOrder,
    tshirtOrderUuid: string,

): ParameterizedStatement => {
    return {
        Statement: `
            INSERT INTO "${tshirtOrderTable.tableName}"
            value {
                '__typename': ?,
                'id': ?,
                '${TShirtOrderFields.Qty}': ?,
                '${TShirtOrderFields.AmtReceived}': ?,
                '${TShirtOrderFields.CostPerUnit}': ?,
                '${TShirtOrderFields.Discount}': ?,
                '${entityType}OrderOrderedItemsId': ?,
                'tShirtOrderTshirtId': ?,
                'createdAt': ?,
                'updatedAt': ?,
                'isDeleted': ?,
                'indexField': ?
            }
        `,
        Parameters: [
            { S: "TShirtOrder" } as AttributeValue,
            { S: tshirtOrderUuid },
            { N: tshirtOrder.quantity.toString() },
            { N: tshirtOrder.amountReceived ? tshirtOrder.amountReceived.toString() : "0" },
            { N: tshirtOrder.costPerUnit.toString() },
            { N: tshirtOrder.discount.toString() },
            { S: parentOrderUuid },
            { S: tshirtOrder.tshirt.id },
            { S: createdAtTimestamp },
            { S: createdAtTimestamp },
            { BOOL: false },
            { S: tshirtOrder.tshirt.id },
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
                'orderNotes': ?,
                'status': ?,
                'taxRate': ?,
                'shipping': ?,
                'shippingAddress': ?,
                'fees': ?,
                'discount': ?,
                'dateExpected': ?,
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
                getStrOrNull(purchaseOrder.orderNotes),
                { S: purchaseOrder.status },
                { N: purchaseOrder.taxRate.toString() },
                { N: purchaseOrder.shipping.toString() },
                getStrOrNull(purchaseOrder.shippingAddress),
                { N: purchaseOrder.fees.toString() },
                { N: purchaseOrder.discount.toString() },
                { S: purchaseOrder.dateExpected },
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
          'taxRate': ?,
          'discount': ?,
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
            { N: customerOrder.taxRate.toString() },
            { N: customerOrder.discount.toString() },
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
    updatedAtTimestamp: string,
    isDeleted?: boolean
): ParameterizedStatement => {
    return {
        Statement: `
            UPDATE "${entityType === EntityType.PurchaseOrder ? purchaseOrderTable : customerOrderTable}"
            SET updatedAt = ? ${isDeleted ? "\nSET isDeleted = ?\n" : ""}
            WHERE id = ?
        `,
        Parameters: [
            { S: updatedAtTimestamp },
            isDeleted ? { BOOL: true } : null,
            { S: orderId }
        ].filter(item => item !== null) as AttributeValue[]
    }
}

// This should only be called for customer orders updated in previous months
export const getConditionalUpdateCacheExpiration = (expirationDateUTC: string): ParameterizedStatement => {
    let earliestExpiredDate = fromUTC(expirationDateUTC)
        .startOf('month')
        .format('YYYY-MM-DD');
    return {
        Statement: `
            UPDATE "${cacheExpirationTable}"
            SET earliestExpiredDate = ?
            WHERE id = ? AND (earliestExpiredDate > ? OR earliestExpiredDate = ?)
        `,
        Parameters: [
            { S: earliestExpiredDate },
            { S: CACHE_EXPIRATION_ID },
            { S: earliestExpiredDate },
            { S: ''}
        ]
    }
}