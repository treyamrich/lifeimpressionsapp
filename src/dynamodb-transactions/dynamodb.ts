import { AttributeValue, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers"
import awsmobile from "@/aws-exports";
import { CognitoUser } from '@aws-amplify/auth';
import { extractJWT } from "@/utils/cognitojwt";

export const createDynamoDBObj = async (user: CognitoUser) => {
    const REGION = "us-west-2";
    const IDENTITY_POOL_ID = awsmobile["aws_cognito_identity_pool_id"];
    const COGNITO_POOL_ID = awsmobile["aws_user_pools_id"]
    // MAKE SURE to attach the policy for the role that is assumed when logging in with this pool
    const COGNITO_POOL = `cognito-idp.${REGION}.amazonaws.com/${COGNITO_POOL_ID}`

    const dynamodbClient = new DynamoDBClient({
        region: REGION,
        credentials: fromCognitoIdentityPool({
            clientConfig: { region: REGION },
            identityPoolId: IDENTITY_POOL_ID,
            logins: {
                [COGNITO_POOL]: extractJWT(user)
            }
        })
    });
    return dynamodbClient;
}

const currentEnv = process.env.NEXT_PUBLIC_BUILD_ENV;
const envDevSuffix = "-gs6ngrttgnfvhl2tsnfjohefei-dev"
const envProdSuffix = '-2b7fbmfe6vhyvp6v7hmm6hxopm-prod'
const tableNameSuffix = currentEnv == "prod" ? envProdSuffix : envDevSuffix;

export interface DynamoDBTableInfo {
    tableName: string;
    pkFieldName: string | undefined;
}

export interface TShirtTableInfo extends DynamoDBTableInfo {
    quantityOnHandField: string;
}
export interface TShirtOrderTableInfo extends DynamoDBTableInfo {
    quantityField: string;
    amountReceivedField: string;
}


export const orderChangeTable: DynamoDBTableInfo = {
    tableName: `OrderChange${tableNameSuffix}`,
    pkFieldName: undefined,
}
export const tshirtTable: TShirtTableInfo = {
    tableName: `TShirt${tableNameSuffix}`,
    pkFieldName: "id",
    quantityOnHandField: "quantityOnHand",
}
export const tshirtOrderTable: TShirtOrderTableInfo = {
    tableName: `TShirtOrder${tableNameSuffix}`,
    pkFieldName: "id",
    quantityField: "quantity",
    amountReceivedField: "amountReceived"
}

export const purchaseOrderTable = `PurchaseOrder${tableNameSuffix}`;
export const customerOrderTable = `CustomerOrder${tableNameSuffix}`;

export const getStrOrNull = (str: string | undefined | null): AttributeValue => {
    return str ? { S: str } : { NULL: true };
}

export const getBoolOrNull = (bool: boolean | undefined | null): AttributeValue => {
    return bool !== undefined && bool !== null ? { BOOL: bool } : { NULL: true };
}