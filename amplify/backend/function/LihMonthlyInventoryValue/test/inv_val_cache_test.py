import unittest
from unittest.mock import MagicMock
import sys
import os
from datetime import datetime, timezone
import uuid

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import InventoryValueCache, Main
sys.path.pop(0)


class TestInventoryValueCache(unittest.TestCase):
    
    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.mock_dynamodb_client = MagicMock()
        self.cache = InventoryValueCache(
            self.mock_graphql_client, 
            self.mock_dynamodb_client,
            datetime(1970, 1, 1, tzinfo=timezone.utc),
            ''
        )
        self.main = Main(self.mock_graphql_client, MagicMock())

    def _build_cache_item(self, itemId):
        return {
            'aggregateValue': 11.10,
            'itemId': itemId,
            'earliestUnsold': "",
            'numUnsold': 2,
            'inventoryQty': 5,
            'tshirtStyleNumber': '',
            'tshirtColor': '',
            'tshirtSize': ''
        }

    def _set_mock_get_cache_resp(self, items: list[dict], created_at: str = '1970-01-01'):
        self.mock_graphql_client.make_request.return_value = \
            { 'lastItemValues': items, 'createdAt': created_at }

    def test_load(self):
        n = 10
        ids = [str(uuid.uuid4()) for _ in range(n)]
        cache_items = [self._build_cache_item(itemId=ids[i]) for i in range(n)]
        self._set_mock_get_cache_resp(cache_items)
        self.cache.read_db()

        for i in range(n):
            self.assertEqual(ids[i], self.cache[ids[i]].itemId)
            

if __name__ == '__main__':
    unittest.main()
