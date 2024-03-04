import unittest
from unittest.mock import MagicMock
import mock_apis
import sys
import os
from datetime import datetime, timedelta, timezone
from dateutil.relativedelta import relativedelta

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import Main, InventoryItemValue, MyDateTime, OrderItem
sys.path.pop(0)


class TestMain(unittest.TestCase):
    
    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.main = Main(self.mock_graphql_client)
    
    def _call_run(self, start: datetime, end: datetime):
        self.mock_graphql_client.make_request.side_effect = \
            mock_apis.get_rand_mock_inventory_item_api()
        self.main.calculate_inventory_balance = MagicMock()
        self.main.run(start, end)

    def _get_call_args_date_range(self):
        return [
            (call_args[0], call_args[1]) 
            for call_args, _ in self.main.calculate_inventory_balance.call_args_list
        ]

    def test_month_iteration(self):
        start, end = datetime(1970, 1, 1, 0), datetime(1970, 4, 1, 0)
        expected_calls = [
            (start, datetime(1970, 2, 1, 0)),
            (datetime(1970, 2, 1, 0), datetime(1970, 3, 1, 0)),
            (datetime(1970, 3, 1, 0), end)
        ]
        self._call_run(start, end)
        assert self._get_call_args_date_range() == expected_calls

    def test_non_uniform_month_step_iter(self):
        start, end = datetime(1970, 1, 1, 0), datetime(1970, 2, 5, 0)
        expected_calls = [
            (start, datetime(1970, 2, 1, 0)),
            (datetime(1970, 2, 1, 0), end)
        ]
        self._call_run(start, end)
        assert self._get_call_args_date_range() == expected_calls

    

if __name__ == '__main__':
    unittest.main()
