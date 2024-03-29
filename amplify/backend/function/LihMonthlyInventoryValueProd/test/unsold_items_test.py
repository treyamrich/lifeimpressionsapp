import unittest
from unittest.mock import MagicMock
import mock_apis
from mock_apis import OrderType
import sys
import os

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import Main, InventoryItemValue, MyDateTime, OrderItem
sys.path.pop(0)


class TestGetUnsoldItems(unittest.TestCase):
    
    def setUp(self):
        self.dummy_dt = MyDateTime.get_now_UTC()
        self.mock_graphql_client = MagicMock()
        self.main = Main(self.mock_graphql_client, MagicMock())


    def _call_get_unsold(self, data: list) -> list[OrderItem]:
        self.mock_graphql_client \
            .make_request.side_effect = mock_apis.get_predictable_mock_order_item_api(data)
        unsold = self.main \
            ._get_unsold_items(InventoryItemValue('some_id'), self.dummy_dt, self.dummy_dt)
        return unsold
    
    def _transform_data(self, data: list):
        return map(lambda x: {'order_type': x[0], 'qty': x[1]}, data)
    
    def test_general_case(self):
        data = self._transform_data([
                (OrderType.CustomerOrder, 10),  # i = 0; Expect: -10
                (OrderType.CustomerOrder, -3),  # i = 1; Expect: -7
                (OrderType.PurchaseOrder, 5),  # i = 2; Expect: -2
                (OrderType.PurchaseOrder, 5),  # i = 3; Expect: 3
                (OrderType.PurchaseOrder, 5),  # i = 4; Expect: 8
                (OrderType.CustomerOrder, 1),  # i = 5; Expect: 7
                (OrderType.PurchaseOrder, 5),  # i = 6; Expect: 12

                (OrderType.CustomerOrder, 5),  # i = 7; Expect: 7

                (OrderType.CustomerOrder, 3),  # i = 8; Expect: 4
                (OrderType.CustomerOrder, 2),  # i = 9; Expect: 2
                (OrderType.PurchaseOrder, 1),  # i = 10; Expect: 3
            ])
        
        unsold = self._call_get_unsold(data)
        n = sum(map(lambda x: x.get_qty(), unsold))
        self.assertEqual(n, 3)
        
        for item in unsold:
            self.assertTrue(item.is_purchase_order())

    def test_empty_case(self):
        unsold = self._call_get_unsold([])
        self.assertEqual(len(unsold), 0)

    def test_only_reductions(self):
        data = self._transform_data([
                (OrderType.CustomerOrder, 10),
                (OrderType.CustomerOrder, -3),
                (OrderType.PurchaseOrder, -5),
                (OrderType.CustomerOrder, 5),
                (OrderType.CustomerOrder, 5),
            ])
        unsold = self._call_get_unsold(data)
        n = sum(map(lambda x: x.get_qty(), unsold))
        self.assertEqual(n, -22)

    def test_zero_quantity(self):
        data = self._transform_data([
                (OrderType.CustomerOrder, 0),
                (OrderType.CustomerOrder, -3),
                (OrderType.PurchaseOrder, -5),
                (OrderType.CustomerOrder, 5),
                (OrderType.PurchaseOrder, 100),
                (OrderType.CustomerOrder, 0),
                (OrderType.PurchaseOrder, 0),
                (OrderType.CustomerOrder, 100),
            ])
        unsold = self._call_get_unsold(data)
        n = sum(map(lambda x: x.get_qty(), unsold))
        self.assertEqual(n, -7)

    def test_any_adjustment(self):
        data = self._transform_data([
            (OrderType.CustomerOrder, 3),  # i = 0; Sold 3; Expect: -3
            (OrderType.CustomerOrder, -3),  # i = 1; Returned 3; Expect: 0
            (OrderType.PurchaseOrder, 5),  # i = 2; Bought 5; Expect: 5
            (OrderType.PurchaseOrder, -1),  # i = 3; Damaged items 1; Expect 4
            (OrderType.PurchaseOrder, 2),  # i = 4; Bought 2; Expect: 6
            (OrderType.CustomerOrder, 3),  # i = 5; Sold 3; Expect: 3
        ])
        
        unsold = self._call_get_unsold(data)
        n = sum(map(lambda x: x.get_qty(), unsold))
        self.assertEqual(n, 3)
        
        for item in unsold:
            self.assertTrue(item.is_purchase_order())

if __name__ == '__main__':
    unittest.main()
