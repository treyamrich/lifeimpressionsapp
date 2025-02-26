from datetime import datetime
import unittest
import sys
import os
from unittest.mock import MagicMock
import mock_apis

sys.path.insert(0, os.path.abspath(".."))
from src.index import InventoryItemValue, PaginationIterator, Query, QueryPaginator

sys.path.pop(0)

class TestPagination(unittest.TestCase):

    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.mock_graphql_client.make_request = MagicMock()
        self.num_pages = 10
        self.data = [
            InventoryItemValue(str(i)) for i in range(1, 51)
        ]
        self.query = Query("some_name", "some_query")
        self.vars = {"some_var": "some_val"}

    
    def test_pagination_iterator(self):
        self._set_mock_api_resp()
        it = self._build_pagination_iterator()

        self.assertEqual(self.mock_graphql_client.make_request.call_count, self.num_pages)
        for i, item in enumerate(it):
            self.assertEqual(item["itemId"], self.data[i].itemId)

        self.mock_graphql_client.make_request.return_value = {"items": [], "nextToken": "x"}
        it = self._build_pagination_iterator()
        # self.
        this is WIP

    def test_query_paginator(self):
        pass

    def _set_mock_api_resp(self):
        mock_pagination = mock_apis.MockPagination(
            self.data, 
            self.num_pages, 
        )
        self.mock_graphql_client.make_request.side_effect = iter(mock_pagination)

    def _build_pagination_iterator(self):
        return PaginationIterator(
            self.mock_graphql_client, 
            self.query,
            self.vars,
        )

        

if __name__ == '__main__':
    unittest.main()