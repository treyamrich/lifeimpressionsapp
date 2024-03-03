from src.index import Main, InventoryItemValue
import unittest
from unittest.mock import MagicMock
import mock_apis
from mock_apis import OrderType
import sys
import os

# Import your module
sys.path.insert(0, os.path.abspath(".."))
sys.path.pop(0)


class TestMain(unittest.TestCase):
    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.main = Main(self.mock_graphql_client)

    def test_list_full_inventory(self):
        self.mock_graphql_client._make_request.side_effect = mock_apis.get_rand_mock_inventory_item_api()
        self.main._list_full_inventory()
        self.assertEqual(
            self.mock_graphql_client._make_request.call_count, mock_apis.num_inv_pages)

if __name__ == '__main__':
    unittest.main()
