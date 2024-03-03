from enum import Enum
from typing import Iterable
import uuid
import random
import json
import sys
import os
from datetime import datetime
from dataclasses import asdict

sys.path.insert(0, os.path.abspath(".."))
from src.index import InventoryItem, OrderItem, Main
sys.path.pop(0)


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


def gen_order_items_responses(items: list[InventoryItem], n: int = 10) -> dict:
    item_responses = {}

    def rand_order_type():
        if random.randint(0, 1):
            return "PurchaseOrder", None
        return None, "CustomerOrder"

    for item in items:
        res = [0 for _ in range(n)]
        for i in range(n):
            t = datetime.fromtimestamp(i).isoformat()

            po_id, co_id = rand_order_type()
            # Simulate customer returns
            quantity = random.randint(-5,
                                      20) if co_id else random.randint(0, 15)

            res[i] = OrderItem(
                id=str(uuid.uuid4()),
                quantity=quantity,
                amountReceived=random.randint(0, 10),
                costPerUnit=round(random.uniform(0, 100), 2),
                createdAt=t,
                updatedAt=t,
                tShirtOrderTshirtId=item.id,
                purchaseOrderOrderedItemsId=po_id,
                customerOrderOrderedItemsId=co_id,
            )
        item_responses[item.id] = res
    return item_responses


class PaginationSimulator:

    def __init__(self, items: Iterable, page_count: int, query_name: str):
        dict_items = list(map(lambda x: asdict(x), items))
        self.pages = PaginationSimulator._partition_list(
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
        return {"data": {self.query_name: {"items": page, "nextToken": next_token}}}

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
order_items = gen_order_items_responses(inv_items, num_orders_per_item)


def get_rand_mock_inventory_item_api(): return PaginationSimulator(
    inv_items, num_inv_pages, Main.listTshirts.name
)


def get_rand_mock_order_item_api(item_id): return PaginationSimulator(
    order_items[item_id], num_orders_pages, Main.tshirtOrderByUpdatedAt.name
)


def select_random_order_item(): return random.choice(inv_items)

class OrderType(Enum):
    CustomerOrder = 0
    PurchaseOrder = 1
    
class IncrementalOrderItemBuilder:
    def __init__(self):
        self.i = 0
    def get_order_item(self, order_type: OrderType, qty: int, cost_per_unit: float = 0):
        def get_time(x): return datetime.fromtimestamp(x).isoformat()
        is_customer_order = order_type == OrderType.CustomerOrder
        
        order_item = OrderItem(
            id=f'id-{self.i}',
            quantity=qty if is_customer_order else 0,
            amountReceived=0 if is_customer_order else qty,
            costPerUnit=cost_per_unit,
            createdAt=get_time(random.randint(0, self.i)),
            updatedAt=get_time(self.i),
            tShirtOrderTshirtId='some tshirt id',
            purchaseOrderOrderedItemsId=None if is_customer_order else 'some po id',
            customerOrderOrderedItemsId='some co id' if is_customer_order else None,
        )
        self.i += 1
        return order_item

def get_predictable_mock_order_item_api(partial_order_items: Iterable[dict]):
    predicable_builder = IncrementalOrderItemBuilder()
    return PaginationSimulator(
        map(lambda x: predicable_builder.get_order_item(**x), partial_order_items),
        5,
        Main.tshirtOrderByUpdatedAt.name
    )