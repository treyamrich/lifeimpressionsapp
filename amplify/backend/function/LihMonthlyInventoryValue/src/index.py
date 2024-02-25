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

class Query:
    def __init__(self, name: str, query: str):
        self.name = name
        self.query = query

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



    def _query(self, q: Query, v: dict):
        response = self.session.request(
            url=GRAPHQL_ENDPOINT,
            method='POST',
            headers=self.headers,
            json={'query': q.query, 'variables': v}
        )

        filename = f'{q.name}_cached_output.json'
        if os.path.exists(filename):
            res = ""
            with open(filename, 'r') as f:
                res = f.read()
            return json.loads(res)
        else:
            with open(filename, 'w') as f:
                f.write(json.dumps(response.json(), indent=3))

        return response.json()
    
    def list_query(self, q: Query, v: dict) -> list:
        data = self._query(q, v)
        return data['data'][q.name]['items']

class OrderItem:
    def __init__(self, quantity: int, amountReceived: int, costPerUnit: float, id: str, 
                 createdAt: str, updatedAt: str,
                 purchaseOrderOrderedItemsId: str,
                 customerOrderOrderedItemsId: str,
                 tShirtOrderTshirtId: str,
                 **kwargs):
        self.quantity = quantity
        self.amountReceived = amountReceived
        self.costPerUnit = costPerUnit
        self.id = id
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.purchaseOrderOrderedItemsId = purchaseOrderOrderedItemsId
        self.customerOrderOrderedItemsId = customerOrderOrderedItemsId
        self.tShirtOrderTshirtId = tShirtOrderTshirtId

class Order:
    def __init__(self, id: str, orderedItems: list, createdAt: str, updatedAt: str, **kwargs):
        self.id = id
        self.orderedItems = [OrderItem(**x) for x in orderedItems['items']]
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.typename = kwargs['__typename']

class Main:

    def __init__(self):
        client = GraphQLClient()

        resp = client.list_query(
            Main.purchaseOrdersByCreatedAt, 
            { 
                'type': 'PurchaseOrder'
            }
        )
        POs = [Order(**x) for x in resp]
        print(POs[0].typename)
        

    purchaseOrdersByCreatedAt = Query('purchaseOrdersByCreatedAt', """
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
                orderedItems {
                    items {
                        quantity
                        amountReceived
                        costPerUnit
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
                createdAt
                updatedAt
                __typename
            }
            nextToken
            __typename
        }
    }
    """)

    customerOrdersByCreatedAt = Query('customerOrdersByCreatedAt', """
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
                    quantity
                    amountReceived
                    costPerUnit
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
    """)
Main()