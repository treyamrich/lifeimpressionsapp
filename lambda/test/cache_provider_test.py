from typing import List
import unittest
from unittest.mock import MagicMock
from datetime import datetime
from mock_apis import build_date

import sys
import os

sys.path.insert(0, os.path.abspath(".."))
from src.index import CacheProvider, Factory, DateRange, InventoryValueCache, Queries
sys.path.pop(0)

class TestCacheProvider(unittest.TestCase):

    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.mock_dynamodb_client = MagicMock()
        self.mock_inventory = MagicMock()
        self.factory = Factory(
            self.mock_graphql_client, 
            self.mock_dynamodb_client, 
            self.mock_inventory
        )
        self.mock_inventory_value_cache = MagicMock()
        self.mock_inventory_calculator = MagicMock()

        mock_new_inventory_value_cache = MagicMock()
        self.factory.new_inventory_value_cache = mock_new_inventory_value_cache
        mock_new_inventory_value_cache.return_value = self.mock_inventory_value_cache

        mock_new_inventory_calculator = MagicMock()
        self.factory.new_inventory_value_calculator = mock_new_inventory_calculator
        mock_new_inventory_calculator.return_value = self.mock_inventory_calculator

        self.intended_start_date = build_date(2020, 3, 18)
        self.earliest_expired = '2020-01-01'
    
    def test_not_expired(self):
        expected_prev_cache = self._build_inv_val_cache(build_date(2020, 1, 1))
        self._expect_not_expired()
        mock_inventory_value_cache = self.mock_inventory_value_cache
        mock_inventory_value_cache.read_db.return_value = expected_prev_cache
        
        cp = CacheProvider(
            self.intended_start_date,
            self.factory,
        )
        self._assert_caches_not_renewed(cp)

        prev_cache = cp.get_previous_cache()
        self.assertEqual(prev_cache, expected_prev_cache)

    def test_empty_api_response(self):
        self._expect_empty_api_resp()
        cp = CacheProvider(
            self.intended_start_date,
            self.factory,
        )
        self._assert_caches_not_renewed(cp)
        
    def test_expired(self):
        """
            e.g. if the earliest expired date is 2020-01-01,
            the expired range should be from 2020-01-01 to 2020-03-18 (the ref date)
            and the earliest good cache was created with 2019-12-01 and
            is for the range 2019-12-01 to 2010-12-31
        """
        earliest_expired = build_date(2020, 1, 1)
        one_month_ago = build_date(2019, 12, 1)
        start_of_intended = build_date(2020, 3, 1)
        renewed_caches = [
            self._build_inv_val_cache(build_date(2020, 1, 1)),
            self._build_inv_val_cache(build_date(2020, 2, 1)),
        ]

        self._expect_expired_date()
        self._set_returned_renewed_caches(renewed_caches)
        self._set_dynamodb_batch_write_resp()

        cp = CacheProvider(
            self.intended_start_date,
            self.factory,
        )
        self._assert_expiration_checked()

        self._expect_caches_renewed(
            cp, 
            one_month_ago, 
            DateRange(earliest_expired, start_of_intended),
            renewed_caches
        )

        prev_cache = cp.get_previous_cache()
        self.assertEqual(prev_cache, renewed_caches[1])

    def test_empty_cache_values(self):
        self._expect_expired_date()
        self._set_returned_renewed_caches([])
        with self.assertRaises(Exception):
            CacheProvider(
                self.intended_start_date,
                self.factory,
            )

    def test_wrong_prev_cache(self):
        renewed_caches = [
            self._build_inv_val_cache(build_date(2020, 1, 1)),
            self._build_inv_val_cache(build_date(2020, 2, 1)),
        ]
        self._expect_expired_date()
        self._set_returned_renewed_caches(renewed_caches)
        self._set_dynamodb_batch_write_resp()
        cp = CacheProvider(
            self.intended_start_date,
            self.factory,
        )
        cp._prev_cache = renewed_caches[0] # "Hacking it" to be the wrong the wrong cache
        with self.assertRaises(Exception):
            cp.get_previous_cache()

    def _assert_expiration_checked(self):
        call_list = self.mock_graphql_client.make_request.call_args_list
        # 1st call should check cache expiration
        call_1 = call_list[0]
        args, _ = call_1
        self.assertEqual(args[0], Queries.getCacheExpiration)

    def _assert_caches_renewed(self ):
        call_list = self.mock_graphql_client.make_request.call_args_list
        # 2nd call should renew cache
        call_2 = call_list[1]
        args, _ = call_2
        self.assertEqual(args[0], Queries.renewCache)

    def _assert_caches_not_renewed(self, cp: CacheProvider):
        self._assert_expiration_checked()
        self._do_not_expect_new_inventory_value_cache()
        self._do_not_expect_new_inventory_value_calculator()

        self.assertFalse(cp._did_renew_caches)

    def _assert_inventory_calculator_read_values(self):
        mock_inventory_value_calculator = self.factory.new_inventory_value_calculator
        mock_inventory_value_calculator.values.assert_called_once()

    def _expect_caches_renewed(
        self, 
        cp: CacheProvider,
        expected_prev_cache_date: datetime,
        expected_expired_range: DateRange,
        expected_renewed_caches: List[InventoryValueCache]
    ):
        new_inventory_value_cache = self.factory.new_inventory_value_cache
        new_inventory_value_cache.assert_called_once()
        new_inventory_value_cache.assert_called_with(expected_prev_cache_date)

        mock_inventory_value_cache = self.mock_inventory_value_cache
        mock_inventory_value_cache.read_db.assert_called_once()

        new_inventory_value_calculator = self.factory.new_inventory_value_calculator
        new_inventory_value_calculator.assert_called_once()
        new_inventory_value_calculator.assert_called_with(
            expected_expired_range,
            unittest.mock.ANY
        )

        mock_dynamicdb_client = self.mock_dynamodb_client
        mock_dynamicdb_client.batch_write_item.assert_called_with(
            [c._to_write_db_input() for c in expected_renewed_caches]
        )

        mock_graphql_client = self.mock_graphql_client
        mock_graphql_client.make_request.assert_called_with(
            Queries.updateCacheExpiration,
            CacheProvider.INITIAL_CACHE_STATE_INPUT
        )
        self.assertTrue(cp._did_renew_caches)

    def _do_not_expect_new_inventory_value_cache(self):
        new_inventory_value_cache = self.factory.new_inventory_value_cache
        new_inventory_value_cache.assert_not_called

    def _do_not_expect_new_inventory_value_calculator(self):
        new_inventory_value_calculator = self.factory.new_inventory_value_calculator
        new_inventory_value_calculator.assert_not_called()

    def _expect_not_expired(self):
        self.mock_graphql_client.make_request.return_value = { 'id': 'A', 'earliestExpiredDate': '' }
    
    def _expect_empty_api_resp(self):
        self.mock_graphql_client.make_request.return_value = None

    def _expect_expired_date(self):
        self.mock_graphql_client.make_request.return_value = { 'id': 'A', 'earliestExpiredDate': self.earliest_expired }
        
    def _set_returned_renewed_caches(self, values):
        mock_inventory_calculator = self.mock_inventory_calculator
        mock_inventory_calculator.calculate.return_value = mock_inventory_calculator
        mock_inventory_calculator.values.return_value = values

    def _set_dynamodb_batch_write_resp(self):
        mock_dynamicdb_client = self.mock_dynamodb_client
        mock_dynamicdb_client.batch_write_item.return_value = []

    def _build_inv_val_cache(self, created_date: datetime):
        return InventoryValueCache(
            self.mock_graphql_client,
            self.mock_dynamodb_client,
            created_date=created_date,
        )

if __name__ == '__main__':
    unittest.main()
    