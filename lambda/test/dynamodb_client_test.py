from decimal import Decimal
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
        self.table_name = 'asdf'
        self.dynamodb_client = DynamoDBClient(self.mock_boto3_dynamo_db_client) \
            .set_table_name(self.table_name)
        self.pk_field_name = 'id'
        
    def _get_put_request(self, item: dict):
        return {self.table_name: {'PutRequest': {'Item': item}}}
    
    def test_to_attribute_val(self):
        item = {
            'w': {
                'a': 2,
                'b': None,
                'c': Decimal('22.1'),
                'd': True,
                'e': False
            },
            'x': 1,
            'y': [2, 'a'],
            'z': Decimal('2.1')
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
    
    def test_put_req(self):
        item = DynamoDBClient._to_attribute_val({'test': 3})
        self.dynamodb_client.put_item(item)
        self.mock_boto3_dynamo_db_client.put_item.assert_called_once()
        
    def test_batch_write_to_db(self):
        items = [
            {'2': 2} for _ in range(50)
        ]
        expected_unprocessed = self._get_put_request(DynamoDBClient._to_attribute_val({'test': 3}))
        self.mock_boto3_dynamo_db_client.batch_write_item.side_effect = [
            { 'UnprocessedItems': []},
            {'UnprocessedItems': [expected_unprocessed]},
            { 'UnprocessedItems': []},
        ]
        self.dynamodb_client.batch_write_item(items)
        call_count = self.mock_boto3_dynamo_db_client.batch_write_item.call_count
        self.assertEqual(call_count, 3)

        call_list = self.mock_boto3_dynamo_db_client.batch_write_item.call_args_list
        _, kwargs = call_list[2]
        self.assertEqual(kwargs['RequestItems'][0], expected_unprocessed)
    
    def test_batch_write_to_db_more(self):
        items = [
            {'2': 2} for _ in range(50)
        ]
        expected_unprocessed = self._get_put_request(DynamoDBClient._to_attribute_val({'test': 3}))
        self.mock_boto3_dynamo_db_client.batch_write_item.side_effect = [
            {'UnprocessedItems': [expected_unprocessed]}
            for _ in range(7)
        ]
        self.dynamodb_client.batch_write_item(items)
        call_count = self.mock_boto3_dynamo_db_client.batch_write_item.call_count
        self.assertEqual(call_count, 7)
        
        call_list = self.mock_boto3_dynamo_db_client.batch_write_item.call_args_list
        for _, kwargs in call_list:
            n = len(kwargs['RequestItems'])
            self.assertLessEqual(n, 25, msg="Batch size was not <= 25")
            
    def test_to_update_partiql(self):
        item = {
            'id': 1,
            'isDeleted': False,
            'test_lit': ['ASDF'],
            'test_obj': {
                'a': 'b'
            }
        }
        expected_statement = "\n".join(
            x.strip() for x in 
        f"""
            UPDATE "{self.table_name}"
            SET isDeleted = ?
            SET test_lit = ?
            SET test_obj = ?
            WHERE {self.pk_field_name} = ?
        """.split('\n')).strip()

        expected_params = (
            { 'BOOL': False },
            { 'L': [ { 'S': 'ASDF' } ]},
            { 'M': { 'a': { 'S': 'b'} }},
            { 'N': '1'}
        )
        
        statement, params = self.dynamodb_client._to_update_partiql(self.pk_field_name, item)
        self.assertEqual(expected_statement, statement)
        self.assertEqual(expected_params, params)
        
    def test_retry_batch_execute_statement(self):
        items = [
            (DynamoDBClient.DBOperation.UPDATE, {'id': 123, 'a': '2'}, )
            for _ in range(50)
        ]
        self.mock_boto3_dynamo_db_client.batch_execute_statement.side_effect = [
            {'Responses': [{'Error': { 'Code': 'ConditionalCheckFailed'}}]}
            for _ in range(7)
        ]
        self.dynamodb_client.batch_execute_statement(self.pk_field_name, items)
        
        call_count = self.mock_boto3_dynamo_db_client.batch_execute_statement.call_count
        self.assertEqual(call_count, 7)
        
        call_list = self.mock_boto3_dynamo_db_client.batch_execute_statement.call_args_list
        for _, kwargs in call_list:
            n = len(kwargs['Statements'])
            self.assertLessEqual(n, 25, msg="Batch size was not <= 25")
        

if __name__ == '__main__':
    unittest.main()
