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
            clientConfig: { region: REGION},
            identityPoolId: IDENTITY_POOL_ID,
            logins: {
                [COGNITO_POOL]: extractJWT(user)
            }
        })
    });
    return dynamodbClient;
}

const currEnv = process.env.USER_BRANCH;
const envDevSuffix = "-5ktuld3bsvhrtf5yisjz2dini4-dev"
const envProdSuffix = '-ikejhqyezjd3ja2shc4nwvbq6y-prod'
const tableNameSuffix = currEnv == "prod" ? envProdSuffix : envDevSuffix;

export interface DynamoDBTableInfo {
    tableName: string;
    quantityFieldName: string[];
    pkFieldName: string | undefined;
}

export const customerOrderChangeTable: DynamoDBTableInfo = {
    tableName: `CustomerOrderChange${tableNameSuffix}`,
    quantityFieldName: ["orderedQuantityChange"],
    pkFieldName: undefined
}
export const purchaseOrderChangeTable: DynamoDBTableInfo = {
    tableName: `PurchaseOrderChange${tableNameSuffix}`,
    quantityFieldName: ["orderedQuantityChange", "quantityChange"],
    pkFieldName: undefined
}
export const tshirtTable: DynamoDBTableInfo = {
    tableName: `TShirt${tableNameSuffix}`,
    quantityFieldName: ["quantityOnHand"],
    pkFieldName: "id"
}
export const tshirtOrderTable: DynamoDBTableInfo = {
    tableName: `TShirtOrder${tableNameSuffix}`,
    quantityFieldName: ["quantity", "amountReceived"],
    pkFieldName: "id"
}

export const purchaseOrderTable = `PurchaseOrder${tableNameSuffix}`;
export const customerOrderTable = `CustomerOrder${tableNameSuffix}`;

export const getStrOrNull = (str: string | undefined | null): AttributeValue => {
    return str ? { S: str } : { NULL: true };
}