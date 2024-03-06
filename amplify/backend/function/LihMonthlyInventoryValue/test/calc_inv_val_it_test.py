from dataclasses import asdict
import random
import unittest
from unittest.mock import MagicMock
import mock_apis
import sys
import os
from datetime import datetime, timedelta, timezone
from dateutil.relativedelta import relativedelta

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import InventoryValueCache, Main, InventoryItemValue, MyDateTime, OrderItem
sys.path.pop(0)


class TestCalculateInventoryValue(unittest.TestCase):
    
    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.mock_dynamodb_client = MagicMock()
        self.main = Main(self.mock_graphql_client, MagicMock())
        self.dt = datetime(1970, 1, 2, tzinfo=timezone.utc)
        self.iso_earliest_unsold = MyDateTime.to_ISO8601(self.dt)
        self.table_name = 'some table name'
    
    def _set_mock_graphql_resp(self, get_cache_resp = {}):
        self.mock_graphql_client.make_request.side_effect = [get_cache_resp]

    def _build_inv_val_cache(self, created_date: datetime, cache_items: list):
        cache = InventoryValueCache(
            self.mock_graphql_client,
            self.mock_dynamodb_client,
            created_date=created_date,
            table_name=self.table_name
        )
        for i in cache_items:
            cache[i.itemId] = i
        return cache
        
    def _build_inv_cache_item(self, item_id: str, inv_qty: int = 0):
        res = InventoryItemValue.default(item_id)
        res.aggregateValue=random.randint(0, 5), 
        res.numUnsold=random.randint(0, 5), 
        res.inventoryQty=inv_qty, 
        res.earliestUnsold=self.iso_earliest_unsold
        return res

    def test_setting_inv_qty(self):
        n = 10
        last_month = self.dt - relativedelta(months=1)
        inventory = mock_apis.gen_inventory_items_response(n)
        cache_items = [self._build_inv_cache_item(x.id) for x in inventory]
        prev_cache = self._build_inv_val_cache(last_month, cache_items)
        expected_inv_cache_values = [self._build_inv_cache_item(i.id) for i in inventory]
        
        mock_unsold_items_val = MagicMock()
        self.main._get_unsold_items_value = mock_unsold_items_val
        mock_unsold_items_val.side_effect = expected_inv_cache_values
        
        actual_cache = self.main.calculate_inventory_balance(
            self.dt,
            self.dt,
            inventory,
            prev_cache
        )
        
        for inv_item in inventory:
            actual = actual_cache[inv_item.id]
            self.assertEqual(inv_item.quantityOnHand, actual.inventoryQty)
            

if __name__ == '__main__':
    unittest.main()
