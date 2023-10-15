import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import awsmobile from "@/aws-exports";

export const createDynamoDBObj = async () => {
    const REGION = "us-west-2";
    const IDENTITY_POOL_ID = awsmobile["aws_cognito_identity_pool_id"];

    //Get temp credentials
    const cognitoClient = new CognitoIdentityClient({ region: REGION });
    const creds = fromCognitoIdentityPool({
        client: cognitoClient,
        identityPoolId: IDENTITY_POOL_ID
    });

    //Create the dynamodb client
    const dynamodbClient = new DynamoDBClient({
        region: REGION,
        credentials: creds
    });

    return dynamodbClient;
}

export interface DynamoDBTableInfo {
    tableName: string;
    quantityFieldName: string[];
    pkFieldName: string | undefined;
}
export const customerOrderChangeTable: DynamoDBTableInfo = {
    tableName: "CustomerOrderChange-curfv2qbgze2dfrl5r7wrynenq-dev",
    quantityFieldName: ["orderedQuantityChange"],
    pkFieldName: undefined
}
export const purchaseOrderChangeTable: DynamoDBTableInfo = {
    tableName: "PurchaseOrderChange-curfv2qbgze2dfrl5r7wrynenq-dev",
    quantityFieldName: ["orderedQuantityChange", "quantityChange"],
    pkFieldName: undefined
}
export const tshirtTable: DynamoDBTableInfo = {
    tableName: "TShirt-curfv2qbgze2dfrl5r7wrynenq-dev",
    quantityFieldName: ["quantityOnHand"],
    pkFieldName: "styleNumber"
}
export const tshirtOrderTable: DynamoDBTableInfo = {
    tableName: "TShirtOrder-curfv2qbgze2dfrl5r7wrynenq-dev",
    quantityFieldName: ["quantity", "amountReceived"],
    pkFieldName: "id"
}