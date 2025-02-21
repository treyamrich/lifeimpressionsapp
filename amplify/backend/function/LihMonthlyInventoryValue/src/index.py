from enum import Enum
import os
import json
from typing import Callable, Iterable, List, Optional, Tuple, Union
from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta, timezone
import requests
from dataclasses import asdict, dataclass
from requests_aws4auth import AWS4Auth
import boto3
import logging
import heapq
import threading

# Dev stuff
def load_env_vars(file_path):
    with open(file_path, "r") as f:
        for line in f:
            line = line.strip()
            # Ignore empty lines and comments
            if line and not line.startswith("#"):
                # Split on the first occurrence of '='
                key, value = line.split("=", 1)
                os.environ[key.strip()] = value.strip()

path = os.path.join("..", ".env")
if os.path.exists(path):
    load_env_vars(path)

GRAPHQL_ENDPOINT = os.environ["API_LIFEIMPRESSIONSAPP_GRAPHQLAPIENDPOINTOUTPUT"]
INV_VAL_CACHE_TABLE_NAME = os.environ["INV_VAL_CACHE_TABLE_NAME"]
TZ_UTC_HOUR_OFFSET = -10 # Pacific/Honolulu timezone

class MyDateTime:

    @staticmethod
    def parse_UTC(dt: str, hour_offset: int = 0) -> datetime:
        naive_datetime = datetime.strptime(dt, '%Y-%m-%dT%H:%M:%SZ')
        informed_datetime = naive_datetime.replace(tzinfo=timezone.utc)
        return MyDateTime.to_tz(informed_datetime, hour_offset)

    @staticmethod
    def get_now_UTC() -> datetime:
        return datetime.utcnow().replace(tzinfo=timezone.utc)

    def get_time_in_tz(t: datetime, hour_offset: int):
        return t.replace(tzinfo=timezone(timedelta(hours=hour_offset)))
        
    @staticmethod
    def to_tz(utc_time: datetime, hour_offset: int):
        tz = timezone(timedelta(hours=hour_offset))
        return utc_time.astimezone(tz)

    @staticmethod
    def to_ISO8601(tz_time: datetime, is_only_date: bool = False) -> str:
        utc_time = tz_time.astimezone(timezone.utc)
        if is_only_date: return utc_time.strftime('%Y-%m-%d')
        return utc_time.strftime('%Y-%m-%dT%H:%M:%SZ')

    @staticmethod
    def to_month_start(dt: datetime):
        return dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    @staticmethod
    def curr_month_start_in_tz(hour_offset: int) -> datetime:
        now = MyDateTime.get_now_UTC()
        now_tz = MyDateTime.to_tz(now, hour_offset)
        end = MyDateTime.to_month_start(now_tz)
        return end
    
    @staticmethod
    def date_range(start_inclusive: datetime, end_exclusive: datetime):
        start = start_inclusive
        while start < end_exclusive:
            rel_next_month = start + relativedelta(months=1)
            end = min(rel_next_month, end_exclusive)
            yield start, end
            start = end


@dataclass
class InventoryItem:
    id: str
    styleNumber: str
    color: str
    size: str
    quantityOnHand: int

@dataclass
class POReceival:
    quantity: int
    timestamp: str

@dataclass
class OrderItem:
    quantity: int
    amountReceived: int
    costPerUnit: float
    id: str
    createdAt: str
    updatedAt: str
    earliestTransaction: str
    latestTransaction: str
    purchaseOrderOrderedItemsId: str
    customerOrderOrderedItemsId: str
    tShirtOrderTshirtId: str
    receivals: Union[List[POReceival], None]

    def __post_init__(self):
        if self.amountReceived > 0 and not self.receivals:
            raise Exception('Missing or empty PO receivals when amt received > 0')
        if self.purchaseOrderOrderedItemsId:
            self.receivals = [POReceival(**recv_data) for recv_data in self.receivals] \
                if self.receivals else []

@dataclass
class QueueItem:
    qty: int = 0
    cost_per_unit: float = 0
    iso_dt: str = '1970-01-01T00:00:00Z'

    def __lt__(self, other):
        return self.iso_dt < other.iso_dt
    
@dataclass
class Query:
    name: str
    query: str
        

class GraphQLException(Exception):
    def __init__(self, message=""):
        self.message = message
        super().__init__(self.message)


class GraphQLClient:

    def __init__(self, use_api_key=False):
        api_key = {"x-api-key": os.environ["API_KEY"]} if use_api_key else {}
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            **api_key
        }
        
        session = requests.Session()
        credentials = boto3.session.Session().get_credentials()
        session.auth = AWS4Auth(
            credentials.access_key,
            credentials.secret_key,
            boto3.session.Session().region_name,
            'appsync',
            session_token=credentials.token
        )

        self.session = session

    def make_request(self, q: Query, variables: dict):
        response = self.session.request(
            url=GRAPHQL_ENDPOINT,
            method="POST",
            headers=self.headers,
            json={"query": q.query, "variables": variables},
        )
        resp = response.json()
        errors = resp.get("errors", [])
        if len(errors) > 0:
            logging.exception(f"Error executing query '{q.name}'\n{json.dumps(errors, indent=3)}")
            raise GraphQLException
        return resp['data'][q.name]

class DynamoDBClient:
    """
        Make sure the client credentials are set at ~/.aws/config for the
        AWS_ACCESS_KEY_ID AND AWS_SECRET_ACCESS_KEY variables
    """
    
    class DBOperation(Enum):
        NONE = 0
        INSERT = 1
        UPDATE = 2
    
    def __init__(self, client = None):
        
        self.client = boto3.client(
            'dynamodb',
            region_name='us-west-2'
        ) if not client else client
        
    @staticmethod
    def _to_attribute_val(x: dict):
        return DynamoDBClient._rec_to_attribute_val(x)['M']
    
    @staticmethod
    def _attr_to_attribute_val(attr):
        return DynamoDBClient._rec_to_attribute_val(attr)
    
    @staticmethod
    def _rec_to_attribute_val(x):
        if x == None:
            return None
        elif type(x) == dict:
            res = {}
            for k, v in x.items():
                attr_val = DynamoDBClient._rec_to_attribute_val(v)
                if not attr_val: continue
                res[k] = attr_val
            return {'M': res}
        elif type(x) == list:
            res = []
            for i in x:
                attr_val = DynamoDBClient._rec_to_attribute_val(i)
                if not attr_val: continue
                res.append(attr_val)
            return {'L': res}
        elif type(x) == int or type(x) == float:
            return {'N': str(x)}
        elif type(x) == str:
            return {'S': str(x)}
        elif type(x) == bool:
            return {'BOOL': x}
        raise Exception(f"New type '{type(x)}' with no conversion to DynamoDB AttributeValue")
        
    @staticmethod
    def _to_update_partiql(table_name: str, pk_field_name: str, item: dict):
        table_operation = f'UPDATE "{table_name}"'
        pk_where_clause = f'WHERE {pk_field_name} = ?'
        set_statements, params = list(zip(*[
            (f"SET {k} = ?", DynamoDBClient._attr_to_attribute_val(v))
            for k, v in item.items()
            if k != pk_field_name and v != None
        ]))
        statement = "\n".join([table_operation, *set_statements, pk_where_clause])
        params = (*params, DynamoDBClient._attr_to_attribute_val(item[pk_field_name]))
        return statement, params

    @staticmethod
    def _batch_operation(
        batch_transformer: Callable[[List], List], 
        batch_processor: Callable[[List], List], 
        items: List[dict]
    ):
        def partition_arr(items: list, size=25):
            res = []
            i = 0
            while len(items[i: i + size]):
                res.append(items[i: i + size])
                i += size
            return res
        
        batches = [batch_transformer(partition) for partition in partition_arr(items)]
        max_attempts = 6
        for i in range(max_attempts):
            if i > 0:
                logging.info(f'Unproccessed items: retry attempt {i}/{max_attempts-1}')
            
            unprocessed_items = []
            for batch in batches:
                try:
                    retry_items = batch_processor(batch)
                    unprocessed_items.extend(retry_items)
                except Exception as e:
                    logging.exception(e)
                
            if not len(unprocessed_items): return
            batches = partition_arr(unprocessed_items)
        
        return unprocessed_items
    
    def put_item(self, table_name: str, item: dict):
        self.client.put_item(
            TableName=table_name,
            Item=DynamoDBClient._to_attribute_val(item)
        )
    
    def batch_write_item(self, table_name: str, items: List[dict]) -> list:
        
        to_put_req_item = lambda x: {'PutRequest': { 'Item': DynamoDBClient._to_attribute_val(x) }}
        batch_transformer = lambda batch: { table_name: [to_put_req_item(x) for x in batch] }
        
        def batch_processor(request_item_batch: list):
            response = self.client.batch_write_item(RequestItems=request_item_batch)
            unprocessed_items = response['UnprocessedItems']
            return unprocessed_items
        
        return DynamoDBClient._batch_operation(
            batch_transformer,
            batch_processor,
            items
        )
        
    def batch_execute_statement(self, table_name: str, pk_field_name: str, items: List[Tuple[DBOperation, dict]]):
        
        def batch_transformer(batch: List[Tuple[DynamoDBClient.DBOperation, dict]]):
            to_statement = lambda statement, params: {
                'Statement': statement,
                'Parameters': params,
            }
            return [
                to_statement(*DynamoDBClient._to_update_partiql(table_name, pk_field_name, item))
                if op == DynamoDBClient.DBOperation.UPDATE else item
                for op, item in batch   
            ]
        
        def batch_processor(param_statements: list):
            response = self.client.batch_execute_statement(Statements=param_statements)
            unprocessed_items = [
                param_statements[i] 
                for i, r in enumerate(response['Responses']) 
                if 'Error' in r
            ]
            if unprocessed_items:
                logging.error(f'Error executing batch statements for these items: {unprocessed_items}')
            return unprocessed_items
        
        return DynamoDBClient._batch_operation(
            batch_transformer,
            batch_processor,
            items
        )
            
        
class PaginationIterator:
    def __init__(self, graphql_client: GraphQLClient, q: Query, variables: dict):
        self._graphql_client = graphql_client
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
        if not self._page:
            raise StopIteration
        
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
        resp = self._graphql_client.make_request(self._q, self._variables)
        self._page, self._next_token = resp["items"], resp["nextToken"]
        self._idx = 0
        self._variables["nextToken"] = self._next_token

class BucketUnit(Enum):
    DAY = "day"
    MONTH = "month"
    
class BucketIterator:
    """
        Iterates over a range of dates and returns a bucket (iterable) of data points in the range.
        Assumptions that MUST be true:
        - Data points timestamps are in UTC time ISO8601 format and are sorted in ascending order
        - Data points are within [start_inclusive, end_exclusive)
    """
    def __init__(self, start_inclusive: datetime, end_exclusive: datetime, unit: BucketUnit, data_source: Iterable[QueueItem]):
        self._data_source = data_source
        self._start = start_inclusive
        self._end = end_exclusive
        self._delta = relativedelta(days=1) if unit == BucketUnit.DAY else relativedelta(months=1)

    def __iter__(self):
        return self
    
    def __next__(self):
        if self._start >= self._end:
            raise StopIteration
        
        end = min(self._start + self._delta, self._end)
        res = []
        for x in self._data_source:
            d = MyDateTime.parse_UTC(x.iso_dt, TZ_UTC_HOUR_OFFSET)
            if self._start <= d < end:
                res.append(x)
        self._start = end
        return res

@dataclass
class InventoryItemValue:
    itemId: str
    aggregateValue: float = 0.0
    numUnsold: int = 0
    inventoryQty: int = 0

    poQueueHead: str = None
    poQueueHeadQtyRemain: int = 0
    coQueueHead: str = None
    coQueueHeadQtyRemain: int = 0
    
    tshirtStyleNumber: str = ''
    tshirtColor: str = ''
    tshirtSize: str = ''


class InventoryValueCache:

    def __init__(self, graphql_client: GraphQLClient, dynamodb_client: DynamoDBClient, created_date: datetime, table_name: str):
        self._data = {}
        self._dynamodb_client = dynamodb_client
        self._graphql_client = graphql_client
        self._created_date = created_date
        self._table_name = table_name

    def __setitem__(self, key: str, value: InventoryItemValue):
        self._data[key] = value

    def __getitem__(self, key) -> InventoryItemValue:
        return self._data.get(
            key,
            InventoryItemValue(key),
        )
    
    def get_created_date(self) -> datetime:
        return self._created_date
                    
    def read_db(self) -> 'InventoryValueCache':
        resp = self._graphql_client.make_request(
            InventoryValueCache.getInventoryValueCache, 
            { 'createdAt': MyDateTime.to_ISO8601(self._created_date, is_only_date=True) }
        )
        if not resp: 
            return

        lastItemVals = resp['lastItemValues']
        itemVals = map(lambda x: InventoryItemValue(**x), lastItemVals)
        self._data = {x.itemId: x for x in itemVals}
        return self
    
    def write_db(self):
        try:
            self._dynamodb_client.put_item(
                self._table_name,
                self._to_write_db_input()
            )
        except Exception as e:
            logging.exception(f'Failed to write cache to db key createdAt = {self._created_date}', extra={'error': str(e)})
            
    @staticmethod
    def batch_write_db(client: DynamoDBClient, caches: List['InventoryValueCache'], table_name: str):
        if len(caches) == 0: return
        if len(caches) == 1: 
            caches[0].write_db()
            return
        items = [c._to_write_db_input() for c in caches]
        unprocessed_list = client.batch_write_item(table_name, items)
        if unprocessed_list:
            logging.warning(f'Failed batch cache write. Unprocessed items: {unprocessed_list}')
    
    def _to_write_db_input(self) -> dict:
        return {
            'createdAt': MyDateTime.to_ISO8601(self._created_date, is_only_date=True),
            'updatedAt': MyDateTime.to_ISO8601(MyDateTime.get_now_UTC()),
            'lastItemValues': list(map(lambda x: asdict(x), self._data.values())),
        }
        
        
    getInventoryValueCache = Query('getInventoryValueCache',
    """
    query GetInventoryValueCache($createdAt: AWSDate!) {
        getInventoryValueCache(createdAt: $createdAt) {
            lastItemValues {
                aggregateValue
                itemId
                numUnsold
                inventoryQty
                poQueueHead
                poQueueHeadQtyRemain
                coQueueHead
                coQueueHeadQtyRemain
            }
        createdAt
        }
    }
    """)

class CacheExpiration:
    CACHE_EXPIRATION_ID = 'A'
    
    def __init__(self, start_inclusive: datetime, end_exclusive: datetime, graphql_client: GraphQLClient = GraphQLClient()):
        self._graphql_client = graphql_client
        self.start_i = start_inclusive
        self.start_inclusive, self.end_exclusive = self._get_expired_range(start_inclusive, end_exclusive)
    
    def get_expired_range(self) -> Tuple[datetime, datetime]:
        if not self.is_expired(): return None
        return self.start_inclusive, self.end_exclusive
    
    def is_expired(self) -> bool:
        return self.start_i != self.start_inclusive
    
    def _get_expired_range(
        self, 
        start_inclusive: datetime, 
        end_exclusive: datetime
    ) -> Tuple[datetime, datetime]:
        """
            When a cache is expired, we recalculate all caches after the earliest expired date up to the beginning of the current month.
            It's worth noting if end_exclusive was > the start of the current month, then the monthly report doesn't exist yet.
        """
        earliest_exp = 'earliestExpiredDate'
        resp = self._graphql_client.make_request(
            CacheExpiration.getCacheExpiration, { 'id': CacheExpiration.CACHE_EXPIRATION_ID})
        if not resp or resp[earliest_exp] == '': 
            return start_inclusive, end_exclusive

        try:
            new_start_incl = datetime.strptime(resp[earliest_exp], '%Y-%m-%d') \
                .replace(tzinfo=timezone(timedelta(hours=TZ_UTC_HOUR_OFFSET)))
        except ValueError:
            logging.exception(f"Cache expiration 'earliestExpiredDate' had malformed value {resp[earliest_exp]}")
            raise
        
        new_end_excl = MyDateTime.curr_month_start_in_tz(TZ_UTC_HOUR_OFFSET)
        
        dFmt = lambda x: x.strftime("%Y-%m-%d %H:%M:%S %Z")
        logging.warning("\n".join([
            f'Caches expired starting {new_start_incl}',
            f'Recalculating caches between the range: {dFmt(new_start_incl)} - {dFmt(new_end_excl)}',
        ]))
            
        return new_start_incl, new_end_excl
    
    def write_cache_renewal(self):
        self._graphql_client.make_request(
            CacheExpiration.updateCacheExpiration, 
            CacheExpiration.initial_cache_state_input
        )
        
    def create_cache_expiration(self):
        self._graphql_client.make_request(
            CacheExpiration.createCacheExpiration,
            CacheExpiration.initial_cache_state_input
        )
    
    initial_cache_state_input = {
        'input': {
            'id': CACHE_EXPIRATION_ID,
            'earliestExpiredDate': ''
        }
    }
    
    createCacheExpiration = Query('createCacheExpiration', 
    """
    mutation CreateCacheExpiration(
        $input: CreateCacheExpirationInput!
        $condition: ModelCacheExpirationConditionInput
    ) {
        createCacheExpiration(input: $input, condition: $condition) {
            earliestExpiredDate
        }
    }
    """)
    
    getCacheExpiration = Query('getCacheExpiration',
    """
        query GetCacheExpiration($id: String!) {
            getCacheExpiration(id: $id) {
                id
                earliestExpiredDate
                updatedAt
            }
        }
    """)
    
    updateCacheExpiration = Query('updateCacheExpiration',
    """
        mutation UpdateCacheExpiration(
            $input: UpdateCacheExpirationInput!
            $condition: ModelCacheExpirationConditionInput
        ) {
            updateCacheExpiration(input: $input, condition: $condition) {
                earliestExpiredDate
            }
        }
    """)

class ItemQueue:

    def __init__(self):
        self._items: List[QueueItem] = []
        self._value = 0.0
        self._total_qty = 0
    
    def load_items(self, items: List[QueueItem]) -> 'ItemQueue':
        """
            Loads more items into the unsold items queue. This increases the value and total qty.
        """
        for item in items:
            self._value += item.qty * item.cost_per_unit
            self._total_qty += item.qty
        self._items.extend(items)
        return self

    def evict_items(self, evict_count: int) -> int:
        """
            Sells items from the unsold items queue. This decreases the value and total qty.

            Returns the amount of items that were not sold due to lack of inventory.
        """
        while evict_count > 0 and self._items:
            item = self._items[0]
            remainder = item.qty - evict_count

            if remainder == 0:
                self._total_qty -= evict_count
                self._value -= evict_count * item.cost_per_unit
                self._items.pop(0)
                evict_count = 0
            elif remainder > 0:
                item.qty = remainder
                self._total_qty -= evict_count
                self._value -= evict_count * item.cost_per_unit
                evict_count = 0
            else:
                self._total_qty -= item.qty
                self._value -= item.qty * item.cost_per_unit
                self._items.pop(0)
                evict_count = -remainder

        return evict_count
    
    def peek(self) -> QueueItem:
        return self._items[0] if self._items else None
    
    def tail(self) -> QueueItem:
        return self._items[-1] if self._items else None
    
    def read_current_value(self):
        return self._value

    def read_current_qty(self):
        return self._total_qty
    
    def read_current_items(self):
        return self._items

class Main:
    QUERY_PAGE_LIMIT = 100
    SORT_DIRECTION_ASC = "ASC"
    TZ_UTC_HOUR_OFFSET = -10 # Pacific/Honolulu timezone
    
    def __init__(self, graphql_client: GraphQLClient = GraphQLClient(), dynamodb_client: DynamoDBClient = DynamoDBClient()):
        self.graphql_client = graphql_client
        self.dynamodb_client = dynamodb_client

    def get_inventory_values(self, start_inclusive: datetime, end_exclusive: datetime) -> List[InventoryValueCache]:
        self._validate_start_end(start_inclusive, end_exclusive)

        # e.g. if start_incl is Feb 18th, then prev_cache is Jan 1st
        prev_month = MyDateTime.to_month_start(start_inclusive) - relativedelta(months=1)

        initial_cache = None
        # Expired caches may not fall in range of [start_incl, end_excl) but this keeps the caches up to date
        cache_expiration = CacheExpiration(start_inclusive, end_exclusive)
        if cache_expiration.is_expired():
            renewed_caches = self.create_monthly_report(None, None, cache_expiration)
            initial_cache = filter(lambda x: x.get_created_date() == prev_month, renewed_caches)
            initial_cache = next(initial_cache, None)

        if not initial_cache:
            initial_cache = self._build_inventory_val_cache(prev_month).read_db()
    
        return

    def create_monthly_report(self, start_inclusive: datetime, end_exclusive: datetime, cache_expiration: CacheExpiration = None) -> List[InventoryValueCache]:
        """
            Given a range of dates, calculates the value of each month's inventory and saves it to DynamoDB.
            If the cache is expired, it will recalculate the cache from the earliest expired date up to the beginning of the current month.
        """
        self._validate_start_end(start_inclusive, end_exclusive)

        new_start_incl, new_end_excl = start_inclusive, end_exclusive
        cache_expiration = cache_expiration or CacheExpiration(start_inclusive, end_exclusive)
        if cache_expiration.is_expired():
            new_start_incl, new_end_excl = cache_expiration.get_expired_range()

        prev_month = new_start_incl - relativedelta(months=1)
        last_good_cache = self._build_inventory_val_cache(prev_month).read_db()
          
        inventory = self._list_full_inventory()
        caches: List[InventoryValueCache] = []
        for start, end in MyDateTime.date_range(new_start_incl, new_end_excl):
            prev_cache = caches[-1] if caches else last_good_cache
            caches.append(
                self.calculate_inventory_balance(start, end, inventory, prev_cache)
            )
        
        InventoryValueCache.batch_write_db(
            self.dynamodb_client,
            caches,
            INV_VAL_CACHE_TABLE_NAME
        )
            
        cache_expiration.write_cache_renewal()
        return caches
            
    def calculate_inventory_balance(
        self,
        start_inclusive: datetime,
        end_exclusive: datetime,
        inventory: list[InventoryItem],
        prev_cache: InventoryValueCache
    ) -> InventoryValueCache:
        new_cache = self._build_inventory_val_cache(start_inclusive)

        lock = threading.Lock()
        num_workers = os.cpu_count()

        def worker(item: InventoryItem):
            v = self._get_unsold_items_value(
                prev_cache[item.id], 
                start_inclusive, 
                end_exclusive
            )
            v.inventoryQty = item.quantityOnHand
            v.tshirtColor = item.color
            v.tshirtSize = item.size
            v.tshirtStyleNumber = item.styleNumber
            with lock:
                new_cache[item.id] = v
        
        for i in range(0, len(inventory), num_workers):
            items = inventory[i:i+num_workers]
            threads = []
            for item in items:
                thread = threading.Thread(target=worker, args=(item,))
                thread.start()
                threads.append(thread)
            for thread in threads:
                thread.join()

        return new_cache
    
    def _list_full_inventory(self) -> list[InventoryItem]:
        it = PaginationIterator(
            self.graphql_client, Main.listTshirts, {"limit": Main.QUERY_PAGE_LIMIT}
        )
        return [InventoryItem(**x) for x in it]

    def _get_order_items_iterators(
        self,
        prev_item_val: InventoryItemValue, 
        start_inclusive: datetime, 
        end_exclusive: datetime
    ) -> Tuple[PaginationIterator, PaginationIterator]:
        
        start = MyDateTime.to_ISO8601(start_inclusive)
        end = MyDateTime.to_ISO8601(end_exclusive - relativedelta(seconds=1))
        start_po = prev_item_val.poQueueHead \
            if prev_item_val.poQueueHead else start
        start_co = prev_item_val.coQueueHead \
            if prev_item_val.coQueueHead else start
        
        def get_it(transac_type: str):
            is_PO = transac_type == 'PO'
            start = start_po if is_PO else start_co
            qty_filter = {"amountReceived": { "gt": 0}} if is_PO else {"quantity": { "gt": 0}}
            return PaginationIterator(
                self.graphql_client,
                Main.tshirtTransactionQueues,
                {
                    "indexField": f'{prev_item_val.itemId}-{transac_type}',
                    "sortDirection": Main.SORT_DIRECTION_ASC,
                    "limit": Main.QUERY_PAGE_LIMIT,
                    "earliestTransaction": {'lt': end},
                    "filter": {
                        "latestTransaction": {"ge": start},
                        **qty_filter
                    }
                },
            )
        
        """ This works because each interval is sorted by start
            All values in interval are sorted, and next interval starts after, 
            but they may overlap"""
        po_heap = []
        def POs_generator(it):
            for po in it:
                item = OrderItem(**po)
                for x in item.receivals:
                    if x.timestamp < start or x.timestamp >= end:
                        continue
                    receival = QueueItem(
                        qty = x.quantity, 
                        cost_per_unit = item.costPerUnit, 
                        iso_dt = x.timestamp
                    )
                    heapq.heappush(po_heap, receival)
                if po_heap:
                    yield heapq.heappop(po_heap)
            while po_heap:
                yield heapq.heappop(po_heap)
        
        def CO_generator(it):
            for co in it:
                item = OrderItem(**co)
                yield QueueItem(
                    qty = item.quantity, 
                    cost_per_unit = item.costPerUnit, 
                    iso_dt = item.earliestTransaction
                )
        return CO_generator(get_it('CO')), POs_generator(get_it('PO'))


    def _get_unsold_items_value(
        self, 
        prev_inventory_item: InventoryItemValue, 
        start_inclusive: datetime, 
        end_exclusive: datetime
    ) -> InventoryItemValue:
        unsold_POs, unproc_COs = self._get_unsold_items(
            prev_inventory_item, start_inclusive, end_exclusive)

        res = InventoryItemValue(
            itemId = prev_inventory_item.itemId, 
            aggregateValue = prev_inventory_item.aggregateValue
        )
            
        # Loop over each bucket size (day or month)
        # 
        po_queue = ItemQueue()
        co_queue = ItemQueue()

        po_queue.load_items(unsold_POs)
        co_queue.load_items(unproc_COs)

        num_to_sell = co_queue.read_current_qty()
        num_over_sold = po_queue.evict_items(num_to_sell)
        num_to_sell -= num_over_sold

        # Set the new queue heads
        res.poQueueHead = MyDateTime.to_ISO8601(end_exclusive)
        res.coQueueHead = res.poQueueHead

        if unsold_POs:
            res.poQueueHead = unsold_POs[0].iso_dt
            res.poQueueHeadQtyRemain = unsold_POs[0].qty
        if unproc_COs:
            res.coQueueHead = unproc_COs[0].iso_dt
            res.coQueueHeadQtyRemain = unproc_COs[0].qty

        return res

    def _get_unsold_items(
        self,
        prev_item_val: InventoryItemValue, 
        start_inclusive: datetime, 
        end_exclusive: datetime
    ) -> Tuple[List[QueueItem], List[QueueItem]]:

        def get(it: PaginationIterator) -> QueueItem: 
            return next(it, None)

        co_it, po_it = self._get_order_items_iterators(
            prev_item_val, 
            start_inclusive, 
            end_exclusive
        )
        co_item, po_item = get(co_it), get(po_it)
        if po_item and prev_item_val.poQueueHeadQtyRemain:
            po_item.qty = prev_item_val.poQueueHeadQtyRemain
        if co_item and  prev_item_val.coQueueHeadQtyRemain:
            co_item.qty = prev_item_val.coQueueHeadQtyRemain

        while co_item and po_item:
            remainder = po_item.qty - co_item.qty
            if remainder == 0:
                co_item, po_item = get(co_it), get(po_it)
            elif remainder > 0:
                po_item.qty = remainder
                co_item = get(co_it)
            else:
                co_item.qty = -remainder
                po_item = get(po_it)

        POs, COs = [], []
        if po_item:
            POs = [po_item, *[x for x in po_it]]
        if co_item:
            COs = [co_item, *[x for x in co_it]]
        return POs, COs
    
    def _validate_start_end(self, start_inclusive: datetime, end_exclusive) -> bool:
        to_iso = lambda x: MyDateTime.to_ISO8601(x)
        if start_inclusive >= end_exclusive:
            logging.warning(
                'Start date is greater than end date', 
                extra={'start': to_iso(start_inclusive), 'end': to_iso(end_exclusive)}
            )
            raise ValueError('Start date is greater than end date')
    
    def _build_inventory_val_cache(self, created_date: datetime) -> InventoryValueCache:
        return InventoryValueCache(self.graphql_client, self.dynamodb_client, created_date, INV_VAL_CACHE_TABLE_NAME)

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

    tshirtTransactionQueues = Query(
        name="tshirtTransactionQueues",
        query="""
query TshirtTransactionQueues(
  $indexField: String!
  $earliestTransaction: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelTShirtOrderFilterInput
  $limit: Int
  $nextToken: String
) {
  tshirtTransactionQueues(
    indexField: $indexField
    earliestTransaction: $earliestTransaction
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      quantity
      costPerUnit
      amountReceived
      receivals {
        timestamp
        quantity
      }
      earliestTransaction
      latestTransaction
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
    

def get_start_end(event):
    expected_keys = ['start_inclusive', 'end_exclusive']
    had_one_key = False
    for k in expected_keys:
        had_one_key = had_one_key or k in event
            
    if not had_one_key:
        end = MyDateTime.curr_month_start_in_tz(TZ_UTC_HOUR_OFFSET)
        start = end - relativedelta(months=1)
        return start, end

    try:
        hr_offset_pos = abs(TZ_UTC_HOUR_OFFSET)
        s, e = event['start_inclusive'], event['end_exclusive']
        start = datetime(s['year'], s['month'], 1, hour=hr_offset_pos, tzinfo=timezone.utc)
        end = datetime(e['year'], e['month'], 1, hour=hr_offset_pos, tzinfo=timezone.utc)
        return start, end
    except Exception as e:
        logging.exception(f'create_monthly_inventory_val_report: Invalid start or end date\n{e}')
        raise ValueError('Invalid start or end date')

def create_monthly_inventory_val_report(event):
    s, e = get_start_end(event)
    logging.info('create_monthly_inventory_val_report: invoked')

    Main()

    print('Run success for start inclusive: {} and end exclusive: {}'.format(s, e))

def get_inventory_values(event):
    if any(x not in event for x in ['start_inclusive', 'end_exclusive']):
        logging.exception('get_inventory_values: Missing start_inclusive or end_exclusive')
        raise ValueError('Missing start_inclusive or end_exclusive')
    logging.info('get_inventory_values: invoked')
    
    Main()

def handler(event, context):
    logging.info(f"received event\n{event}")
    
    command_type = event.get('command_type')
    if command_type == 'create_monthly_inventory_val_report':
        create_monthly_inventory_val_report(event)
        return {"statusCode": 200}
    elif command_type == 'get_inventory_values':
        return get_inventory_values(event)
    logging.error(f"Unknown command type '{command_type}'")
    raise ValueError(f"Unknown command type '{command_type}'")