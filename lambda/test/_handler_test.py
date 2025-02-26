import json
import os
import sys
import unittest

from _event_builder import build_event


sys.path.insert(0, os.path.abspath(".."))
from src.index import handler
sys.path.pop(0)

class TestLambdaHandler(unittest.TestCase):

    def setUp(self):
        pass

    def test_get_item_value(self):
        item_id = '25afff97-2297-42be-ab65-1eff3c099a25'
        res = self._call_get_item_value(
            item_id, 
            '2023-01-01', 
            '2025-03-01', 
            'MONTH'
        )
        # body = json.loads(res['body'])
        # print(json.dumps(body, indent=4))

    # def test_post_inventory_value_report(self):
    #     res = self._call_post_inventory_value_report()
    #     print(res)

    def _call_get_item_value(self, item_id: str, start_date: str, end_date: str, step_size: str):
        event = build_event(
            method='GET',
            path=f'/inventory/value/{item_id}',
            query_params={
                "startInclusive": start_date, 
                "endExclusive": end_date,
                "stepSize": step_size
            },
            body='{}',
            headers={'User-Agent': 'Mozilla/5.0'},
        )
        return handler(event, None)
    
    def _call_post_inventory_value_report(self):
        event = build_event(
            method='POST',
            path='/async/inventory/value',
            query_params={},
            body='{}',
            headers={'User-Agent': 'Mozilla/5.0'},
        )
        return handler(event, None)

    