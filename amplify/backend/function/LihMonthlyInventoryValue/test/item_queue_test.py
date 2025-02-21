import unittest
from mock_apis import build_date
import sys
import os

sys.path.insert(0, os.path.abspath(".."))
from src.index import BucketIterator, ItemQueue, QueueItem, MyDateTime, BucketUnit

sys.path.pop(0)


class TestItemQueue(unittest.TestCase):
    """
    Test cases to trigger all code paths of the queue:
        Evict 10 items out of 10
        [3, 2, 5]
        3 - 10 = -7; 3 evicted; 7 more to evict; [2, 5]
        2 - 7 = -5; 2 evicted; 5 more to evict; [5]
        5 - 5 = 0; 5 evicted; 0 more to evict; []
        return 0

        Evict 10 items out of 15
        [15]
        15 - 10 = 5; 10 evicted; 0 more to evict; [5]
        return 0

        Evict 10 items out of 5
        [3, 2]
        3 - 10 = -7; 7 more to evict; [2]
        2 - 7 = -5; 5 more to evict; []
        return 5
    """

    def setUp(self):
        self.date = build_date(2020, 1, 1)

    def test_evict_10_of_10(self):
        qty_and_costs = [(3, 10), (2, 3), (5, 1.1)]
        item_queue = ItemQueue().load_items(self.build_queue_items(qty_and_costs))
        self.assertEqual(item_queue.read_current_value(), 10 * 3 + 2 * 3 + 5 * 1.1)
        self.assertEqual(item_queue.read_current_qty(), 3 + 2 + 5)

        not_evicted = item_queue.evict_items(10)
        self.assertEqual(not_evicted, 0)
        self.assertEqual(item_queue.read_current_items(), [])
        self.assertEqual(item_queue.read_current_qty(), 0)
        self.assertEqual(item_queue.read_current_value(), 0)

    def test_evict_10_of_15(self):
        qty_and_costs = [(15, 3.5)]
        item_queue = ItemQueue().load_items(self.build_queue_items(qty_and_costs))
        self.assertEqual(item_queue.evict_items(10), 0)
        queue_item = item_queue.read_current_items()[0]
        self.assertEqual(queue_item.qty, 5)
        self.assertEqual(item_queue.read_current_value(), 3.5 * 5)

    def test_evict_10_of_5(self):
        qty_and_costs = [(3, 1), (2, 1)]
        item_queue = ItemQueue().load_items(self.build_queue_items(qty_and_costs))
        self.assertEqual(item_queue.evict_items(10), 5)
        self.assertEqual(item_queue.read_current_items(), [])
        self.assertEqual(item_queue.read_current_qty(), 0)
        self.assertEqual(item_queue.read_current_value(), 0)

    def test_consecutive_loads(self):
        expected_date = build_date(2020, 1, 2)
        qty_and_costs = [
            (3, 2),
            (2, 3, expected_date),
        ]
        item_queue = ItemQueue().load_items(self.build_queue_items(qty_and_costs))
        self.assertEqual(item_queue.read_current_qty(), 5)
        self.assertEqual(item_queue.read_current_value(), 3 * 2 + 2 * 3)

        not_evicted = item_queue.evict_items(4)
        self.assertEqual(not_evicted, 0)

        qty_and_costs = [(5, 10)]
        item_queue.load_items(self.build_queue_items(qty_and_costs))
        self.assertEqual(item_queue.read_current_qty(), 1 + 5)
        self.assertEqual(item_queue.read_current_value(), 5 * 10 + 1 * 3)
        items = item_queue.read_current_items()
        self.assertEqual(items[0].iso_dt, MyDateTime.to_ISO8601(expected_date))
        self.assertEqual(len(item_queue.read_current_items()), 2) # 2 distinct transactions

        not_evicted = item_queue.evict_items(5)
        self.assertEqual(not_evicted, 0)
        self.assertEqual(item_queue.read_current_qty(), 1)
        self.assertEqual(item_queue.read_current_value(), 10)
        queue_item = item_queue.peek()
        self.assertEqual(queue_item.qty, 1)

    def build_queue_items(self, input):
        res = []
        for x in input:
            if len(x) == 2:
                res.append(QueueItem(x[0], x[1], MyDateTime.to_ISO8601(self.date)))
            else:
                res.append(QueueItem(x[0], x[1], MyDateTime.to_ISO8601(x[2])))

        return res
