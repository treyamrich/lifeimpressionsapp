from abc import ABC, abstractmethod
from collections import OrderedDict
from decimal import Decimal
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
import flask
import awsgi

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
TZ_UTC_HOUR_OFFSET = -10  # Pacific/Honolulu timezone


class StepSize(Enum):
    MONTH = "MONTH"
    DAY = "DAY"


class MyDateTime:

    @staticmethod
    def parse_UTC(dt: str, hour_offset: int = 0) -> datetime:
        naive_datetime = datetime.strptime(dt, "%Y-%m-%dT%H:%M:%SZ")
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
        if not isinstance(tz_time, datetime):
            raise ValueError("Invalid datetime object")
        utc_time = tz_time.astimezone(timezone.utc)
        if is_only_date:
            return utc_time.strftime("%Y-%m-%d")
        return utc_time.strftime("%Y-%m-%dT%H:%M:%SZ")

    @staticmethod
    def to_month_start(dt: datetime):
        return dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    @staticmethod
    def curr_month_start_in_tz(hour_offset: int) -> datetime:
        now = MyDateTime.get_now_UTC()
        now_tz = MyDateTime.to_tz(now, hour_offset)
        end = MyDateTime.to_month_start(now_tz)
        return end


class DateRange:
    def __init__(
        self,
        start_inclusive: datetime,
        end_exclusive: datetime,
        step_size: StepSize = StepSize.MONTH,
    ):
        self.start_inclusive = start_inclusive
        self.end_exclusive = end_exclusive
        self.current = self.start_inclusive
        self._validate()
        self.set_step_size(step_size)

    def __iter__(self):
        self.current = self.start_inclusive
        return self

    def __next__(self):
        if self.current >= self.end_exclusive:
            raise StopIteration
        start = self.current
        end = min(start + self.delta, self.end_exclusive)
        self.current = end
        return start, end

    def __eq__(self, other: "DateRange") -> bool:
        return (
            self.get_bounds() == other.get_bounds()
            and self.get_step_size() == other.get_step_size()
        )

    def __repr__(self):
        return f"({self.start_inclusive}, {self.end_exclusive}, step_size = {self.step_size})"

    def set_step_size(self, step_size: StepSize):
        if self.current != self.start_inclusive:
            raise ValueError("Cannot change step size after iteration has started")
        self.step_size = step_size
        self.delta = (
            relativedelta(months=1)
            if self.step_size == StepSize.MONTH
            else relativedelta(days=1)
        )

    def get_bounds(self) -> Tuple[datetime, datetime]:
        return self.start_inclusive, self.end_exclusive

    def get_step_size(self) -> StepSize:
        return self.step_size

    def _validate(self) -> bool:
        to_iso = lambda x: MyDateTime.to_ISO8601(x)
        if self.start_inclusive >= self.end_exclusive:
            logging.warning(
                "Start date is greater than end date",
                extra={
                    "start": to_iso(self.start_inclusive),
                    "end": to_iso(self.end_exclusive),
                },
            )
            raise ValueError("Start date is greater than end date")


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
    costPerUnit: Decimal
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
            raise Exception("Missing or empty PO receivals when amt received > 0")
        if self.purchaseOrderOrderedItemsId:
            self.receivals = (
                [POReceival(**recv_data) for recv_data in self.receivals]
                if self.receivals
                else []
            )


@dataclass
class QueueItem:
    qty: int = 0
    cost_per_unit: Decimal = Decimal(0)
    date: datetime = datetime(1970, 1, 1)

    def __lt__(self, other):
        return self.date < other.date

    def __repr__(self):
        return f"({self.qty}, {self.cost_per_unit}, {self.date})"


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
            **api_key,
        }

        session = requests.Session()
        credentials = boto3.session.Session().get_credentials()
        session.auth = AWS4Auth(
            credentials.access_key,
            credentials.secret_key,
            boto3.session.Session().region_name,
            "appsync",
            session_token=credentials.token,
        )

        self.session = session

    def make_request(self, q: Query, variables: dict):
        response = self.session.request(
            url=GRAPHQL_ENDPOINT,
            method="POST",
            headers=self.headers,
            json={"query": q.query, "variables": variables},
        )
        resp = response.json(parse_float=Decimal)  # IMPORTANT: parse floats as Decimal
        errors = resp.get("errors", [])
        if len(errors) > 0:
            logging.exception(
                f"Error executing query '{q.name}'\n{json.dumps(errors, indent=3)}"
            )
            raise GraphQLException
        return resp["data"][q.name]


class DynamoDBClient:
    """
    Make sure the client credentials are set at ~/.aws/config for the
    AWS_ACCESS_KEY_ID AND AWS_SECRET_ACCESS_KEY variables
    """

    class DBOperation(Enum):
        NONE = 0
        INSERT = 1
        UPDATE = 2

    def __init__(self, client=None):

        self.client = (
            boto3.client("dynamodb", region_name="us-west-2") if not client else client
        )

    @staticmethod
    def _to_attribute_val(x: dict):
        return DynamoDBClient._rec_to_attribute_val(x)["M"]

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
                if not attr_val:
                    continue
                res[k] = attr_val
            return {"M": res}
        elif type(x) == list:
            res = []
            for i in x:
                attr_val = DynamoDBClient._rec_to_attribute_val(i)
                if not attr_val:
                    continue
                res.append(attr_val)
            return {"L": res}
        elif type(x) == int or type(x) == Decimal:
            return {"N": str(x)}
        elif type(x) == str:
            return {"S": str(x)}
        elif type(x) == bool:
            return {"BOOL": x}
        raise Exception(
            f"New type '{type(x)}' with no conversion to DynamoDB AttributeValue"
        )

    @staticmethod
    def _to_update_partiql(table_name: str, pk_field_name: str, item: dict):
        table_operation = f'UPDATE "{table_name}"'
        pk_where_clause = f"WHERE {pk_field_name} = ?"
        set_statements, params = list(
            zip(
                *[
                    (f"SET {k} = ?", DynamoDBClient._attr_to_attribute_val(v))
                    for k, v in item.items()
                    if k != pk_field_name and v != None
                ]
            )
        )
        statement = "\n".join([table_operation, *set_statements, pk_where_clause])
        params = (*params, DynamoDBClient._attr_to_attribute_val(item[pk_field_name]))
        return statement, params

    @staticmethod
    def _batch_operation(
        batch_transformer: Callable[[List], List],
        batch_processor: Callable[[List], List],
        items: List[dict],
    ):
        def partition_arr(items: list, size=25):
            res = []
            i = 0
            while len(items[i : i + size]):
                res.append(items[i : i + size])
                i += size
            return res

        batches = [batch_transformer(partition) for partition in partition_arr(items)]
        max_attempts = 6
        for i in range(max_attempts):
            if i > 0:
                logging.info(f"Unproccessed items: retry attempt {i}/{max_attempts-1}")

            unprocessed_items = []
            for batch in batches:
                try:
                    retry_items = batch_processor(batch)
                    unprocessed_items.extend(retry_items)
                except Exception as e:
                    logging.exception(e)

            if not len(unprocessed_items):
                return
            batches = partition_arr(unprocessed_items)

        return unprocessed_items

    def put_item(self, table_name: str, item: dict):
        self.client.put_item(
            TableName=table_name, Item=DynamoDBClient._to_attribute_val(item)
        )

    def batch_write_item(self, table_name: str, items: List[dict]) -> list:

        to_put_req_item = lambda x: {
            "PutRequest": {"Item": DynamoDBClient._to_attribute_val(x)}
        }
        batch_transformer = lambda batch: {
            table_name: [to_put_req_item(x) for x in batch]
        }

        def batch_processor(request_item_batch: list):
            response = self.client.batch_write_item(RequestItems=request_item_batch)
            unprocessed_items = response["UnprocessedItems"]
            return unprocessed_items

        return DynamoDBClient._batch_operation(
            batch_transformer, batch_processor, items
        )

    def batch_execute_statement(
        self, table_name: str, pk_field_name: str, items: List[Tuple[DBOperation, dict]]
    ):

        def batch_transformer(batch: List[Tuple[DynamoDBClient.DBOperation, dict]]):
            to_statement = lambda statement, params: {
                "Statement": statement,
                "Parameters": params,
            }
            return [
                (
                    to_statement(
                        *DynamoDBClient._to_update_partiql(
                            table_name, pk_field_name, item
                        )
                    )
                    if op == DynamoDBClient.DBOperation.UPDATE
                    else item
                )
                for op, item in batch
            ]

        def batch_processor(param_statements: list):
            response = self.client.batch_execute_statement(Statements=param_statements)
            unprocessed_items = [
                param_statements[i]
                for i, r in enumerate(response["Responses"])
                if "Error" in r
            ]
            if unprocessed_items:
                logging.error(
                    f"Error executing batch statements for these items: {unprocessed_items}"
                )
            return unprocessed_items

        return DynamoDBClient._batch_operation(
            batch_transformer, batch_processor, items
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


@dataclass
class InventoryItemValue:
    itemId: str
    aggregateValue: Decimal = Decimal(0)
    numUnsold: int = 0
    inventoryQty: int = 0

    poQueueHead: str = None
    poQueueHeadQtyRemain: int = 0
    coQueueHead: str = None
    coQueueHeadQtyRemain: int = 0

    tshirtStyleNumber: str = ""
    tshirtColor: str = ""
    tshirtSize: str = ""

    def copy(self, **kwargs):
        return InventoryItemValue(
            itemId=self.itemId,
            aggregateValue=kwargs.get("aggregateValue", self.aggregateValue),
            numUnsold=kwargs.get("numUnsold", self.numUnsold),
            inventoryQty=kwargs.get("inventoryQty", self.inventoryQty),
            poQueueHead=kwargs.get("poQueueHead", self.poQueueHead),
            poQueueHeadQtyRemain=kwargs.get(
                "poQueueHeadQtyRemain", self.poQueueHeadQtyRemain
            ),
            coQueueHead=kwargs.get("coQueueHead", self.coQueueHead),
            coQueueHeadQtyRemain=kwargs.get(
                "coQueueHeadQtyRemain", self.coQueueHeadQtyRemain
            ),
            tshirtStyleNumber=kwargs.get("tshirtStyleNumber", self.tshirtStyleNumber),
            tshirtColor=kwargs.get("tshirtColor", self.tshirtColor),
            tshirtSize=kwargs.get("tshirtSize", self.tshirtSize),
        )


class InventoryValueCache:

    def __init__(
        self,
        graphql_client: GraphQLClient,
        dynamodb_client: DynamoDBClient,
        created_date: datetime,
        table_name: str,
    ):
        self._data = {}
        self._dynamodb_client = dynamodb_client
        self._graphql_client = graphql_client
        self._created_date = created_date
        self._table_name = table_name

    def __setitem__(self, item_id: str, value: InventoryItemValue):
        self._data[item_id] = value

    def __getitem__(self, item_id: str) -> InventoryItemValue:
        return self._data.get(
            item_id,
            InventoryItemValue(item_id),
        )

    def get_created_date(self) -> datetime:
        return self._created_date

    def read_db(self) -> "InventoryValueCache":
        resp = self._graphql_client.make_request(
            Queries.getInventoryValueCache,
            {"createdAt": MyDateTime.to_ISO8601(self._created_date, is_only_date=True)},
        )
        if not resp:
            return

        lastItemVals = resp["lastItemValues"]
        itemVals = map(lambda x: InventoryItemValue(**x), lastItemVals)
        self._data = {x.itemId: x for x in itemVals}
        return self

    def write_db(self):
        try:
            self._dynamodb_client.put_item(self._table_name, self._to_write_db_input())
        except Exception as e:
            logging.exception(
                f"Failed to write cache to db key createdAt = {self._created_date}",
                extra={"error": str(e)},
            )

    @staticmethod
    def batch_write_db(
        client: DynamoDBClient, caches: List["InventoryValueCache"], table_name: str
    ):
        if len(caches) == 0:
            return
        if len(caches) == 1:
            caches[0].write_db()
            return
        items = [c._to_write_db_input() for c in caches]
        unprocessed_list = client.batch_write_item(table_name, items)
        if unprocessed_list:
            logging.warning(
                f"Failed batch cache write. Unprocessed items: {unprocessed_list}"
            )

    def _to_write_db_input(self) -> dict:
        return {
            "createdAt": MyDateTime.to_ISO8601(self._created_date, is_only_date=True),
            "updatedAt": MyDateTime.to_ISO8601(MyDateTime.get_now_UTC()),
            "lastItemValues": list(map(lambda x: asdict(x), self._data.values())),
        }


class Inventory:
    def __init__(self, graphql_client: GraphQLClient):
        self.graphql_client = graphql_client
        self.items = {}
        self._fully_loaded = False

    def __getitem__(self, item_id: str) -> InventoryItem:
        if item_id not in self.items:
            self.items[item_id] = self._fetch_item(item_id)
        return self.items[item_id]

    def list(self) -> List[InventoryItem]:
        if not self._fully_loaded:
            self._full_load()
        return list(self.items.values())

    def _full_load(self):
        """
        Loads all items in the inventory.
        """
        if self._fully_loaded:
            return

        it = PaginationIterator(
            self.graphql_client,
            Queries.listTshirts,
            {"limit": Queries.QUERY_PAGE_LIMIT},
        )
        for obj in it:
            item = InventoryItem(**obj)
            self.items[item.id] = item

        self._fully_loaded = True

    def _fetch_item(self, item_id: str) -> InventoryItem:
        item = self.graphql_client.make_request(Queries.getTShirt, {"id": item_id})
        return InventoryItem(**item)


class DataStream:
    """
    Provides a stream of QueueItems for Purchase Orders or Customer Orders.
    """

    def __init__(self, data_source: Iterable[QueueItem]):
        self._data_source = data_source
        self._head = next(self._data_source, None)

    def read_until(self, end_excl: datetime) -> List[QueueItem]:
        res = []
        while self._head and self._head.date < end_excl:
            res.append(self._head)
            self._head = next(self._data_source, None)
        return res

    def is_empty(self) -> bool:
        return self._head == None


class DataStreamBuilder:
    TYPE_PO = "PO"
    TYPE_CO = "CO"

    def __init__(self, item_id: str, graphql_client: GraphQLClient):
        self.graphql_client = graphql_client
        self.item_id = item_id

        self._queue_head = None
        self._end_excl = None
        self._type = DataStreamBuilder.TYPE_PO

    def build(self) -> DataStream:
        if not self._queue_head or not self._end_excl:
            raise ValueError("Start and end dates must be set")
        raw_data_source = self._build_iterator()
        data_source = self._decorate(raw_data_source)
        return DataStream(data_source)

    def set_type_PO(self) -> "DataStreamBuilder":
        self._type = DataStreamBuilder.TYPE_PO
        return self

    def set_type_CO(self) -> "DataStreamBuilder":
        self._type = DataStreamBuilder.TYPE_CO
        return self

    def set_start_incl(self, start_incl: datetime) -> "DataStreamBuilder":
        self._queue_head = start_incl
        return self

    def set_end_excl(self, end_excl: datetime) -> "DataStreamBuilder":
        self._end_excl = end_excl
        return self

    def _decorate(self, raw_data_source: PaginationIterator) -> Iterable[QueueItem]:
        if self._type == DataStreamBuilder.TYPE_PO:
            return self._decorate_PO(raw_data_source)
        return self._decorate_CO(raw_data_source)

    def _decorate_PO(self, raw_data_source: PaginationIterator) -> Iterable[QueueItem]:
        """This works because each interval is sorted by start
        All values in interval are sorted, and next interval starts after,
        but they may overlap"""
        po_heap = []

        def decorate(it):
            queue_head, end = self._queue_head, self._end_excl
            for po in it:
                item = OrderItem(**po)
                for x in item.receivals:
                    t = MyDateTime.parse_UTC(x.timestamp, TZ_UTC_HOUR_OFFSET)
                    if t < queue_head or t >= end:
                        continue
                    receival = QueueItem(
                        qty=x.quantity, cost_per_unit=item.costPerUnit, date=t
                    )
                    heapq.heappush(po_heap, receival)
                if po_heap:
                    yield heapq.heappop(po_heap)
            while po_heap:
                yield heapq.heappop(po_heap)

        return decorate(raw_data_source)

    def _decorate_CO(self, raw_data_source: PaginationIterator) -> Iterable[QueueItem]:
        def decorate(it):
            for co in it:
                item = OrderItem(**co)
                yield QueueItem(
                    qty=item.quantity,
                    cost_per_unit=item.costPerUnit,
                    date=MyDateTime.parse_UTC(
                        item.earliestTransaction, TZ_UTC_HOUR_OFFSET
                    ),
                )

        return decorate(raw_data_source)

    def _build_iterator(self) -> PaginationIterator:
        is_PO = self._type == DataStreamBuilder.TYPE_PO
        qty_filter = {"amountReceived": {"gt": 0}} if is_PO else {"quantity": {"gt": 0}}
        return PaginationIterator(
            self.graphql_client,
            Queries.tshirtTransactionQueues,
            {
                "indexField": f"{self.item_id}-{self._type}",
                "sortDirection": Queries.SORT_DIRECTION_ASC,
                "limit": Queries.QUERY_PAGE_LIMIT,
                "earliestTransaction": {"lt": MyDateTime.to_ISO8601(self._end_excl)},
                "filter": {
                    "latestTransaction": {
                        "ge": MyDateTime.to_ISO8601(self._queue_head)
                    },
                    **qty_filter,
                },
            },
        )


class ItemQueue:

    def __init__(self, data_stream: DataStream):
        self._items: List[QueueItem] = []
        self._value = Decimal(0)
        self._total_qty = 0
        self._data_stream = data_stream

    def load_until(self, end_excl: datetime):
        """
        Loads more items into the unsold items queue. This increases the value and total qty.
        """
        items = self._data_stream.read_until(end_excl)
        for item in items:
            self._value += item.qty * item.cost_per_unit
            self._total_qty += item.qty
        self._items.extend(items)
        return self

    def adjust_head(self, qty: int):
        """
        Adjusts the head by decrementing the qty. Useful if the head is partially sold (read from the cache).
        If qty is not positive, raises a ValueError.
        """
        if qty < 0:
            raise ValueError("ItemQueue adjust_head qty must be positive")
        if qty == 0 or not self._items:
            return
        head = self._items[0]
        self.pop(head.qty - qty)

    def pop(self, evict_count: int) -> int:
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

    def read_current_value(self):
        return self._value

    def read_current_qty(self):
        return self._total_qty

    def read_current_items(self):
        return self._items


class ItemValueCalculator:
    """
    This is the main algorithm that calculates the value of an item over a period of time.
    """

    def __init__(
        self,
        date_range: DateRange,
        item: InventoryItem,
        prev_iiv: InventoryItemValue,
        graphql_client: GraphQLClient,
    ):
        self.graphql_client = graphql_client
        self.item = item
        self.prev_iiv = prev_iiv
        self.date_range = date_range

        start_incl, end_excl = date_range.get_bounds()
        start_po = (
            start_incl
            if not prev_iiv.poQueueHead
            else MyDateTime.parse_UTC(prev_iiv.poQueueHead, TZ_UTC_HOUR_OFFSET)
        )
        start_co = (
            start_incl
            if not prev_iiv.coQueueHead
            else MyDateTime.parse_UTC(prev_iiv.coQueueHead, TZ_UTC_HOUR_OFFSET)
        )

        builder = DataStreamBuilder(prev_iiv.itemId, self.graphql_client)

        self._po_data_stream = (
            builder.set_start_incl(start_po)
            .set_end_excl(end_excl)
            .set_type_PO()
            .build()
        )
        self._co_data_stream = builder.set_start_incl(start_co).set_type_CO().build()

        self._values = OrderedDict()

    def __getitem__(self, dt: datetime) -> InventoryItemValue:
        return self._values.get(dt, None)

    def items(self) -> List[Tuple[datetime, InventoryItemValue]]:
        return list(self._values.items())

    def calculate(self) -> "ItemValueCalculator":
        po_queue = ItemQueue(self._po_data_stream)
        co_queue = ItemQueue(self._co_data_stream)

        first_iteration = True
        for start, end in self.date_range:
            # start is the period (month or day) which value will be calculated
            po_queue.load_until(end)
            co_queue.load_until(end)

            if first_iteration:
                po_queue.adjust_head(self.prev_iiv.poQueueHeadQtyRemain)
                co_queue.adjust_head(self.prev_iiv.coQueueHeadQtyRemain)
                first_iteration = False

            iiv = InventoryItemValue(itemId=self.item.id)

            sold_this_period = co_queue.read_current_qty()
            current_in_stock = po_queue.read_current_qty()

            num_oversold = po_queue.pop(sold_this_period)
            co_queue.pop(current_in_stock)

            iiv.aggregateValue = po_queue.read_current_value()
            left_over_stock = po_queue.read_current_qty()
            iiv.numUnsold = left_over_stock if left_over_stock > 0 else -num_oversold

            # Set the new queue heads
            iiv.poQueueHead = MyDateTime.to_ISO8601(end)
            iiv.coQueueHead = iiv.poQueueHead
            po_head = po_queue.peek()
            co_head = co_queue.peek()

            if po_head:
                iiv.poQueueHead = MyDateTime.to_ISO8601(po_head.date)
                iiv.poQueueHeadQtyRemain = po_head.qty

            if co_head:
                iiv.coQueueHead = MyDateTime.to_ISO8601(co_head.date)
                iiv.coQueueHeadQtyRemain = co_head.qty

            iiv.inventoryQty = self.item.quantityOnHand
            iiv.tshirtColor = self.item.color
            iiv.tshirtSize = self.item.size
            iiv.tshirtStyleNumber = self.item.styleNumber

            self._values[start] = iiv

        return self


class Factory:
    def __init__(
        self,
        graphql_client: GraphQLClient,
        dyanmodb_client: DynamoDBClient,
        inventory_provider: Inventory,
    ):
        self.graphql_client = graphql_client
        self.dynamodb_client = dyanmodb_client
        self.inventory_provider = inventory_provider

    def new_item_val_calculator(
        self, date_range: DateRange, item: InventoryItem, prev_iiv: InventoryItemValue
    ):
        return ItemValueCalculator(date_range, item, prev_iiv, self.graphql_client)

    def new_inventory_value_cache(self, created_date: datetime):
        return InventoryValueCache(
            self.graphql_client,
            self.dynamodb_client,
            created_date,
            INV_VAL_CACHE_TABLE_NAME,
        )

    def new_inventory_value_calculator(
        self, date_range: DateRange, prev_cache: InventoryValueCache
    ):
        return InventoryValueCalculator(
            date_range, self, self.inventory_provider, prev_cache
        )


class InventoryValueCalculator:
    """
    This class is responsible for calculating the value of all items in the inventory over a period of time.
    """

    def __init__(
        self,
        date_range: DateRange,
        factory: Factory,
        prev_cache: InventoryValueCache,
    ):
        self.date_range = date_range
        self.factory = factory
        self.prev_cache = prev_cache
        self._values = OrderedDict()

    def __getitem__(self, dt: datetime) -> InventoryValueCache:
        return self._values.get(dt, None)

    def items(self) -> List[Tuple[datetime, InventoryValueCache]]:
        return list(self._values.items())

    def values(self) -> List[InventoryValueCache]:
        return list(self._values.values())

    def calculate(self) -> "InventoryValueCalculator":
        graphql_client = self.factory.graphql_client
        inventory = self.factory.inventory_provider

        # Prepare data for workers
        def get_item_val_calc(item: InventoryItem):
            return self.factory.new_item_val_calculator(
                self.date_range,
                item,
                self.prev_cache[item.id],
                graphql_client,
            )

        calculators: List[ItemValueCalculator] = list(
            map(get_item_val_calc, inventory.list())
        )

        # Kick off the calculations in parallel
        num_workers = os.cpu_count()
        for i in range(0, len(calculators), num_workers):
            batch = calculators[i : i + num_workers]
            threads = []
            for item_calculator in batch:
                thread = threading.Thread(target=item_calculator.calculate)
                thread.start()
                threads.append(thread)
            for thread in threads:
                thread.join()

        # Aggregate the calculations
        for calc_date, _ in self.date_range:
            new_cache = self.factory.new_inventory_value_cache(calc_date)
            for calc in calculators:
                iiv = calc[calc_date]
                new_cache[iiv.itemId] = iiv
            self._values[calc_date] = new_cache

        return self


class CacheProvider:
    CACHE_EXPIRATION_ID = "A"
    INITIAL_CACHE_STATE_INPUT = {
        "input": {"id": CACHE_EXPIRATION_ID, "earliestExpiredDate": ""}
    }

    def __init__(self, ref_date: datetime, factory: Factory):
        """
        ref_date: the date we want to get the previous cache for
            e.g if ref_date is Feb 18th, then prev_cache is Jan 1st.
        """
        self._ref_date = ref_date
        self._factory = factory
        self._graphql_client = factory.graphql_client
        self._prev_cache = None
        self._did_renew_caches = False

        expired_date = self._get_expired_date()
        if expired_date:
            self._renew(expired_date)

    def get_previous_cache(self) -> InventoryValueCache:
        prev_month_start = self._get_start_of_prev_month(self._ref_date)
        if self._did_renew_caches and self._prev_cache:
            if self._prev_cache.get_created_date() != prev_month_start:
                raise Exception(
                    "Previously renewed cache creation date doesn't match with previous month start"
                )
        else:
            self._prev_cache = self._factory.new_inventory_value_cache(
                prev_month_start
            ).read_db()
        return self._prev_cache

    def _renew(self, expired_date: datetime):
        """
        Renews the caches from the earliest expired date up to the beginning
        of the month of the reference date.

        e.g. if expired_date is 2020-01-01, and ref_date is 2020-02-18,
            we renew the caches from 2020-01-01 to 2020-02-01,
            and use start from the cache from created on 2019-12-01 (ending on 2019-12-31)
        """
        ref_date_month_start = MyDateTime.to_month_start(self._ref_date)
        expired_date_range = DateRange(expired_date, ref_date_month_start)
        logging.warning(f"Renewing caches in range {expired_date_range}")

        prev_month_start = self._get_start_of_prev_month(expired_date)
        earliest_good_cache = self._factory.new_inventory_value_cache(
            prev_month_start
        ).read_db()

        inventory_calculator = self._factory.new_inventory_value_calculator(
            expired_date_range, earliest_good_cache
        ).calculate()

        expired_caches = inventory_calculator.values()

        if not expired_caches:
            raise Exception(
                f"Renewing caches in {expired_date_range} yielded empty results"
            )

        self._prev_cache = expired_caches[-1]
        InventoryValueCache.batch_write_db(
            self._factory.dynamodb_client, expired_caches, INV_VAL_CACHE_TABLE_NAME
        )
        self._mark_caches_renewed()

    def _get_expired_date(self) -> Optional[datetime]:
        """
        When a cache is expired, we recalculate all caches after the
        earliest expired date up to the reference date.
        """
        earliest_exp = "earliestExpiredDate"
        resp = self._graphql_client.make_request(
            Queries.getCacheExpiration, {"id": CacheProvider.CACHE_EXPIRATION_ID}
        )

        if not resp or resp[earliest_exp] == "":
            return None

        try:
            earliest_expired_date = datetime.strptime(
                resp[earliest_exp], "%Y-%m-%d"
            ).replace(tzinfo=timezone(timedelta(hours=TZ_UTC_HOUR_OFFSET)))
        except ValueError:
            logging.exception(
                f"Cache expiration 'earliestExpiredDate' had malformed value {resp[earliest_exp]}"
            )
            raise

        return earliest_expired_date

    def _get_start_of_prev_month(self, d: datetime) -> datetime:
        # IMPORTANT: needs to be month start because if d is March 18th, then prev_cache has to be Feb 1st,
        # since the cache on March 1st has queue heads up till March 31st
        return MyDateTime.to_month_start(d) - relativedelta(months=1)

    def _mark_caches_renewed(self):
        self._graphql_client.make_request(
            Queries.updateCacheExpiration, CacheProvider.INITIAL_CACHE_STATE_INPUT
        )
        self._did_renew_caches = True

    def create_cache_expiration(self):
        self._graphql_client.make_request(
            Queries.createCacheExpiration, CacheProvider.INITIAL_CACHE_STATE_INPUT
        )

@dataclass
class Request:
    method: str
    path: str
    params: dict
    body: dict

class RequestHandler(ABC):
    def __init__(
        self,
        graphql_client: GraphQLClient = GraphQLClient(),
        dynamodb_client: DynamoDBClient = DynamoDBClient(),
    ):
        self.graphql_client = graphql_client
        self.dynamodb_client = dynamodb_client
        self.inventory = Inventory(self.graphql_client)
        self.factory = Factory(
            self.graphql_client, self.dynamodb_client, self.inventory
        )

    @abstractmethod
    def handle_request(self, request: Request) -> str:
        pass

    @abstractmethod
    def get_matcher() -> Tuple[str, str]:
        pass
            
    def _serialize_response(self, response):
        return json.dumps(response, default=lambda o: str(o) if isinstance(o, Decimal) else o)

class GetItemValuesHandler(RequestHandler):

    def handle_request(self, request: Request) -> str:
        print("Run success for start inclusive: {} and end exclusive: {}".format(s, e))
        pass

    def get_matcher() -> Tuple[str, str]:
        return "GET", "/inventory-values"
    
    # This could be optimized by making the cache expiration per item
    # and only renewing the caches for the items that are being requested
    def _get_item_values(self, item_id: str, date_range: DateRange) -> ItemValueCalculator:
        requested_start_date, _ = date_range.get_bounds()
        cache_provider = CacheProvider(requested_start_date, self.factory)

        item = self.inventory[item_id]
        prev_cache = cache_provider.get_previous_cache()
        prev_iiv = prev_cache[item_id]

        return ItemValueCalculator(
            date_range, item, prev_iiv, self.graphql_client
        ).calculate()

    def _format_response(self, response: ItemValueCalculator):
        resp = {"data": []}
        for date, iiv in response.items():
            resp["data"].append({
                "date": MyDateTime.to_ISO8601(date),
                "aggregateValue": iiv.aggregateValue,
                "numUnsold": iiv.numUnsold,
                "inventoryQty": iiv.inventoryQty,
                "tshirtStyleNumber": iiv.tshirtStyleNumber,
                "tshirtColor": iiv.tshirtColor,
                "tshirtSize": iiv.tshirtSize,
            })

        return resp

    def _parse_request(self, event: dict):
        item_id = event.get("item_id")
        if not item_id:
            raise ValueError("Missing required field 'item_id'")

        date_range = DateRange.from_event(event)
        return item_id, date_range

class CreateMonthlyReportHandler(RequestHandler):

    def handle_request(self, event: dict):
        date_range = self._parse_request(event)
        cache_provider = CacheProvider(date_range.start, self.factory)
        prev_cache = cache_provider.get_previous_cache()

        print("Run success for start inclusive: {} and end exclusive: {}".format(s, e))

    def _parse_request(self, event: dict) -> DateRange:
        end = MyDateTime.curr_month_start_in_tz(TZ_UTC_HOUR_OFFSET)
        start = end - relativedelta(months=1)
        return DateRange(start, end, StepSize.MONTH)
    


def handler(event, context):
    logging.info(f"received event\n{event}")
    
    method = event.get("method")
    path = event.get("path")
    
    command_type = event.get("command_type")
    if command_type == "create_monthly_inventory_val_report":
        create_monthly_inventory_val_report(event)
        return {"statusCode": 200}
    elif command_type == "get_inventory_values":
        return get_inventory_values(event)
    logging.error(f"Unknown command type '{command_type}'")
    raise ValueError(f"Unknown command type '{command_type}'")

class Queries:

    QUERY_PAGE_LIMIT = 100
    SORT_DIRECTION_ASC = "ASC"

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

    getTShirt = Query(
        name="getTShirt",
        query="""
query GetTShirt($id: ID!) {
    getTShirt(id: $id) {
      id
      styleNumber
      brand
      color
      size
      quantityOnHand
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

    getInventoryValueCache = Query(
        name="getInventoryValueCache",
        query="""
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
""",
    )

    createCacheExpiration = Query(
        name="createCacheExpiration",
        query="""
mutation CreateCacheExpiration(
    $input: CreateCacheExpirationInput!
    $condition: ModelCacheExpirationConditionInput
) {
    createCacheExpiration(input: $input, condition: $condition) {
        earliestExpiredDate
    }
}
""",
    )

    getCacheExpiration = Query(
        name="getCacheExpiration",
        query="""
    query GetCacheExpiration($id: String!) {
        getCacheExpiration(id: $id) {
            id
            earliestExpiredDate
            updatedAt
        }
    }
""",
    )

    updateCacheExpiration = Query(
        name="updateCacheExpiration",
        query="""
mutation UpdateCacheExpiration(
    $input: UpdateCacheExpirationInput!
    $condition: ModelCacheExpirationConditionInput
) {
    updateCacheExpiration(input: $input, condition: $condition) {
        earliestExpiredDate
    }
}
""",
    )
