from datetime import datetime
import unittest
from unittest.mock import MagicMock
import mock_apis
import sys
import os

sys.path.insert(0, os.path.abspath(".."))
from src.index import InventoryItemValue, Main
sys.path.pop(0)


class TestListOrderItems(unittest.TestCase):
    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.main = Main(self.mock_graphql_client, MagicMock())
        self.start = datetime(1969, 1, 1)
        self.end = datetime(5000, 2, 1)

    def _get_its(self):
        return self.main._get_order_items_iterators(
            InventoryItemValue('some_id'),
            self.start,
            self.end
        )
    
    def test_list_order_items(self):
        co_resp = mock_apis.get_mock_CO_resp()
        po_resp = mock_apis.get_mock_PO_resp()
        self.mock_graphql_client.make_request.side_effect = [co_resp, po_resp]

        co_it, po_it = self._get_its()
        COs, POs = list(co_it), list(po_it)
        self.assertEqual(len(COs), len(co_resp['items']))
        self.assertEqual(len(POs), sum(map(lambda x: len(x['receivals']), po_resp['items'])))
        for i, co in enumerate(COs):
            next_co = COs[i+1] if i < len(COs)-1 else co
            self.assertTrue(co.iso_dt <= next_co.iso_dt)
        
        for i, po in enumerate(POs):
            next_po = POs[i+1] if i < len(POs)-1 else po
            self.assertTrue(po.iso_dt <= next_po.iso_dt)
        
        # TEST THAT THE FILTERS ARE CORRECT



    def test_empty_response(self):
        co_resp = mock_apis.get_mock_CO_resp(0)
        po_resp = mock_apis.get_mock_PO_resp(0)
        self.mock_graphql_client.make_request.side_effect = [co_resp, po_resp]

        co_it, po_it = self._get_its()
        COs, POs = list(co_it), list(po_it)
        self.assertEqual(len(COs), 0)
        self.assertEqual(len(POs), 0)

if __name__ == '__main__':
    unittest.main()
