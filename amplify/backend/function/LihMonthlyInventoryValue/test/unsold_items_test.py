import unittest
from unittest.mock import MagicMock
import mock_apis
from mock_apis import OrderType
import sys
import os

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import Main, InventoryItemValue, OrderItem
sys.path.pop(0)


class TestMain(unittest.TestCase):
    
    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.main = Main(self.mock_graphql_client)

    # def test_get_unsold_items_value(self):
    #     order_item = mock_apis.select_random_order_item()
    #     self.mock_graphql_client._make_request.side_effect = mock_apis.get_rand_mock_order_item_api(
    #         order_item.id)
    #     self.main._get_unsold_items_value(
    #         InventoryItemValue(order_item.id, 0, 0, 0, ''))
    #     self.assertEqual(
    #         self.mock_graphql_client._make_request.call_count, mock_apis.num_orders_pages)

    def _call_get_unsold(self, data: list) -> list[OrderItem]:
        self.mock_graphql_client \
            ._make_request.side_effect = mock_apis.get_predictable_mock_order_item_api(data)
        unsold = self.main \
            ._get_unsold_items(InventoryItemValue('some id', 0, 0, 0, 'earliest unsold'))
        return unsold
    
    def test_general_case(self):
        data = map(
            lambda x: {'order_type': x[0], 'qty': x[1]},
            [
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

    def test_only_customer_order(self):
        data = [
            (OrderType.CustomerOrder, 10),
            (OrderType.CustomerOrder, -3),
            (OrderType.CustomerOrder, 5),
            (OrderType.CustomerOrder, 5),
            (OrderType.CustomerOrder, 5),
        ]
        unsold = self._call_get_unsold(data)
        self.assertEqual(len(unsold), 22)
        
        for item in unsold:
            self.assertTrue(item.is_customer_order())

if __name__ == '__main__':
    unittest.main()
