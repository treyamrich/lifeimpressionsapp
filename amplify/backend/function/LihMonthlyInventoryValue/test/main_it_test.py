from dataclasses import asdict
import unittest
from unittest.mock import MagicMock
import mock_apis
import sys
import os
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import InventoryValueCache, Main, InventoryItemValue, MyDateTime, OrderItem
sys.path.pop(0)


class TestMain(unittest.TestCase):
    
    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.mock_dynamodb_client = MagicMock()
        self.main = Main(self.mock_graphql_client, self.mock_dynamodb_client)
        self.start = datetime(1970, 1, 1, tzinfo=timezone.utc)
        self.end = self.start.replace(month=2)
        self.earliest_unsold = datetime(1969, 11, 2, tzinfo=timezone.utc)
        self.iso_earliest_unsold = MyDateTime.to_ISO8601(self.earliest_unsold)
        self.table_name = 'test'
    
    def _set_mock_graphql_resp(self, get_cache_resp = {}):
        self.mock_graphql_client.make_request.side_effect = \
            [x for x in mock_apis.get_rand_mock_inventory_item_api()] + [get_cache_resp]
    
    def _set_mock_batch_write_resp(self, unprocessed_items: list):
        self.mock_dynamodb_client.batch_write_item.return_value = unprocessed_items

    def _get_call_args_date_range(self):
        return [
            (args[0], args[1]) 
            for args, _ in self.main.calculate_inventory_balance.call_args_list
        ]
    
    def _build_inv_val_cache(self, created_date: datetime):
        return InventoryValueCache(
            self.mock_graphql_client,
            self.mock_dynamodb_client,
            created_date=created_date,
            table_name=self.table_name
        )
        
    def _build_inv_cache_item(self, item_id: str):
        return InventoryItemValue(
            itemId=item_id, 
            aggregateValue=1, 
            numUnsold=1, 
            inventoryQty=0, 
            earliestUnsold=self.iso_earliest_unsold
        )

    def test_month_iteration(self):
        start, end = datetime(1970, 1, 1), datetime(1970, 4, 1)
        expected_calls = [
            (start, datetime(1970, 2, 1)),
            (datetime(1970, 2, 1), datetime(1970, 3, 1)),
            (datetime(1970, 3, 1), end)
        ]
        self._set_mock_graphql_resp()
        self._set_mock_batch_write_resp([])
        self.main.calculate_inventory_balance = MagicMock()
        self.main.run(start, end)
        assert self._get_call_args_date_range() == expected_calls

    def test_non_uniform_month_step_iter(self):
        start, end = datetime(1970, 1, 1), datetime(1970, 2, 5)
        expected_calls = [
            (start, datetime(1970, 2, 1)),
            (datetime(1970, 2, 1), end)
        ]
        self._set_mock_graphql_resp()
        self._set_mock_batch_write_resp([])
        self.main.calculate_inventory_balance = MagicMock()
        self.main.run(start, end)
        assert self._get_call_args_date_range() == expected_calls
        
    def test_loading_prev_cache(self):
        last_month = self.start.replace(year=1969, month=12)

        self._set_mock_graphql_resp()
        self._set_mock_batch_write_resp([])
        self.main.calculate_inventory_balance = MagicMock()
        self.main.run(self.start, self.end)
        
        calls = self.mock_graphql_client.make_request.call_args_list
        for args, _ in calls:
            if args[0] == InventoryValueCache.getInventoryValueCache:
                self.assertEqual(args[1], { 'createdAt': MyDateTime.to_ISO8601(last_month, True)})
    
    def test_save_one_cache(self):
        item = self._build_inv_cache_item('123')
        cache = self._build_inv_val_cache(self.start)
        cache[item.itemId] = item
        
        self._set_mock_graphql_resp()
        self.main.calculate_inventory_balance = MagicMock()
        self.main.calculate_inventory_balance.return_value = cache
        self.main.run(self.start, self.end)

        self.mock_dynamodb_client.put_item.assert_called_once()
        call_list = self.mock_dynamodb_client.put_item.call_args_list
        args, _ = call_list[0]
        self.assertEqual(args, (
            self.table_name, 
            { 
             'createdAt': MyDateTime.to_ISO8601(self.start, True), 
             'lastItemValues': [asdict(item)]
            }
        ))
        
    
    def test_save_multiple_caches(self):
        add_month = lambda x: self.start + relativedelta(months=x)
        minus_month = lambda x: self.start - relativedelta(months=x)
        get_created_iso = lambda x: MyDateTime.to_ISO8601(x, True)
        n = 5
        items = [self._build_inv_cache_item(str(i)) for i in range(n)]
        caches = [self._build_inv_val_cache(add_month(i)) for i in range(n)]
        for idx, cache in enumerate(caches):
            item = items[idx]
            cache[item.itemId] = item
        expected_prev_cache = {
            'createdAt': minus_month(1), # should be str but is converted below
            'lastItemValues': [asdict(self._build_inv_cache_item('prev_cache'))]
        }
        
        self._set_mock_graphql_resp(expected_prev_cache)
        self._set_mock_batch_write_resp([])
        self.main.calculate_inventory_balance = MagicMock()
        self.main.calculate_inventory_balance.side_effect = caches
        self.main.run(self.start, self.start + relativedelta(months=n))
        
        call_list = self.main.calculate_inventory_balance.call_args_list
        for i, call in enumerate(call_list):
            args, _ = call
            prev_cache = args[3]
            expected = caches[i-1]._created_date if i > 0 else expected_prev_cache['createdAt']
            self.assertEqual(get_created_iso(prev_cache._created_date), get_created_iso(expected))
        
        call_list = self.mock_dynamodb_client.batch_write_item.call_args_list
        args, _ = call_list[0]
        # Can't check test table name since it's tied to env vars
        self.assertEqual(args[1],
            [{ 
             'createdAt': get_created_iso(add_month(i)), 
             'lastItemValues': [asdict(items[i])]
            } for i in range(n)]
        )

    

if __name__ == '__main__':
    unittest.main()
