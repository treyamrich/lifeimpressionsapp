import unittest
import sys
import os
from mock_apis import build_date

sys.path.insert(0, os.path.abspath(".."))
from src.index import BucketIterator, QueueItem, MyDateTime, BucketUnit

sys.path.pop(0)


class TestBucketIterator(unittest.TestCase):

    def setUp(self):
        data_source = [
            build_date(2020, 1, 1, hour=1),
            build_date(2020, 1, 1, hour=3),
            build_date(2020, 1, 1, hour=5),
            build_date(2020, 1, 3, hour=1),
            build_date(2020, 1, 3, hour=3),
            build_date(2020, 1, 4, hour=0),
            build_date(2020, 2, 5, hour=0),
            build_date(2020, 2, 7, hour=3),
            build_date(2020, 3, 8, hour=0),
        ]
        self.data_source = [
            QueueItem(0, 0, MyDateTime.to_ISO8601(d)) for d in data_source
        ]

    def test_day_iteration(self):
        start = build_date(2020, 1, 1)
        end = build_date(2020, 1, 4)
        bucket_iterator = BucketIterator(start, end, BucketUnit.DAY, self.data_source)

        day_1 = next(bucket_iterator)
        self.assertEqual(day_1, self.data_source[0:3])

        day_2 = next(bucket_iterator)
        self.assertEqual(day_2, [])

        day_3 = next(bucket_iterator)
        self.assertEqual(day_3, self.data_source[3:5])

    def test_month_iteration(self):
        start = build_date(2020, 1, 1)
        end = build_date(2020, 3, 1)
        bucket_iterator = BucketIterator(start, end, BucketUnit.MONTH, self.data_source)

        month_1 = next(bucket_iterator)
        self.assertEqual(month_1, self.data_source[0:6])

        month_2 = next(bucket_iterator)
        self.assertEqual(month_2, self.data_source[6:8])

        with self.assertRaises(StopIteration):
            next(bucket_iterator)
