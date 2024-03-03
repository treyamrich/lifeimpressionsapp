from datetime import datetime, timedelta, timezone
import unittest
import sys, os
sys.path.insert(0, os.path.abspath(".."))
from src.index import MyDateTime
sys.path.pop(0)

class TestMyDateTime(unittest.TestCase):

    def setUp(self):
        self.utc_str = '1970-01-04T17:45:46Z'
        self.utc_str_1 = '1970-01-04T17:45:47Z'
        self.tz_offset = -8
        self.tz = timezone(timedelta(hours=self.tz_offset))

    def test_parse_UTC(self):
        parsed_datetime = MyDateTime.parse_UTC(self.utc_str)
        self.assertEqual(parsed_datetime, datetime(1970, 1, 4, 17, 45, 46, tzinfo=timezone.utc))

    def test_tz(self):
        tz_time = MyDateTime.parse_UTC(self.utc_str, self.tz_offset)
        expected_time = datetime(1970, 1, 4, 9, 45, 46, tzinfo=self.tz)
        self.assertEqual(tz_time, expected_time)

    def test_to_ISO8601(self):
        t = MyDateTime.parse_UTC(self.utc_str)
        t_in_timezone = MyDateTime.parse_UTC(self.utc_str, self.tz_offset)
        tz_iso_str = MyDateTime.to_ISO8601(t_in_timezone)
        t_iso_str = MyDateTime.to_ISO8601(t)
        self.assertEqual(tz_iso_str, self.utc_str)
        self.assertEqual(t_iso_str, self.utc_str)

    def test_tz_comparison(self):
        t_0 = MyDateTime.parse_UTC(self.utc_str, self.tz_offset)
        t_1 = MyDateTime.parse_UTC(self.utc_str_1, self.tz_offset)
        self.assertGreater(t_1, t_0)
    
    def test_month_start(self):
        time_on_year_month_border = '1970-01-01T7:45:46Z'
        utc_t = MyDateTime.parse_UTC(time_on_year_month_border)
        tz_t = MyDateTime.parse_UTC(time_on_year_month_border, self.tz_offset)
        utc_month_start = MyDateTime.to_month_start(utc_t)
        tz_month_start = MyDateTime.to_month_start(tz_t)
        self.assertEqual(utc_month_start, datetime(1970, 1, 1, 0, 0, 0, 0, tzinfo=timezone.utc))
        self.assertEqual(tz_month_start, datetime(1969, 12, 1, 0, 0, 0, 0, tzinfo=self.tz))



if __name__ == '__main__':
    unittest.main()
