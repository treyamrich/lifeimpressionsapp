from dataclasses import asdict
import unittest
from unittest.mock import MagicMock
import mock_apis
import sys
import os
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from mock_apis import OrderType, gen_inventory_items_response, get_rand_mock_inventory_item_api

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
        
    def _build_inv_cache_item(self, item_id: str, cum_val=1, num_unsold=1):
        return InventoryItemValue(
            itemId=item_id, 
            aggregateValue=cum_val, 
            numUnsold=num_unsold, 
            inventoryQty=0, 
            earliestUnsold=self.iso_earliest_unsold
        )

    # def test_validate_date_range(self):
    #     start, end = datetime(1970, 1, 1), datetime(1969, 12, 31)
    #     res = self.main._validate_start_end(start, end)
    #     self.assertFalse(res)
        
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

    def _transform_data(self, data: list):
        return map(lambda x: {'order_type': x[0], 'qty': x[1], 'cost_per_unit': x[2]}, data)
    
    def test_full_integration(self):        
        # Inventory
        num_inv_items, num_inv_pages = 5, 1
        inv_items = gen_inventory_items_response(num_inv_items)
        inv_resp = [x for x in get_rand_mock_inventory_item_api(inv_items, num_inv_pages)]

        # Load prev cache
        last_month = self.start.replace(year=1969, month=12)
        expected_prev_cache = {
            'createdAt': MyDateTime.to_ISO8601(last_month),
            'lastItemValues': [
                asdict(self._build_inv_cache_item(x.id, cum_val=i, num_unsold=x.quantityOnHand)) 
                for i, x in enumerate(inv_items)
            ]
        }

        # List Order Item
        def exhaust_mock_api_iterator(data):
            data = self._transform_data(data)
            num_pages = 1
            return [x for x in mock_apis.get_predictable_mock_order_item_api(data, num_pages)]
        
        data_1 = [
            (OrderType.CustomerOrder, 10, 0), # i = 0; Expect 0
            (OrderType.PurchaseOrder, 3, 5.12), # i = 1; Expect 0
            (OrderType.CustomerOrder, 5, 0), # i = 2; Expect 0
            (OrderType.PurchaseOrder, 24, 20.12), # i = 3; Expect $(12 x 20) = $240
            (OrderType.CustomerOrder, 5, 0), # i = 4; Expect $(7 x 20) = $140 + 0
        ]
        
        data_2 = [
            (OrderType.PurchaseOrder, 10, 55.5),
            (OrderType.CustomerOrder, 6, 0) # Expect 4 x 55.5 = $222 + $1
        ]
        
        data_3 = [
            (OrderType.CustomerOrder, 10, 0),
            (OrderType.PurchaseOrder, 1, 5) #Expect $0 + $2
        ]
        
        data_4 = [
            (OrderType.CustomerOrder, 10, 0),
            (OrderType.CustomerOrder, 5, 0),
            (OrderType.PurchaseOrder, 100, 3) # Expect 85 x 3 = $255 + 3
        ]
        
        data_5 = [
            (OrderType.PurchaseOrder, 10, 20) # Expect $200 + $4
        ]
        
        expected_cache_item_vals = [140.84, 223, 2, 258, 204]
        expected_num_unsolds = [7, 4, -9, 85, 10]
        
        order_items = list(map(
            lambda d: exhaust_mock_api_iterator(d)[0], 
            [data_1, data_2, data_3, data_4, data_5]
        ))
        resps = inv_resp + [expected_prev_cache]
        resps.extend(order_items)

        self.mock_graphql_client.make_request.side_effect = resps
        
        self.main.run(self.start, self.end)
    
        self.assertEqual(self.mock_graphql_client.make_request.call_count, 7)
        
        self.mock_dynamodb_client.put_item.assert_called_once()
        save_cache_call = self.mock_dynamodb_client.put_item.call_args_list
        args, _ = save_cache_call[0]
        _, inv_cache_json = args
        inv_val_items = [InventoryItemValue(**x) for x in inv_cache_json['lastItemValues']]
        
        for i, inv_val_item in enumerate(inv_val_items):
            self.assertEqual(inv_val_item.aggregateValue, expected_cache_item_vals[i])
            self.assertEqual(inv_val_item.numUnsold, expected_num_unsolds[i])
        
            
            
if __name__ == '__main__':
    unittest.main()
