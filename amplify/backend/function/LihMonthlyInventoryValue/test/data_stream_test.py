import unittest
import sys
import os
from mock_apis import build_date

sys.path.insert(0, os.path.abspath(".."))
from src.index import QueueItem, DataStream

sys.path.pop(0)


class TestDataStream(unittest.TestCase):

    def setUp(self):
        data = [
            build_date(2020, 1, 1, hour=1), # 0
            build_date(2020, 1, 1, hour=3), # 1
            build_date(2020, 1, 1, hour=5), # 2
            build_date(2020, 1, 1, hour=23),# 3
            build_date(2020, 1, 3, hour=1), # 4
            build_date(2020, 1, 3, hour=3), # 5
            build_date(2020, 1, 4, hour=0), # 6
            build_date(2020, 2, 5, hour=0), # 7
            build_date(2020, 2, 7, hour=3), # 8
            build_date(2020, 3, 8, hour=0), # 9
        ]
        self.data_source = [QueueItem(0, 0, d) for d in data]

    def test_iteration(self):
        data_stream = DataStream(iter(self.data_source))

        self.assertFalse(data_stream.is_empty())

        before_start = data_stream.read_until(build_date(2019, 12, 31, 6))
        self.assertEqual(before_start, [])
        self.assertFalse(data_stream.is_empty())

        first_4 = data_stream.read_until(build_date(2020, 1, 3))
        self.assertEqual(first_4, self.data_source[:4])
        self.assertFalse(data_stream.is_empty())

        fifth_item = data_stream.read_until(build_date(2020, 1, 3, hour=2))
        self.assertEqual(fifth_item, self.data_source[4:5])
        self.assertFalse(data_stream.is_empty())

        reread_range = data_stream.read_until(build_date(2020, 1, 3))
        self.assertEqual(reread_range, [])

        rest_of_stream = data_stream.read_until(build_date(2025, 1, 1, hour=0))
        self.assertEqual(rest_of_stream, self.data_source[5:])
        self.assertTrue(data_stream.is_empty())

    def test_empty_stream(self):
        data_stream = DataStream(iter([]))
        self.assertTrue(data_stream.is_empty())
        self.assertEqual(data_stream.read_until(build_date(2020, 1, 1)), [])

if __name__ == '__main__':
    unittest.main()