from typing import List, Tuple
import unittest
from unittest.mock import MagicMock
import mock_apis
from mock_apis import OrderType
import sys
import os

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import Main, InventoryItemValue, MyDateTime, QueueItem
sys.path.pop(0)


class TestGetUnsoldItems(unittest.TestCase):
    
    def setUp(self):
        self.dummy_dt = MyDateTime.get_now_UTC()
        self.mock_graphql_client = MagicMock()
        self.main = Main(self.mock_graphql_client, MagicMock())


    def _call_get_unsold(self, data: list) -> Tuple[List[QueueItem], List[QueueItem]]:
        mock = MagicMock()
        mock.return_value = mock_apis.mock_get_order_item_iterators(data)
        self.main._get_order_items_iterators = mock
        return self.main \
            ._get_unsold_items(InventoryItemValue('some_id'), self.dummy_dt, self.dummy_dt)
    
    def _transform_data(self, data: list):
        return map(lambda x: {'order_type': x[0], 'qty': x[1]}, data)
    
    def test_general_case(self):
        data = self._transform_data([
                (OrderType.CustomerOrder, 10),  # i = 0; Expect: -10
                (OrderType.CustomerOrder, 3),  # i = 1; Expect: -13
                (OrderType.PurchaseOrder, 5),  # i = 2; Expect: -8
                (OrderType.PurchaseOrder, 5),  # i = 3; Expect: -3
                (OrderType.PurchaseOrder, 5),  # i = 4; Expect: 2
                (OrderType.CustomerOrder, 1),  # i = 5; Expect: 1
                (OrderType.PurchaseOrder, 5),  # i = 6; Expect: 6

                (OrderType.CustomerOrder, 5),  # i = 7; Expect: 1

                (OrderType.CustomerOrder, 3),  # i = 8; Expect: -2
                (OrderType.CustomerOrder, 2),  # i = 9; Expect: -4
                (OrderType.PurchaseOrder, 10),  # i = 10; Expect: 6
            ])
        
        unsold, unproc = self._call_get_unsold(data)
        n = sum(map(lambda x: x.qty, unsold))
        self.assertEqual(n, 6)
        self.assertEqual(len(unproc), 0)

    def test_empty_case(self):
        unsold, unproc = self._call_get_unsold([])
        self.assertEqual(len(unsold) + len(unproc), 0)

    def test_only_reductions(self):
        data = self._transform_data([
                (OrderType.CustomerOrder, 10),
                (OrderType.CustomerOrder, 3),
                (OrderType.PurchaseOrder, 5),
                (OrderType.CustomerOrder, 5),
                (OrderType.CustomerOrder, 5),
            ])
        unsold, unproc = self._call_get_unsold(data)
        n = sum(map(lambda x: x.qty, unproc))
        self.assertEqual(len(unsold), 0)
        self.assertEqual(n, 18)
        

    def test_any_adjustment(self):
        data = self._transform_data([
            (OrderType.CustomerOrder, 3),  # i = 0; Sold 3; Expect: -3
            (OrderType.CustomerOrder, 3),  # i = 1; Sold 6; Expect: -6
            (OrderType.PurchaseOrder, 5),  # i = 2; Bought 5; Expect: -1
            (OrderType.PurchaseOrder, 1),  # i = 3; Bought 1; Expect 0
            (OrderType.PurchaseOrder, 2),  # i = 4; Bought 2; Expect: 2
            (OrderType.CustomerOrder, 1),  # i = 5; Sold 1; Expect: 1
        ])
        
        unsold, unproc = self._call_get_unsold(data)
        n = sum(map(lambda x: x.qty, unsold))
        self.assertEqual(n, 1)
        self.assertEqual(len(unproc), 0)

if __name__ == '__main__':
    unittest.main()
