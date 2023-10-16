import { toAWSDateTime } from "@/utils/datetimeConversions";
import dayjs from "dayjs";
import { EntityType } from "../(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { CognitoUser } from '@aws-amplify/auth';
import { OrderChange } from "../(DashboardLayout)/components/tshirt-order-table/table-constants";
import { v4 } from 'uuid';
import { ExecuteTransactionCommand } from "@aws-sdk/client-dynamodb";
import { CustomerOrder, CustomerOrderStatus, PurchaseOrder } from "@/API";
import { PurchaseOrderOrCustomerOrder } from "../graphql-helpers/create-apis";
import { customerOrderTable, purchaseOrderTable } from './dynamodb';

const getInsertOrderStatement = (input: CreateOrderTransactionInput, entityType: EntityType, createdAt: string) => {
    const orderId = v4();
    if (entityType === EntityType.PurchaseOrder) {
      const purchaseOrder = input as any as PurchaseOrder;
      return {
        Statement: `
          INSERT INTO "${purchaseOrderTable}"
            __typename: ?,
            id: ?,
            orderNumber: ?,
            vendor: ?,
            status: ?,
            isDeleted: ?,
            createdAt: ?,
            updatedAt: ?
        `,
        Parameters: [
          { S: "PurchaseOrder" },
          { S: orderId },
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
          __typename: ?,
          id: ?,
          customerName: ?,
          customerEmail: ?,
          customerPhoneNumber: ?
          orderNumber: ?,
          orderStatus: ?,
          orderNotes: ?,
          dateNeededBy: ?,
          isDeleted: ?,
          createdAt: ?,
          updatedAt: ?
      `,
      Parameters: [
        { S: "CustomerOrder" },
        { S: orderId },
        { S: customerOrder.customerName },
        { S: customerOrder.customerEmail },
        { S: customerOrder.customerPhoneNumber },
        { S: customerOrder.orderNumber },
        { S: CustomerOrderStatus.NEW },
        { S: customerOrder.orderNotes ? customerOrder.orderNotes : null },
        { S: customerOrder.dateNeededBy },
        { BOOL: false },
        { S: createdAt },
        { S: createdAt },
      ]
    }
  }
  
  const getUpdateTShirtStatement = (input, entityType, createdAt) => {

  }

  export type CreateOrderTransactionInput = {
    order: PurchaseOrderOrCustomerOrder;
  }
  
  export const createOrderTransactionAPI = async (input: CreateOrderTransactionInput, entityType: EntityType, user: CognitoUser): Promise<OrderChange> => {
    // Insertion fields for new Order
    const createdAtTimestamp = toAWSDateTime(dayjs());
    const typename = entityType === EntityType.CustomerOrder ? "CustomerOrder" : "PurchaseOrder";
  
    const transactionStatements = [
      getInsertOrderStatement(input, entityType, createdAtTimestamp),
      {
        Statement: `
          UPDATE "${tshirtTable.tableName}"
          SET ${tshirtTable.quantityFieldName[0]} = ${tshirtTable.quantityFieldName[0]} + ?
          WHERE ${tshirtTable.pkFieldName} = ?`,
        Parameters: [
          { N: tshirtQtyChange },
          { S: tshirtStyleNumber },
          { N: tshirtQtyChange },
        ]
      },
      {
        Statement: `
        UPDATE "${tshirtOrderTable.tableName}"
        SET ${tshirtOrderTable.quantityFieldName[0]} = ${tshirtOrderTable.quantityFieldName[0]} + ?
        SET ${tshirtOrderTable.quantityFieldName[1]} = ${tshirtOrderTable.quantityFieldName[1]} + ?
        WHERE ${tshirtOrderTable.pkFieldName} = ?`,
        Parameters: [
          { N: qtyDeltaStr }, { N: qtyDelta2Str }, { S: tshirtOrderId },
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