import {
  CreateOrderChangeInput,
  FieldChange,
  FieldChangeInput,
  OrderChange,
  TShirt,
} from "@/API";
import {
  tshirtSizeToLabel,
  tshirtTypeToLabel,
} from "@/app/(DashboardLayout)/inventory/InventoryTable/table-constants";
import { CognitoUser } from "@aws-amplify/auth";
import {
  ExecuteTransactionCommand,
  ParameterizedStatement,
} from "@aws-sdk/client-dynamodb";
import {
  getInsertOrderChangePartiQL,
  getUpdateTShirtTablePartiQL,
} from "./partiql-helpers";
import { v4 } from "uuid";
import { toAWSDateTime } from "@/utils/datetimeConversions";
import dayjs from "dayjs";
import { createDynamoDBObj } from "./dynamodb";

export type UpdateTShirtTransactionInput = {
  updatedTShirt: TShirt;
  createInventoryChangeInput: CreateOrderChangeInput;
};
export type UpdateTShirtTransactionResponse = {
  orderChange: OrderChange;
  tshirtUpdatedAtTimestamp: string;
};

export const UpdateTShirtTransactionAPI = async (
  input: UpdateTShirtTransactionInput,
  user: CognitoUser,
  refreshTokenFn?: () => Promise<CognitoUser | undefined>
): Promise<UpdateTShirtTransactionResponse> => {
  validateUpdateTShirtInput(input);

  let command = null;
  let response: UpdateTShirtTransactionResponse;
  try {
    const res = assembleUpdateOrderTransactionStatements(input);
    response = res.response;
    command = new ExecuteTransactionCommand({
      TransactStatements: res.transactionStatements,
    });
  } catch (e) {
    console.log(e);
    throw new Error(`Failed to update TShirt`);
  }

  const dynamodbClient = await createDynamoDBObj(user);
  return dynamodbClient
    .send(command)
    .then((onFulfilled) => response)
    .catch(async (e) => {
      // Retry and try refresh token
      if (e.message.includes("Token expired") && refreshTokenFn) {
        let updatedSession = await refreshTokenFn();
        if (updatedSession) {
          // Don't retry session renewal again
          return UpdateTShirtTransactionAPI(input, updatedSession);
        }
      }

      console.log(e.message);
      throw new Error(`Failed to update TShirt`);
    });
};

export type AssembleUpdateStatementsResult = {
  transactionStatements: ParameterizedStatement[];
  response: UpdateTShirtTransactionResponse;
};

export const assembleUpdateOrderTransactionStatements = (
  input: UpdateTShirtTransactionInput
): AssembleUpdateStatementsResult => {
  const { createInventoryChangeInput, updatedTShirt } = input;
  const orderChangeUuid = v4();
  const createdAtTimestamp = toAWSDateTime(dayjs());
  const fieldChanges: FieldChange[] =
    createInventoryChangeInput.fieldChanges.map(
      (fieldChange: FieldChangeInput) => ({
        ...fieldChange,
        __typename: "FieldChange",
      })
    );

  const transactionStatements: ParameterizedStatement[] = [
    getUpdateTShirtTablePartiQL(updatedTShirt, createdAtTimestamp),
    getInsertOrderChangePartiQL(
      orderChangeUuid,
      updatedTShirt.id,
      createdAtTimestamp,
      createInventoryChangeInput.reason,
      fieldChanges,
      { indexPartitionKey: 'InventoryChange' }
    ),
  ];

  // Assemble response
  const orderChange: OrderChange = {
    __typename: "OrderChange",
    id: orderChangeUuid,
    createdAt: createdAtTimestamp,
    updatedAt: createdAtTimestamp,
    orderChangeTshirtId: updatedTShirt.id,
    tshirt: updatedTShirt,
    reason: createInventoryChangeInput.reason,
    fieldChanges: fieldChanges,
  };

  const response: UpdateTShirtTransactionResponse = {
    orderChange: orderChange,
    tshirtUpdatedAtTimestamp: createdAtTimestamp,
  };

  return { response, transactionStatements };
};
const validateUpdateTShirtInput = (input: UpdateTShirtTransactionInput) => {
  const tshirt = input.updatedTShirt;
  const tshirtSizes = Object.keys(tshirtSizeToLabel);
  const tshirtTypes = Object.keys(tshirtTypeToLabel);

  if (!tshirtSizes.find((size) => size === tshirt.size))
    throw Error("Invalid TShirt size");
  if (!tshirtTypes.find((type) => type === tshirt.type))
    throw Error("Invalid TShirt type");
  if (!tshirt.color || tshirt.color.length <= 0)
    throw Error("Invalid TShirt color");
  if (!tshirt.brand || tshirt.brand.length <= 0)
    throw Error("Invalid TShirt brand");
  if (!tshirt.styleNumber || tshirt.styleNumber.length <= 0)
    throw Error("Invalid TShirt Style No.");
};
