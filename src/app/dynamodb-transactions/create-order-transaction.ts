import { toAWSDateTime } from "@/utils/datetimeConversions";
import dayjs from "dayjs";
import { EntityType } from "../(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { CognitoUser } from '@aws-amplify/auth';
import { OrderChange } from "../(DashboardLayout)/components/tshirt-order-table/table-constants";
import { v4 } from 'uuid';
import { AttributeValue, ExecuteTransactionCommand, ExecuteTransactionCommandOutput, ParameterizedStatement } from "@aws-sdk/client-dynamodb";
import { CustomerOrder, CustomerOrderStatus, PurchaseOrder, TShirtOrder } from "@/API";
import { PurchaseOrderOrCustomerOrder } from "../graphql-helpers/create-apis";
import { createDynamoDBObj, customerOrderTable, getStrOrNull, purchaseOrderTable, tshirtOrderTable, tshirtTable } from './dynamodb';

const getInsertOrderStatement = (input: PurchaseOrderOrCustomerOrder, entityType: EntityType, createdAt: string, orderUuid: string): ParameterizedStatement => {
    const typename = entityType === EntityType.CustomerOrder ? "CustomerOrder" : "PurchaseOrder";
    if (entityType === EntityType.PurchaseOrder) {
        const purchaseOrder = input as any as PurchaseOrder;
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
    const customerOrder = input as any as CustomerOrder;
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

const getTShirtOrdersStatements = (orderedItems: TShirtOrder[], entityType: EntityType, createdAt: string, parentOrderUuid: string): ParameterizedStatement[] => {
    const res: ParameterizedStatement[] = [];
    orderedItems.forEach((tshirtOrder: TShirtOrder) => {
        // Only decrement from TShirt table when it's a customer order
        if (entityType === EntityType.CustomerOrder) {
            res.push({
                Statement: `
                UPDATE "${tshirtTable.tableName}"
                SET ${tshirtTable.quantityFieldName[0]} = ${tshirtTable.quantityFieldName[0]} - ?
                SET updatedAt = ?
                WHERE ${tshirtTable.pkFieldName} = ?
            `,
                Parameters: [
                    { N: tshirtOrder.quantity.toString() },
                    { S: createdAt },
                    { S: tshirtOrder.tShirtOrderTshirtStyleNumber },
                ]
            });
        }
        // Add to TShirtOrder table
        res.push({
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
                { S: createdAt },
                { S: createdAt },
            ]
        });
    });
    return res;
};

export const createOrderTransactionAPI = async (input: PurchaseOrderOrCustomerOrder, entityType: EntityType, user: CognitoUser): Promise<ExecuteTransactionCommandOutput> => {
    console.log(input);

    // Insertion fields for new Order
    const orderId = v4();
    const createdAtTimestamp = toAWSDateTime(dayjs());

    const orderedItems = input.orderedItems as any as TShirtOrder[]; // Locally orderedItems is just an array
    const transactionStatements: ParameterizedStatement[] = [
        getInsertOrderStatement(input, entityType, createdAtTimestamp, orderId),
        ...getTShirtOrdersStatements(orderedItems, entityType, createdAtTimestamp, orderId)
    ];
    transactionStatements.forEach(s => {console.log(s.Statement); console.log(s.Parameters)});
    const command = new ExecuteTransactionCommand({
        TransactStatements: transactionStatements
    });
    const dynamodbClient = await createDynamoDBObj(user);
    return dynamodbClient.send(command)
        .catch((e) => {
            console.log(e);
            throw new Error(`Failed to create ${entityType} order`);
        });
}