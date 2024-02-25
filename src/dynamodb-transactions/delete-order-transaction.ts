import { CognitoUser } from "@aws-amplify/auth";
import {
  PurchaseOrderOrCustomerOrder,
  getConditionalUpdateTShirtTablePartiQL,
  getDeleteTShirtOrderPartiQL,
  getUpdateOrderPartiQL,
} from "./partiql-helpers";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { createDynamoDBObj } from "./dynamodb";
import {
  ExecuteTransactionCommand,
  ParameterizedStatement,
} from "@aws-sdk/client-dynamodb";
import { TShirtOrder } from "@/API";
import { toAWSDateTime } from "@/utils/datetimeConversions";
import dayjs from "dayjs";

export const deleteOrderTransactionAPI = async (
  input: PurchaseOrderOrCustomerOrder,
  orderedItems: TShirtOrder[],
  entityType: EntityType,
  user: CognitoUser,
  allowNegativeInventory: boolean,
  refreshTokenFn?: () => Promise<CognitoUser | undefined>
): Promise<Array<string>> => {

  let command = null;
  try {
    command = new ExecuteTransactionCommand({
      TransactStatements: assembleDeleteOrderTransactionStatements(
        input,
        orderedItems,
        entityType,
        allowNegativeInventory
      ),
    });
  } catch (e) {
    console.log(e);
    throw new Error(`Failed to delete ${entityType} order`);
  }

  const dynamodbClient = await createDynamoDBObj(user);
  return dynamodbClient.send(command).catch(async (e) => {
    // Retry and try refresh token
    if (e.message.includes("Token expired") && refreshTokenFn) {
      let updatedSession = await refreshTokenFn();
      if (updatedSession) {
        // Don't retry session renewal again
        return deleteOrderTransactionAPI(
          input,
          orderedItems,
          entityType,
          updatedSession,
          allowNegativeInventory
        );
      }
    }

    if (!allowNegativeInventory && e.CancellationReasons) {
      const negativeInventoryShirts = e.CancellationReasons.slice(1)
        .map((cancellationObj: any, index: number) => {
          if (cancellationObj.Code === "ConditionalCheckFailed") {
            const tshirt = orderedItems[index].tshirt;
            return `Style#: ${tshirt.styleNumber} | Size: ${tshirt.size} | Color: ${tshirt.color}`;
          }
          return null;
        })
        .filter((x: string) => x != null);
      return negativeInventoryShirts;
    }

    throw new Error(`Failed to delete ${entityType} order`);
  });
};

export const assembleDeleteOrderTransactionStatements = (
  input: PurchaseOrderOrCustomerOrder,
  orderedItems: TShirtOrder[],
  entityType: EntityType,
  allowNegativeInventory: boolean
): ParameterizedStatement[] => {
  const updatedAtTimestamp = toAWSDateTime(dayjs());
  const isDeleted = true;
  const transactionStatements: ParameterizedStatement[] = [
    getUpdateOrderPartiQL(entityType, input.id, updatedAtTimestamp, isDeleted),
    ...getDeleteTShirtOrdersStatements(
      orderedItems,
      entityType,
      updatedAtTimestamp,
      allowNegativeInventory
    ),
  ];
  return transactionStatements;
};

const getDeleteTShirtOrdersStatements = (
  orderedItems: TShirtOrder[],
  entityType: EntityType,
  updatedAt: string,
  allowNegativeInventory: boolean
): ParameterizedStatement[] => {
  const res: ParameterizedStatement[] = [];
  orderedItems.forEach((tshirtOrder: TShirtOrder) => {
    const amtReceived = tshirtOrder.amountReceived ?? 0;
    const tshirtQtyChange =
      entityType === EntityType.CustomerOrder
        ? tshirtOrder.quantity
        : -amtReceived;
    res.push(
      getConditionalUpdateTShirtTablePartiQL(
        tshirtQtyChange,
        allowNegativeInventory,
        updatedAt,
        tshirtOrder.tshirt.id
      )
    );
    res.push(getDeleteTShirtOrderPartiQL(tshirtOrder, updatedAt));
  });
  return res;
};
