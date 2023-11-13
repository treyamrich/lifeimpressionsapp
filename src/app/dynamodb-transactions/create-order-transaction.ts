import { toAWSDateTime } from "@/utils/datetimeConversions";
import dayjs from "dayjs";
import { EntityType } from "../(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { CognitoUser } from '@aws-amplify/auth';
import { ExecuteTransactionCommand, ParameterizedStatement } from "@aws-sdk/client-dynamodb";
import { TShirtOrder } from "@/API";
import { PurchaseOrderOrCustomerOrder } from "../graphql-helpers/create-apis";
import { createDynamoDBObj } from './dynamodb';
import { getInsertOrderStatement, getInsertTShirtOrderTablePartiQL, getUpdateTShirtTablePartiQL } from "./partiql-helpers";
import { v4 } from 'uuid';

export const getTShirtOrdersStatements = (
    orderedItems: TShirtOrder[],
    entityType: EntityType,
    createdAt: string,
    parentOrderUuid: string,
    allowNegativeInventory: boolean
): ParameterizedStatement[] => {
    const res: ParameterizedStatement[] = [];
    orderedItems.forEach((tshirtOrder: TShirtOrder) => {
        // Only decrement from TShirt table when it's a customer order
        if (entityType === EntityType.CustomerOrder) {
            const tshirtQtyChange = -tshirtOrder.quantity;
            res.push(
                getUpdateTShirtTablePartiQL(
                    tshirtQtyChange,
                    allowNegativeInventory,
                    createdAt,
                    tshirtOrder.tShirtOrderTshirtStyleNumber
                ));
        }
        // Add to TShirtOrder table
        const tshirtOrderId = v4();
        res.push(
            getInsertTShirtOrderTablePartiQL(
                entityType,
                parentOrderUuid,
                createdAt,
                tshirtOrder,
                tshirtOrderId
            )
        );
    });
    return res;
};

// If allow negative inventory is set to false, then an array of tshirt order style numbers will be returned that would've caused negative inventory
export const createOrderTransactionAPI = async (input: PurchaseOrderOrCustomerOrder, entityType: EntityType, user: CognitoUser, allowNegativeInventory: boolean): Promise<Array<string>> => {
    // Insertion fields for new Order
    const orderId = v4();
    const createdAtTimestamp = toAWSDateTime(dayjs());

    const orderedItems = input.orderedItems as any as TShirtOrder[]; // Locally orderedItems is just an array
    const transactionStatements: ParameterizedStatement[] = [
        getInsertOrderStatement(input, entityType, createdAtTimestamp, orderId),
        ...getTShirtOrdersStatements(orderedItems, entityType, createdAtTimestamp, orderId, allowNegativeInventory)
    ];
    const command = new ExecuteTransactionCommand({
        TransactStatements: transactionStatements
    });
    const dynamodbClient = await createDynamoDBObj(user);
    return dynamodbClient.send(command)
        .catch((e) => {
            if (!allowNegativeInventory && e.CancellationReasons) {
                const negativeInventoryShirts = e.CancellationReasons.slice(1)
                    .map((cancellationObj: any, index: number) => {
                        if (cancellationObj.Code === "ConditionalCheckFailed") {
                            return orderedItems[index].tShirtOrderTshirtStyleNumber;
                        }
                        return null;
                    })
                    .filter((x: string) => x != null);
                return negativeInventoryShirts;
            }
            console.log(e);
            throw new Error(`Failed to create ${entityType} order`);
        });
}