import json
import requests
from requests_aws4auth import AWS4Auth
from boto3 import Session as AWSSession
import os

def handler(event, context):
  print('received event:')
  print(event)
  
  return {
      'statusCode': 200,
      'headers': {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      },
      'body': json.dumps('Hello from your new Amplify Python lambda!')
  }

def load_env_vars(file_path):
    with open(file_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):  # Ignore empty lines and comments
                key, value = line.split('=', 1)  # Split on the first occurrence of '='
                os.environ[key.strip()] = value.strip()

load_env_vars('..\.env')

GRAPHQL_ENDPOINT =  os.environ['API_LIFEIMPRESSIONSAPP_GRAPHQLAPIENDPOINTOUTPUT']
ACCESS_KEY = os.environ['AWS_ACCESS_KEY_ID']
ACCESS_KEY_SECRET = os.environ['AWS_SECRET_ACCESS_KEY']
REGION = os.environ['REGION']
target_service = 'appsync'

class GraphQLClient:
    
    def __init__(self):
        # aws = AWSSession(aws_access_key_id=ACCESS_KEY,
        #     aws_secret_access_key=ACCESS_KEY_SECRET,
        #     region_name=REGION
        # )
        # credentials = aws.get_credentials().get_frozen_credentials()

        self.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': os.environ['API_KEY']
        }
        
        # auth = AWS4Auth(
        #     credentials.access_key,
        #     credentials.secret_key,
        #     aws.region_name,
        #     target_service,
        #     session_token=credentials.token,
        # )

        session = requests.Session()
        # session.auth = auth
        self.session = session


    def query(self, q: str, v: dict):
        response = self.session.request(
            url=GRAPHQL_ENDPOINT,
            method='POST',
            headers=self.headers,
            json={'query': q, 'variables': v}
        )
        return response
    
class Main:

    def __init__(self):
        client = GraphQLClient()

        resp = client.query(
            Main.purchaseOrdersByCreatedAt, 
            { 
                'type': 'PurchaseOrder'
            }
        )
        print(resp.text)
        
    purchaseOrdersByCreatedAt = """
    query PurchaseOrdersByCreatedAt(
        $type: String!
        $createdAt: ModelStringKeyConditionInput
        $sortDirection: ModelSortDirection
        $filter: ModelPurchaseOrderFilterInput
        $limit: Int
        $nextToken: String
    ) {
        purchaseOrdersByCreatedAt(
        type: $type
        createdAt: $createdAt
        sortDirection: $sortDirection
        filter: $filter
        limit: $limit
        nextToken: $nextToken
        ) {
        items {
            id
            orderNumber
            vendor
            orderedItems {
            items {
                tshirt {
                id
                styleNumber
                brand
                color
                size
                type
                quantityOnHand
                isDeleted
                indexField
                createdAt
                updatedAt
                __typename
                }
                quantity
                amountReceived
                costPerUnit
                discount
                id
                createdAt
                updatedAt
                purchaseOrderOrderedItemsId
                customerOrderOrderedItemsId
                tShirtOrderTshirtId
                __typename
            }
            nextToken
            __typename
            }
            orderNotes
            status
            changeHistory {
            items {
                tshirt {
                id
                styleNumber
                brand
                color
                size
                type
                quantityOnHand
                isDeleted
                indexField
                createdAt
                updatedAt
                __typename
                }
                reason
                fieldChanges {
                oldValue
                newValue
                fieldName
                __typename
                }
                createdAt
                indexField
                id
                updatedAt
                purchaseOrderChangeHistoryId
                customerOrderChangeHistoryId
                orderChangeTshirtId
                __typename
            }
            nextToken
            __typename
            }
            taxRate
            shipping
            shippingAddress
            fees
            discount
            dateExpected
            isDeleted
            type
            createdAt
            updatedAt
            __typename
        }
        nextToken
        __typename
        }
    }
    """

    customerOrdersByCreatedAt = """
    query CustomerOrdersByCreatedAt(
        $type: String!
        $createdAt: ModelStringKeyConditionInput
        $sortDirection: ModelSortDirection
        $filter: ModelCustomerOrderFilterInput
        $limit: Int
        $nextToken: String
    ) {
        customerOrdersByCreatedAt(
        type: $type
        createdAt: $createdAt
        sortDirection: $sortDirection
        filter: $filter
        limit: $limit
        nextToken: $nextToken
        ) {
        items {
            id
            customerName
            customerEmail
            customerPhoneNumber
            orderedItems {
            items {
                tshirt {
                id
                styleNumber
                brand
                color
                size
                type
                quantityOnHand
                isDeleted
                indexField
                createdAt
                updatedAt
                __typename
                }
                quantity
                amountReceived
                costPerUnit
                discount
                id
                createdAt
                updatedAt
                purchaseOrderOrderedItemsId
                customerOrderOrderedItemsId
                tShirtOrderTshirtId
                __typename
            }
            nextToken
            __typename
            }
            orderNumber
            orderStatus
            orderNotes
            dateNeededBy
            changeHistory {
            items {
                tshirt {
                id
                styleNumber
                brand
                color
                size
                type
                quantityOnHand
                isDeleted
                indexField
                createdAt
                updatedAt
                __typename
                }
                reason
                fieldChanges {
                oldValue
                newValue
                fieldName
                __typename
                }
                createdAt
                indexField
                id
                updatedAt
                purchaseOrderChangeHistoryId
                customerOrderChangeHistoryId
                orderChangeTshirtId
                __typename
            }
            nextToken
            __typename
            }
            taxRate
            discount
            isDeleted
            type
            createdAt
            updatedAt
            __typename
        }
        nextToken
        __typename
        }
    }
    """
Main()