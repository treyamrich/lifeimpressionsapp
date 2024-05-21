import { CognitoUser } from "@aws-amplify/auth";
import {
  PurchaseOrderOrCustomerOrder,
  getConditionalUpdateTShirtTablePartiQL,
  getSoftDeleteTShirtOrderPartiQL,
  getUpdateOrderPartiQL,
} from "./partiql-helpers";
import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { createDynamoDBObj } from "./dynamodb";
import {
  ExecuteTransactionCommand,
  ParameterizedStatement,
} from "@aws-sdk/client-dynamodb";
import { TShirt, TShirtOrder } from "@/API";
import {
  fromUTC,
  getStartOfMonth,
  toAWSDateTime,
} from "@/utils/datetimeConversions";
import dayjs from "dayjs";
import { PreparedStatements } from "./create-order-transaction";
import { failedUpdateTShirtStr } from "@/utils/tshirtOrder";

export const deleteOrderTransactionAPI = async (
  input: PurchaseOrderOrCustomerOrder,
  orderedItems: TShirtOrder[],
  entityType: EntityType,
  user: CognitoUser,
  allowNegativeInventory: boolean,
  refreshTokenFn?: () => Promise<CognitoUser | undefined>
): Promise<Array<string>> => {
  validateDeleteOrderInput(input);
  let command = null;
  let transactionStatements: PreparedStatements;
  try {
    transactionStatements = assembleDeleteOrderTransactionStatements(
      input,
      orderedItems,
      entityType,
      allowNegativeInventory
    );
    command = new ExecuteTransactionCommand({
      TransactStatements: transactionStatements.statements
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
      const negativeInventoryShirts = e.CancellationReasons
        .map((cancellationObj: any, index: number) => {
          if (cancellationObj.Code === "ConditionalCheckFailed") {
            const tshirt = transactionStatements.statementIdxToTShirt[index];
            return failedUpdateTShirtStr(tshirt);
          }
          return null;
        })
        .filter((x: string) => x != null);
      return negativeInventoryShirts;
    }

    throw new Error(`Failed to delete ${entityType} order`);
  });
};

const validateDeleteOrderInput = (input: PurchaseOrderOrCustomerOrder) => {
  const isOrderFromLastMonth = fromUTC(input.createdAt) < getStartOfMonth(0);
  // Reason: Deleting orders affects the inventory value calculation
  if (isOrderFromLastMonth)
    throw Error("Cannot delete orders from prior months");
};

export const assembleDeleteOrderTransactionStatements = (
  input: PurchaseOrderOrCustomerOrder,
  orderedItems: TShirtOrder[],
  entityType: EntityType,
  allowNegativeInventory: boolean
): PreparedStatements => {
  const updatedAtTimestamp = toAWSDateTime(dayjs());
  const isDeleted = true;
  const tshirtOrderStatements = getDeleteTShirtOrdersStatements(
    orderedItems,
    entityType,
    updatedAtTimestamp,
    allowNegativeInventory,
    1 // b/c update order statement is idx 0
  );
  const transactionStatements: ParameterizedStatement[] = [
    getUpdateOrderPartiQL(entityType, input.id, updatedAtTimestamp, isDeleted),
    ...tshirtOrderStatements.statements,
  ];
  return {
    statements: transactionStatements,
    statementIdxToTShirt: tshirtOrderStatements.statementIdxToTShirt,
  };
};

const getDeleteTShirtOrdersStatements = (
  orderedItems: TShirtOrder[],
  entityType: EntityType,
  updatedAt: string,
  allowNegativeInventory: boolean,
  startingStatementIndex: number
): PreparedStatements => {
  let statementIdx = startingStatementIndex;
  const idxToTShirt: { [x: number]: TShirt } = {};
  const res: ParameterizedStatement[] = [];
  orderedItems.forEach((tshirtOrder: TShirtOrder) => {
    const amtReceived = tshirtOrder.amountReceived ?? 0;
    const tshirtQtyChange = entityType === EntityType.PurchaseOrder ? -amtReceived : tshirtOrder.quantity;
    if(tshirtQtyChange !== 0) {
      res.push(
        getConditionalUpdateTShirtTablePartiQL(
          tshirtQtyChange, 
          allowNegativeInventory, // Deleting POs potentially reduces inventory
          updatedAt,
          tshirtOrder.tshirt.id
        )
      );
      idxToTShirt[statementIdx++] = tshirtOrder.tshirt;
    }
    res.push(getSoftDeleteTShirtOrderPartiQL(tshirtOrder, updatedAt));
    statementIdx++;
  });
  return { statements: res, statementIdxToTShirt: idxToTShirt };
};
