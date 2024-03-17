import unittest
from unittest.mock import MagicMock
import mock_apis
import sys
import os

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import Main
sys.path.pop(0)


class TestMain(unittest.TestCase):
    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.main = Main(self.mock_graphql_client, MagicMock())

    def test_list_full_inventory(self):
        self.mock_graphql_client.make_request.side_effect = mock_apis.get_rand_mock_inventory_item_api()
        self.main._list_full_inventory()
        self.assertEqual(
            self.mock_graphql_client.make_request.call_count, mock_apis.num_inv_pages)
        
    def test_empty_response(self):
        # Should not throw errors
        self.mock_graphql_client.make_request.side_effect = mock_apis.PaginationSimulator([], 2,  Main.listTshirts.name)
        self.main._list_full_inventory()
        call_count = self.mock_graphql_client.make_request.call_count
        self.assertEqual(call_count, 1)

if __name__ == '__main__':
    unittest.main()
