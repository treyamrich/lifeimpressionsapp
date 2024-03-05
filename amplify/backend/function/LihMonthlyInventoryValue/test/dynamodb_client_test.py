import unittest
from unittest.mock import MagicMock
import sys
import os

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import DynamoDBClient
sys.path.pop(0)


class TestDynamoDBClient(unittest.TestCase):
    
    def setUp(self):
        self.mock_boto3_dynamo_db_client = MagicMock()
        self.dynamodb_client = DynamoDBClient(self.mock_boto3_dynamo_db_client)
        
    def _get_put_request(self, table_name: str, item: dict):
        return {table_name: {'PutRequest': {'Item': item}}}
    
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
    
    def test_batch_write_to_db(self):
        table_name = 'asdf'
        items = [
            {'2': 2} for _ in range(50)
        ]
        expected_unprocessed = self._get_put_request(table_name, DynamoDBClient._to_attribute_val({'test': 3}))
        self.mock_boto3_dynamo_db_client.batch_write_item.side_effect = [
            { 'UnprocessedItems': []},
            {'UnprocessedItems': [expected_unprocessed]}
        ]
        self.dynamodb_client.batch_write_item(table_name, items)
        call_count = self.mock_boto3_dynamo_db_client.batch_write_item.call_count
        self.assertEqual(call_count, 3)

        call_list = self.mock_boto3_dynamo_db_client.batch_write_item.call_args_list
        self.assertEqual(call_list[2][1]['RequestItems'][0], expected_unprocessed)
    
    def test_batch_write_to_db(self):
        table_name = 'asdf'
        items = [
            {'2': 2} for _ in range(50)
        ]
        expected_unprocessed = self._get_put_request(table_name, DynamoDBClient._to_attribute_val({'test': 3}))
        self.mock_boto3_dynamo_db_client.batch_write_item.side_effect = [
            {'UnprocessedItems': [expected_unprocessed]}
            for _ in range(7)
        ]
        self.dynamodb_client.batch_write_item(table_name, items)
        call_count = self.mock_boto3_dynamo_db_client.batch_write_item.call_count
        self.assertEqual(call_count, 7)
        
        call_list = self.mock_boto3_dynamo_db_client.batch_write_item.call_args_list
        for call in call_list:
            n = len(call[1]['RequestItems'])
            self.assertLessEqual(n, 25, msg="Batch size was not <= 25")

if __name__ == '__main__':
    unittest.main()
