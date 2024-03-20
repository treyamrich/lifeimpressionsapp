from datetime import datetime, timedelta, timezone
from dateutil.relativedelta import relativedelta
import unittest
import sys, os
sys.path.insert(0, os.path.abspath(".."))
from src.index import MyDateTime, get_start_end
sys.path.pop(0)

class TestLambdaHandler(unittest.TestCase):

    def test_start_end_hypothetical(self):
        iso = lambda x: MyDateTime.to_ISO8601(x)
        
        now = datetime(2024, 1, 1, 12, 10, 1, tzinfo=timezone.utc)
        
        now = MyDateTime.to_tz(now, -10) # Pacific/Honolulu timezone
        now = MyDateTime.to_month_start(now)
        start = now - relativedelta(months=1)
        
        self.assertEqual(iso(now), '2024-01-01T10:00:00Z')
        self.assertEqual(iso(start), '2023-12-01T10:00:00Z')
        
    def test_get_start_end_with_bad_input(self):
        input = {
            'start_inclusive': {
                'month': 2,
            }
        }
        with self.assertRaises(ValueError):
            get_start_end(input)
            
    def test_get_start_end_with_valid_input(self):
        input = {
            'start_inclusive': {
                'month': 2,
                'year': 2020
            },
            'end_exclusive': {
                'month': 3,
                'year': 2024
            }
        }
        # Should raise no exception
        get_start_end(input)
            
    def test_get_now_start_end(self):
        get_start_end({})
        
        
if __name__ == '__main__':
    unittest.main()