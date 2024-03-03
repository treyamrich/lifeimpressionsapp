import os
import json
from datetime import datetime, timedelta, timezone
# import requests
from dataclasses import dataclass
# from requests_aws4auth import AWS4Auth
# from boto3 import Session as AWSSession

def handler(event, context):
    print("received event:")
    print(event)

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        "body": json.dumps("Hello from your new Amplify Python lambda!"),
    }


def load_env_vars(file_path):
    with open(file_path, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):  # Ignore empty lines and comments
                key, value = line.split("=", 1)  # Split on the first occurrence of '='
                os.environ[key.strip()] = value.strip()


load_env_vars(os.path.join("..", ".env"))

GRAPHQL_ENDPOINT = os.environ["API_LIFEIMPRESSIONSAPP_GRAPHQLAPIENDPOINTOUTPUT"]
ACCESS_KEY = os.environ["AWS_ACCESS_KEY_ID"]
ACCESS_KEY_SECRET = os.environ["AWS_SECRET_ACCESS_KEY"]
REGION = os.environ["REGION"]
target_service = "appsync"

class MyDateTime:
    
    @staticmethod
    def parse_UTC(dt: str, hour_offset: int = 0) -> datetime:
        naive_datetime = datetime.strptime(dt, '%Y-%m-%dT%H:%M:%SZ')
        informed_datetime = naive_datetime.replace(tzinfo=timezone.utc)
        return MyDateTime.to_tz(informed_datetime, hour_offset)

    @staticmethod
    def to_tz(utc_time: datetime, hour_offset: int):
        tz = timezone(timedelta(hours=hour_offset))
        return utc_time.astimezone(tz)

    @staticmethod
    def to_ISO8601(tz_time: datetime) -> str:
        utc_time = tz_time.astimezone(timezone.utc)
        return utc_time.strftime('%Y-%m-%dT%H:%M:%SZ')
    
    @staticmethod
    def to_month_start(dt: datetime):
        return dt.replace(day=1, hour=0, minute=0, second=0)
    
@dataclass
class InventoryItem:
    id: str
    styleNumber: str
    color: str
    size: str
    quantityOnHand: int


@dataclass
class OrderItem:
    quantity: int
    amountReceived: int
    costPerUnit: float
    id: str
    createdAt: str
    updatedAt: str
    purchaseOrderOrderedItemsId: str
    customerOrderOrderedItemsId: str
    tShirtOrderTshirtId: str
    
    def is_customer_order(self):
        return self.customerOrderOrderedItemsId != None
    def is_purchase_order(self):
        return self.purchaseOrderOrderedItemsId != None
    def get_qty(self):
        return self.quantity if self.is_customer_order() else self.amountReceived
    def set_qty(self, new_qty: int):
        if self.is_customer_order():
            self.quantity = new_qty
        else:
            self.amountReceived = new_qty

@dataclass
class Query:
    name: str
    query: str


@dataclass
class EarliestUnsoldItem:
    datetime: str
    remaining_qty: int

@dataclass
class InventoryItemValue:
    itemId: str
    aggregateValue: float
    numUnsold: int
    inventoryQty: int
    earliestUnsold: str


class InventoryValueCache:

    def __init__(self, id: str, lastItemValues: list, createdAt: str, **kwargs):
        itemVals = map(lambda x: InventoryItemValue(**x), lastItemValues)
        self.data = {x.id: x for x in itemVals}
        self.id = id
        self.createdAt = createdAt

    def __setitem__(self, value: InventoryItemValue):
        self.data[value.item_id] = value

    def __getitem__(self, key) -> InventoryItemValue:
        return self.data.get(
            key,
            InventoryItemValue(
                itemId=key,
                earliestUnsold=None,
                aggregateValue=0.0,
                numUnsold=0,
                inventoryQty=0,
            ),
        )


class GraphQLException(Exception):
    def __init__(self, message=""):
        self.message = message
        super().__init__(self.message)


class GraphQLClient:

    def __init__(self):
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "x-api-key": os.environ["API_KEY"],  # REMOVE AFTER
        }
        # aws = AWSSession(aws_access_key_id=ACCESS_KEY,
        #     aws_secret_access_key=ACCESS_KEY_SECRET,
        #     region_name=REGION
        # )
        # credentials = aws.get_credentials().get_frozen_credentials()
        # auth = AWS4Auth(
        #     credentials.access_key,
        #     credentials.secret_key,
        #     aws.region_name,
        #     target_service,
        #     session_token=credentials.token,
        # )
        # session = requests.Session()
        # session.auth = auth
        # self.session = session

    def _make_request(self, q: Query, variables: dict):
        response = self.session.request(
            url=GRAPHQL_ENDPOINT,
            method="POST",
            headers=self.headers,
            json={"query": q.query, "variables": variables},
        )
        data = response.json()
        errors = data.get("errors", [])
        if len(errors) > 0:
            print(f"Error executing query '{q.name}'")
            print(json.dumps(errors, indent=3))
            raise GraphQLException
        return data


class PaginationIterator:
    def __init__(self, client: GraphQLClient, q: Query, variables: dict):
        self._client = client
        self._q = q
        self._page = []
        self._next_token = None
        self._idx = 0

        filters = variables.get("filter", {})  # Force filter out deleted items
        self._variables = {
            **variables,
            "filter": {**filters, "isDeleted": {"ne": True}},
        }

    def __iter__(self):
        self._get_next_page()
        return self

    def __next__(self):
        at_end_of_page = self._idx == len(self._page)
        at_last_page = self._next_token == None

        if at_end_of_page and at_last_page:
            raise StopIteration

        if at_end_of_page:
            self._get_next_page()

        item = self._page[self._idx]
        self._idx += 1
        return item

    def _get_next_page(self):
        response = self._client._make_request(self._q, self._variables)
        query_result = response["data"][self._q.name]
        self._page, self._next_token = query_result["items"], query_result["nextToken"]
        self._idx = 0
        self._variables["nextToken"] = self._next_token


class Main:
    QUERY_PAGE_LIMIT = 100
    SORT_DIRECTION = "ASC"

    def __init__(self, client: GraphQLClient = GraphQLClient()):
        self.client = client

    def run(self):
        total_inventory_value = 0.0
        curr_cache = self._get_current_cache()
        new_cache = InventoryValueCache()
        unsold_count_map = {}

        inventory = self._list_full_inventory()
        for item in inventory:
            new_item_val = self._get_unsold_items_value(curr_cache[item.id])
            total_inventory_value += new_item_val.aggregate_val
            unsold_count_map[item.id] = new_item_val.num_unsold
            new_cache[item.id] = new_item_val
            break
        Main._validate_unsold_counts(inventory, unsold_count_map)
        Main._write_new_cache(new_cache)

    def _list_full_inventory(self) -> list[InventoryItem]:
        it = PaginationIterator(
            self.client, Main.listTshirts, {"limit": Main.QUERY_PAGE_LIMIT}
        )
        return [InventoryItem(**x) for x in it]

    def _get_unsold_items_value(
        self, inventory_item: InventoryItemValue
    ) -> InventoryItemValue:
        # Returns the value and the earliest unsold item
        unsold_items = self._get_unsold_items(inventory_item)
        total_item_value = sum(map(lambda x: x.get_qty() * x.costPerUnit, unsold_items))
        num_unsold = 0
        return InventoryItemValue(
                earliestUnsold=unsold_items[0].updatedAt, #WHAT IF ALL WERE SOLD?
                aggregateValue=total_item_value,
                itemId=inventory_item.itemId,
                numUnsold=num_unsold,
                inventoryQty=0,
            )

    def _get_unsold_items(self, inventory_item: InventoryItemValue):
        it = PaginationIterator(
            self.client,
            Main.tshirtOrderByUpdatedAt,
            {
                "indexField": inventory_item.itemId,
                "sortDirection": Main.SORT_DIRECTION,
                "limit": Main.QUERY_PAGE_LIMIT,
                # "updatedAt": { 'ge': inventory_item.earliestUnsold, 'le': current_month }
            },
        )

        def convert_and_flip_qty(item_dict):
            order_item = OrderItem(**item_dict)
            # Returns become positive; customer orders become negative
            if order_item.is_customer_order():
                order_item.set_qty(-order_item.get_qty())
            return order_item
        
        is_same_sign = lambda a, b: a > 0 and b > 0 or a < 0 and b < 0
        
        q: list[OrderItem] = []
        for order_item_dict in it:
            curr = convert_and_flip_qty(order_item_dict)
            # STOP IF PAST DATE

            if not q or is_same_sign(curr.get_qty(), q[0].get_qty()):
                q.append(curr)
                continue
  
            while q and curr.get_qty() != 0:
                head = q[0]
                remainder = curr.get_qty() + head.get_qty()

                if remainder == 0:
                    q.pop(0)
                    curr.set_qty(0)
                elif is_same_sign(curr.get_qty(), remainder):
                    curr.set_qty(remainder)
                    q.pop(0)
                else:
                    head.set_qty(remainder)
                    curr.set_qty(0)

            if curr.get_qty() != 0:
                q.append(curr)
                    
            # print(f'i={i}', f'total:{sum(map(lambda x: x.get_qty(), q))}', [(x.get_qty(), x.id, 'CO' if x.is_customer_order() else 'PO') for x in q])
        return q
    
    def _validate_unsold_counts(
        inventory: list[InventoryItem], unsold_counts: dict[int]
    ):
        pass

    def _get_current_cache(self) -> InventoryValueCache:
        return InventoryValueCache()

    def _write_new_cache(self, new_cache: InventoryValueCache):
        pass

    listTshirts = Query(
        name="listTShirts",
        query="""
query ListTShirts(
    $id: ID
    $filter: ModelTShirtFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listTShirts(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        styleNumber
        color
        size
        quantityOnHand
      }
      nextToken
    }
  }
""",
    )

    tshirtOrderByUpdatedAt = Query(
        name="tshirtOrderByUpdatedAt",
        query="""
query TshirtOrderByUpdatedAt(
    $indexField: String!
    $updatedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelTShirtOrderFilterInput
    $limit: Int
    $nextToken: String
  ) {
    tshirtOrderByUpdatedAt(
      indexField: $indexField
      updatedAt: $updatedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        quantity
        amountReceived
        costPerUnit
        updatedAt
        id
        createdAt
        purchaseOrderOrderedItemsId
        customerOrderOrderedItemsId
        tShirtOrderTshirtId
      }
      nextToken
    }
  }""",
    )

# Main().run()
