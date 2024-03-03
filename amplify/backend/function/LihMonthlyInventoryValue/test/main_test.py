import unittest
from unittest.mock import MagicMock
import generate_test_input as gen_input
import sys
import os

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import Main, InventoryItemValue
sys.path.pop(0)


class TestMain(unittest.TestCase):
    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.main = Main(self.mock_graphql_client)

    def test_list_full_inventory(self):
        self.mock_graphql_client._make_request.side_effect = gen_input.get_mock_inventory_item_api()
        self.main._list_full_inventory()
        self.assertEqual(self.mock_graphql_client._make_request.call_count, gen_input.num_inv_pages)

    def test_get_unsold_items_value(self):
        order_item = gen_input.select_random_order_item()
        self.mock_graphql_client._make_request.side_effect = gen_input.get_mock_order_item_api(order_item.id)
        self.main._get_unsold_items_value(InventoryItemValue(order_item.id, 0, 0, 0, ''))
        self.assertEqual(self.mock_graphql_client._make_request.call_count, gen_input.num_orders_pages)


if __name__ == '__main__':
    unittest.main()
