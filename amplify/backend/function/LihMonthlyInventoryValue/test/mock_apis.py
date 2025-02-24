from decimal import Decimal
from enum import Enum
from typing import Iterable, List, Tuple
import uuid
import random
import sys
import os
from datetime import datetime, timedelta, timezone
from dataclasses import asdict

sys.path.insert(0, os.path.abspath(".."))
from src.index import TZ_UTC_HOUR_OFFSET, InventoryItem, OrderItem, Main, POReceival, QueueItem, MyDateTime
sys.path.pop(0)

class OrderType(Enum):
    CustomerOrder = 0
    PurchaseOrder = 1

# Wrapper to print OrderItem nicely from MockPagination dicts
class PrintableOrderItem(OrderItem):

    def print_minimum(self):
        if self.purchaseOrderOrderedItemsId:
            lines = []
            for r in self.receivals:
                total_value = r.quantity * self.costPerUnit
                date = MyDateTime.parse_UTC(r.timestamp)
                date_s = date.strftime("%Y/%m/%d hr-%H")
                line = f"{date_s} -> bought {r.quantity} x ${self.costPerUnit}/unit = ${total_value}"
                lines.append(line)
            return "\n\t".join(lines)
        else:
            date = MyDateTime.parse_UTC(self.earliestTransaction)
            date_s = date.strftime("%Y/%m/%d hr-%H")
            return f"{date_s} -> sold {self.quantity}"
    
def gen_inventory_items_response(n: int = 100):
    return [
        InventoryItem(
            id=str(uuid.uuid4()),
            quantityOnHand=random.randint(0, 100),
            styleNumber="x",
            color="x",
            size="x",
        )
        for _ in range(n)
    ]

unix_to_iso = lambda x: datetime.fromtimestamp(x).isoformat() + 'Z'

def build_order_item(
    id: str = str(uuid.uuid4()),
    quantity: int = 0,
    amountReceived: int = 0,
    costPerUnit: Decimal = Decimal(0),
    createdAt: int = int(datetime.now().timestamp()),
    updatedAt: int = int(datetime.now().timestamp()),
    tShirtOrderTshirtId: str = str(uuid.uuid4()),
    purchaseOrderOrderedItemsId: str = None,
    customerOrderOrderedItemsId: str = None,
    receivals: list = None,
    earliestTransaction: str = unix_to_iso(int(datetime.now().timestamp())),
    latestTransaction: str = unix_to_iso(int(datetime.now().timestamp()))
) -> OrderItem:
    return OrderItem(
        id=id,
        quantity=quantity,
        amountReceived=amountReceived,
        costPerUnit=costPerUnit,
        createdAt=createdAt,
        updatedAt=updatedAt,
        tShirtOrderTshirtId=tShirtOrderTshirtId,
        purchaseOrderOrderedItemsId=purchaseOrderOrderedItemsId,
        customerOrderOrderedItemsId=customerOrderOrderedItemsId,
        receivals=receivals,
        earliestTransaction=earliestTransaction,
        latestTransaction=latestTransaction
    )

def date_sampler(start_incl: datetime, end_excl: datetime, samples: int):
    start_unix = start_incl.timestamp()
    end_unix = end_excl.timestamp() - 1
    vals = sorted([random.randint(start_unix, end_unix) for _ in range(samples)])
    return iter(vals)

def gen_po_receivals(min_t: int, max_t: int):
    sample_it = date_sampler(datetime.fromtimestamp(min_t), datetime.fromtimestamp(max_t), 5)
    times = map(unix_to_iso, sample_it)
    return [{'quantity': random.randint(1, 10), 'timestamp': t} for t in times]

def gen_order_items_responses(order_type: OrderType, start: datetime, end: datetime, samples = 10) -> Iterable[OrderItem]:
    start = MyDateTime.to_tz(start, 0)
    end = MyDateTime.to_tz(end, 0)
    is_PO = order_type == OrderType.PurchaseOrder
    end_unix = end.timestamp() - 1
    res: List[OrderItem] = []

    for unix_t in date_sampler(start, end, samples):
        receivals = None
        if is_PO:
            earliestTransaction = min(unix_t + random.randint(0, 20), end_unix)
            latestTransaction = min(earliestTransaction + random.randint(0, 20), end_unix)
            receivals = gen_po_receivals(earliestTransaction, latestTransaction)
            earliestTransaction = receivals[0]['timestamp']
            latestTransaction = receivals[-1]['timestamp']
        else:
            t = unix_to_iso(unix_t)
            earliestTransaction, latestTransaction = t, t

        id_me = lambda: str(uuid.uuid4())
        
        res.append(
            OrderItem(
                id=id_me(),
                quantity=0,
                amountReceived=sum(map(lambda x: x['quantity'], receivals)) if is_PO else 0,
                costPerUnit=Decimal(round(random.uniform(0, 100), 2)),
                createdAt=unix_t,
                updatedAt=unix_t,
                tShirtOrderTshirtId=id_me(),
                purchaseOrderOrderedItemsId=id_me() if is_PO else None,
                customerOrderOrderedItemsId=id_me() if not is_PO else None,
                receivals=receivals,
                earliestTransaction=earliestTransaction,
                latestTransaction=latestTransaction
            )
        )
    return sorted(res, key=lambda x: x.earliestTransaction)


class MockPagination:

    def __init__(self, items: Iterable, page_count: int, query_name: str):
        dict_items = list(map(lambda x: asdict(x), items))
        self.pages = MockPagination._partition_list(
            page_count, dict_items)
        self.i = 0
        self.query_name = query_name

    def __iter__(self):
        return self

    def __next__(self):
        if self.i == len(self.pages):
            raise StopIteration
        page = self.pages[self.i]
        next_token = None if self.i == len(
            self.pages) - 1 else f"token_{self.i}"
        self.i += 1
        # data and query name omitted since it's extracted in GraphQLClient.make_request()
        return {"items": page, "nextToken": next_token}

    def _partition_list(n: int, arr: list):
        if not arr: return [[]]
        n = 1 if not n or n > len(arr) else n
        step_size = len(arr) // n
        return [arr[i: i + step_size] for i in range(0, len(arr), step_size)]


num_inv_items = 100
num_inv_pages = 4

num_orders_per_item = 30
num_orders_pages = 3

inv_items = gen_inventory_items_response(num_inv_items)


def get_rand_mock_inventory_item_api(items = inv_items, num_pages = num_inv_pages): return MockPagination(
    items, num_pages, Main.listTshirts.name
)

def get_rand_mock_CO_resp(start: datetime, end: datetime, samples = 10):
    mp = MockPagination(
        gen_order_items_responses(OrderType.CustomerOrder, start, end, samples), 1, Main.tshirtTransactionQueues.name
    )
    return next(mp)

def get_rand_mock_PO_resp(start: datetime, end: datetime, samples = 10):
    mp = MockPagination(
        gen_order_items_responses(OrderType.PurchaseOrder, start, end, samples), 1, Main.tshirtTransactionQueues.name
    )
    return next(mp)

def build_date(year, month, day, hour=0, is_utc=False):
    tz = timezone.utc if is_utc else timezone(timedelta(hours=TZ_UTC_HOUR_OFFSET))
    return datetime(year, month, day, hour, tzinfo=tz)

def build_iso_date(year, month, day, hour=0, is_utc=False):
    return MyDateTime.to_ISO8601(build_date(year, month, day, hour, is_utc))
    
class OrderItemMockResponseBuilder:
    """
        Helper class to define a series of transactions on specific dates.
        The transactions are then turned into mock API responses from GraphQL.
    """
    def __init__(self):
        self.data = {}

    def __setitem__(self, key: Tuple[int, int, int], values: List[Tuple[OrderType, int, float]]) -> 'OrderItemMockResponseBuilder':
        year, month, day = key
        order_items = []
        hr_count = 0
        for v in values:
            # Build date in local tz, but we convert to UTC in the order item to simulate server storage
            date = build_date(year, month, day, hour=hr_count)
            order_item = self._build_order_item(v, date)
            order_items.append(order_item)
            hr_count = min(hr_count + 1, 23)

        self.data[key] = order_items
        return self
    
    def build_stream_single(self) -> MockPagination:
        stream = self._build()
        api_responses = MockPagination(stream, 1, Main.tshirtTransactionQueues.name)
        return iter(api_responses)
    
    def build_stream_split(self) -> Tuple[MockPagination, MockPagination]:
        stream = self._build()
        co_order_items = filter(lambda x: x.customerOrderOrderedItemsId != None, stream)
        po_order_items = filter(lambda x: x.purchaseOrderOrderedItemsId != None, stream)
        co_resp = MockPagination(co_order_items, 1, Main.tshirtTransactionQueues.name)
        po_resp = MockPagination(po_order_items, 1, Main.tshirtTransactionQueues.name)
        return iter(co_resp), iter(po_resp)
    
    def print_stream_single(self):
        print("All Orders:")
        api_responses = self.build_stream_single()
        self._print_stream(api_responses)

    def print_stream_split(self):
        co_resp, po_resp = self.build_stream_split()
        print("Customer Orders:")
        self._print_stream(co_resp)
        print("\nPurchase Orders:")
        self._print_stream(po_resp)

    def _print_stream(self, api_responses: MockPagination):
        for resp in api_responses:
            items = resp['items']
            for item in items:
                printable = PrintableOrderItem(**item)
                print(printable.print_minimum())

    def _build(self):
        res = []
        for key in sorted(self.data.keys()):
            res.extend(self.data[key])
        return res
    
    def _build_order_item(self, value: Tuple[OrderType, int, float], date: datetime) -> OrderItem:
        order_type = value[0]
        qty = value[1]
        iso_date = MyDateTime.to_ISO8601(date)
        order_item = build_order_item(
            quantity=qty,
            earliestTransaction=iso_date,
        )
        if order_type == OrderType.PurchaseOrder:
            order_item.receivals = [{'quantity': qty, 'timestamp': iso_date}]
            order_item.costPerUnit = Decimal(str(value[2]))
            order_item.purchaseOrderOrderedItemsId = 'some_id'
        else:
            order_item.customerOrderOrderedItemsId = 'some_id'
        return order_item

    def _keys_sorted(self, d):
        return [k for k in sorted(d.keys())]