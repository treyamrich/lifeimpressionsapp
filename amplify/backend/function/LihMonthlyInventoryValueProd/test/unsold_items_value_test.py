from datetime import datetime
import unittest
from unittest.mock import MagicMock
import mock_apis
from mock_apis import OrderType
import sys
import os

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import Main, InventoryItemValue, MyDateTime
sys.path.pop(0)


class TestUnsoldItemsValue(unittest.TestCase):
    
    def setUp(self):
        self.dummy_dt = MyDateTime.get_now_UTC()
        self.mock_graphql_client = MagicMock()
        self.main = Main(self.mock_graphql_client, MagicMock())
        self.initial_item_value = 10
        
        v = InventoryItemValue.default('some_id')
        v.aggregateValue = self.initial_item_value
        self.initial_cache_val = v


    def _call_get_unsold_items_value(self, data: list) -> InventoryItemValue:
        self.mock_graphql_client \
            .make_request.side_effect = mock_apis.get_predictable_mock_order_item_api(data)
        inv_item_val = self.main._get_unsold_items_value(self.initial_cache_val, self.dummy_dt, self.dummy_dt)
        return inv_item_val
    
    def _transform_data(self, data: list):
        return map(lambda x: {'order_type': x[0], 'qty': x[1], 'cost_per_unit': x[2]}, data)

    def test_pagination(self):
        order_item = mock_apis.select_random_order_item()
        self.mock_graphql_client.make_request.side_effect = mock_apis.get_rand_mock_order_item_api(
            order_item.id)
        self.main._get_unsold_items_value(
            InventoryItemValue.default(order_item.id), self.dummy_dt, self.dummy_dt)
        self.assertEqual(
            self.mock_graphql_client.make_request.call_count, mock_apis.num_orders_pages)
        
    def test_general_case(self):
        data = self._transform_data([
            (OrderType.CustomerOrder, 10, 0), # i = 0; Expect 0
            (OrderType.PurchaseOrder, 3, 5.12), # i = 1; Expect 0
            (OrderType.CustomerOrder, 5, 0), # i = 2; Expect 0
            (OrderType.PurchaseOrder, 24, 20.12), # i = 3; Expect $(12 x 20) = $240
            (OrderType.CustomerOrder, 5, 0), # i = 4; Expect $(7 x 20) = $140
        ])
        
        earlist_unsold_index = 3
        remain_cost_per_unit = 20.12
        n = 7
        expected = InventoryItemValue.default(self.initial_cache_val.itemId)
        expected.aggregateValue = remain_cost_per_unit * n + self.initial_item_value
        expected.numUnsold = n
        expected.earliestUnsold = datetime.fromtimestamp(earlist_unsold_index).isoformat()
        
        unsold_value = self._call_get_unsold_items_value(data)
        self.assertEqual(expected, unsold_value)

    def test_empty_case(self):
        earliest_unsold = MyDateTime.to_ISO8601(self.dummy_dt)
        expected = InventoryItemValue.default(self.initial_cache_val.itemId)
        expected.aggregateValue = self.initial_item_value
        expected.earliestUnsold = earliest_unsold
        
        unsold_val = self._call_get_unsold_items_value([])
        self.assertEqual(unsold_val, expected)

    def test_over_sold_item(self):
        data = self._transform_data([
            (OrderType.PurchaseOrder, 10, 22),
            (OrderType.CustomerOrder, -3, 33),
            (OrderType.CustomerOrder, 5, 4),
            (OrderType.CustomerOrder, 5, 5),
            (OrderType.CustomerOrder, 5, 1),
        ])
        earlist_unsold_index = 4
        n = -2
        expected = InventoryItemValue.default(self.initial_cache_val.itemId)
        expected.aggregateValue = self.initial_item_value
        expected.numUnsold = n
        expected.earliestUnsold = datetime.fromtimestamp(earlist_unsold_index).isoformat()

        unsold_value = self._call_get_unsold_items_value(data)
        self.assertEqual(expected, unsold_value)

if __name__ == '__main__':
    unittest.main()