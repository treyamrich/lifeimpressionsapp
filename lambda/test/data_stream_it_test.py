from datetime import datetime
import unittest
import sys
import os
from unittest.mock import MagicMock
import mock_apis

sys.path.insert(0, os.path.abspath(".."))
from src.index import TZ_UTC_HOUR_OFFSET, DataStreamBuilder, MyDateTime, QueueItem, DataStream

sys.path.pop(0)


# Tests integration between the PaginationIterator and DataStream classes
class TestDataStreamIntegration(unittest.TestCase):

    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.start = MyDateTime.get_time_in_tz(datetime(1970, 1, 1, hour=12), TZ_UTC_HOUR_OFFSET)
        self.end = MyDateTime.get_time_in_tz(datetime(2000, 2, 1), TZ_UTC_HOUR_OFFSET)

    def _get_data_streams(self):
        builder = DataStreamBuilder('some_item_id', self.mock_graphql_client)
        po_stream = builder \
            .set_start_incl(self.start) \
            .set_end_excl(self.end) \
            .set_type_PO() \
            .build()
        co_stream = builder \
            .set_type_CO() \
            .build()
        return co_stream, po_stream
    
    def test_streaming_order_items(self):
        co_resp = mock_apis.get_rand_mock_CO_resp(self.start, self.end, 10)
        po_resp = mock_apis.get_rand_mock_PO_resp(self.start, self.end, 10)
        self.mock_graphql_client.make_request.side_effect = [po_resp, co_resp]

        co_stream, po_stream = self._get_data_streams()
        COs, POs = co_stream.read_until(self.end), po_stream.read_until(self.end)
        self.assertEqual(len(COs), len(co_resp['items']))
        self.assertEqual(len(POs), sum(map(lambda x: len(x['receivals']), po_resp['items'])))
        for i, co in enumerate(COs):
            next_co = COs[i+1] if i < len(COs)-1 else co
            self.assertTrue(co.date <= next_co.date)
        
        for i, po in enumerate(POs):
            next_po = POs[i+1] if i < len(POs)-1 else po
            self.assertTrue(po.date <= next_po.date)

    def test_empty_response(self):
        co_resp = mock_apis.get_rand_mock_CO_resp(self.start, self.end, 0)
        po_resp = mock_apis.get_rand_mock_PO_resp(self.start, self.end, 0)
        self.mock_graphql_client.make_request.side_effect = [po_resp, co_resp]

        co_stream, po_stream = self._get_data_streams()
        COs, POs = co_stream.read_until(self.end), po_stream.read_until(self.end)
        self.assertEqual(len(COs), 0)
        self.assertEqual(len(POs), 0)


if __name__ == '__main__':
    unittest.main()