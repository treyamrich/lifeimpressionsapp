from enum import Enum
from typing import Iterable, List
import uuid
import random
import sys
import os
from datetime import datetime
from dataclasses import asdict

sys.path.insert(0, os.path.abspath(".."))
from src.index import InventoryItem, OrderItem, Main, QueueItem
sys.path.pop(0)

class OrderType(Enum):
    CustomerOrder = 0
    PurchaseOrder = 1

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

unix_to_iso = lambda x: datetime.fromtimestamp(x).isoformat()

def gen_po_receivals(min_t: int, max_t: int):
    times = sorted([random.randint(min_t, max_t) for _ in range(5)])
    times = map(unix_to_iso, times)
    return [{'quantity': random.randint(1, 10), 'timestamp': t} for t in times]

def gen_order_items_responses(order_type: OrderType, n: int = 10) -> Iterable[OrderItem]:
    is_PO = order_type == OrderType.PurchaseOrder
    res: List[OrderItem] = []
    for i in range(n):
        t = unix_to_iso(i)
        receivals = None

        if is_PO:
            earliestTransaction = i + random.randint(0, 20)
            latestTransaction = earliestTransaction + random.randint(0, 20)
            receivals = gen_po_receivals(earliestTransaction, latestTransaction)
            earliestTransaction = receivals[0]['timestamp']
            latestTransaction = receivals[-1]['timestamp']
        else:
            earliestTransaction, latestTransaction = t, t

        id_me = lambda: str(uuid.uuid4())
        
        res.append(
            OrderItem(
                id=id_me(),
                quantity=0,
                amountReceived=sum(map(lambda x: x['quantity'], receivals)) if is_PO else 0,
                costPerUnit=round(random.uniform(0, 100), 2),
                createdAt=t,
                updatedAt=t,
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

def get_mock_CO_resp(n = 10):
    mp = MockPagination(
        gen_order_items_responses(OrderType.CustomerOrder, n), 1, Main.tshirtTransactionQueues.name
    )
    return next(mp)

def get_mock_PO_resp(n = 10):
    mp = MockPagination(
        gen_order_items_responses(OrderType.PurchaseOrder, n), 1, Main.tshirtTransactionQueues.name
    )
    return next(mp)


def select_random_order_item(): return random.choice(inv_items)

    
class IncrementalOrderItemBuilder:
    def __init__(self):
        self.i = 0
    def get_order_item(self, order_type: OrderType, qty: int, cost_per_unit: float = 0):
        def get_time(x): return datetime.fromtimestamp(x).isoformat()
        is_customer_order = order_type == OrderType.CustomerOrder
        
        receivals = [x for x in gen_po_receivals()]
        n = len(receivals)
        order_item = OrderItem(
            id=f'id-{self.i}',
            quantity=qty,
            amountReceived=0 if is_customer_order else qty,
            costPerUnit=cost_per_unit,
            createdAt=get_time(random.randint(0, self.i)),
            updatedAt=get_time(self.i),
            tShirtOrderTshirtId='some tshirt id',
            purchaseOrderOrderedItemsId=None if is_customer_order else 'some po id',
            customerOrderOrderedItemsId='some co id' if is_customer_order else None,
            receivals=receivals,
            earliestTransaction=receivals[0]['timestamp'],
            latestTransaction=receivals[n-1]['timestamp']
        )
        self.i += 1
        return order_item

def get_predictable_mock_order_item_api(partial_order_items: Iterable[dict], num_pages=2):
    predicable_builder = IncrementalOrderItemBuilder()
    return MockPagination(
        map(lambda x: predicable_builder.get_order_item(**x), partial_order_items),
        num_pages,
        Main.tshirtOrderByUpdatedAt.name
    )

def mock_get_order_item_iterators(partial_queue_items: Iterable[dict]):
    partial_queue_items = [x for x in partial_queue_items]
                           
    def get_queue_item(qty: int, cost_per_unit: float = 0, timestamp='', **kwargs):
        return QueueItem(qty = qty, cost_per_unit = cost_per_unit, iso_dt = timestamp)
    
    def get_mock_it(t: OrderType):
        filtered = filter(lambda x: x['order_type'] == t, partial_queue_items)
        return map(lambda x: get_queue_item(**x), filtered) if partial_queue_items else iter([])

    return get_mock_it(OrderType.CustomerOrder), get_mock_it(OrderType.PurchaseOrder)