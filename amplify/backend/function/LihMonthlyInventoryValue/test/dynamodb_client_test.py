import unittest
from unittest.mock import MagicMock
import sys
import os

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import Main, DynamoDBClient
sys.path.pop(0)


class TestDynamoDBClient(unittest.TestCase):
    
    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.mock_dynamodb_client = MagicMock()
        self.main = Main(self.mock_graphql_client, self.mock_dynamodb_client)

    def test_to_attribute_val(self):
        item = {
            'w': {
                'a': 2,
                'b': None,
                'c': 22.1,
                'd': True,
                'e': False
            },
            'x': 1,
            'y': [2, 'a'],
            'z': 2.1,
        }
        expected = {
            'w': { 'M': {
                'a': { 'N': '2' },
                'c': { 'N': '22.1' },
                'd': { 'BOOL': True },
                'e': { 'BOOL': False}
            }},
            'x': { 'N': '1' },
            'y': { 'L': [{ 'N': '2' }, { 'S': 'a' }] },
            'z': { 'N': '2.1' }
        }
        actual = DynamoDBClient._to_attribute_val(item)
        self.assertEqual(actual, expected)
    
    def test_write_to_db(self):
        pass
    
    def test_batch_write_to_db(self):
        pass


if __name__ == '__main__':
    unittest.main()
