import unittest
from unittest.mock import MagicMock
from datetime import datetime, timedelta, timezone
from dateutil.relativedelta import relativedelta
import sys
import os

sys.path.insert(0, os.path.abspath(".."))
from src.index import CacheExpiration, TZ_UTC_HOUR_OFFSET, MyDateTime
sys.path.pop(0)

class TestCacheExpiration(unittest.TestCase):
    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.cache_expir = CacheExpiration(self.mock_graphql_client)
        self.end = MyDateTime.to_tz(MyDateTime.get_now_UTC(), TZ_UTC_HOUR_OFFSET)
        self.start = self.end - relativedelta(months=2)
        
    def _set_get_cache_expiration_resp(self, earliest_expired = { 'id': 'A', 'earliestExpired': None }):
        self.mock_graphql_client.make_request.return_value = earliest_expired
    
    def test_get_same_range(self):
        self._set_get_cache_expiration_resp()
        res = self.cache_expir.get_expired_cache_range(self.start, self.end)
        self.assertEqual(res, (self.start, self.end))
        
    def test_none_resp(self):
        self._set_get_cache_expiration_resp(None)
        res = self.cache_expir.get_expired_cache_range(self.start, self.end)
        self.assertEqual(res, (self.start, self.end))
        
    def test_get_expiration_range(self):
        expected_start = datetime(2020, 1, 1, tzinfo=timezone(timedelta(hours=TZ_UTC_HOUR_OFFSET)))
        expected_end = MyDateTime.curr_month_start_in_tz(TZ_UTC_HOUR_OFFSET)
        self._set_get_cache_expiration_resp({ 'id': 'A', 'earliestExpired': '2020-01-01'})
        res = self.cache_expir.get_expired_cache_range(self.start, self.end)
        self.assertEqual(res, (expected_start, expected_end))
        
        
if __name__ == '__main__':
    unittest.main()
    