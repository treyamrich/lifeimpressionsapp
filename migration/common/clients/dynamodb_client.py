from enum import Enum
import logging
from typing import Callable, List
import boto3

class DynamoDBClient:
    """
        Make sure the client credentials are set at ~/.aws/config for the
        AWS_ACCESS_KEY_ID AND AWS_SECRET_ACCESS_KEY variables
    """
    
    class DBOperation(Enum):
        NONE = 0
        INSERT = 1
        UPDATE = 2
        REMOVE_ATTRIBUTES = 3
    
    def __init__(self, client = None):
        
        self.client = boto3.client(
            'dynamodb',
            region_name='us-west-2'
        ) if not client else client
        
    @staticmethod
    def _to_attribute_val(x: dict):
        return DynamoDBClient._rec_to_attribute_val(x)['M']
    
    @staticmethod
    def _attr_to_attribute_val(attr):
        return DynamoDBClient._rec_to_attribute_val(attr)
    
    @staticmethod
    def _rec_to_attribute_val(x):
        if x == None:
            return { 'NULL': True }
        elif type(x) == dict:
            res = {}
            for k, v in x.items():
                attr_val = DynamoDBClient._rec_to_attribute_val(v)
                res[k] = attr_val
            return {'M': res}
        elif type(x) == list:
            res = []
            for i in x:
                attr_val = DynamoDBClient._rec_to_attribute_val(i)
                res.append(attr_val)
            return {'L': res}
        elif type(x) == int or type(x) == float:
            return {'N': str(x)}
        elif type(x) == str:
            return {'S': str(x)}
        elif type(x) == bool:
            return {'BOOL': x}
        raise Exception(f"New type '{type(x)}' with no conversion to DynamoDB AttributeValue")
                     
    @staticmethod
    def _to_update_partiql(table_name: str, pk_field_name: str, item: dict):
        table_operation = f'UPDATE "{table_name}"'
        pk_where_clause = f'WHERE {pk_field_name} = ?'
        set_statements, params = list(zip(*[
            (f"SET {k} = ?", DynamoDBClient._attr_to_attribute_val(v))
            for k, v in item.items()
            if k != pk_field_name and v != None
        ]))
        statement = "\n".join([table_operation, *set_statements, pk_where_clause])
        params = (*params, DynamoDBClient._attr_to_attribute_val(item[pk_field_name]))
        return statement, params
    
    @staticmethod
    def _to_remove_attr_partiql(table_name: str, pk_field_name: str, item: dict):
        table_operation = f'UPDATE "{table_name}"'
        pk_where_clause = f'WHERE {pk_field_name} = ?'
        remove_statements = [f'REMOVE {x}' for x in item.keys() if x != pk_field_name]
        statement = "\n".join([table_operation, *remove_statements, pk_where_clause])
        return statement, [DynamoDBClient._attr_to_attribute_val(item[pk_field_name])]
    
    @staticmethod
    def _batch_operation(
        batch_transformer: Callable[[List], List], 
        batch_processor: Callable[[List], List], 
        items: List[dict]
    ):
        def partition_arr(items: list, size=25):
            res = []
            i = 0
            while len(items[i: i + size]):
                res.append(items[i: i + size])
                i += size
            return res
        
        batches = [batch_transformer(partition) for partition in partition_arr(items)]
        max_attempts = 6
        for i in range(max_attempts):
            if i > 0:
                logging.info(f'Unproccessed items: retry attempt {i}/{max_attempts-1}')
            
            unprocessed_items = []
            for batch in batches:
                try:
                    retry_items = batch_processor(batch)
                    unprocessed_items.extend(retry_items)
                except Exception as e:
                    logging.exception(e)
                
            if not len(unprocessed_items): return
            batches = partition_arr(unprocessed_items)
        
        return unprocessed_items
    
    def put_item(self, table_name: str, item: dict):
        self.client.put_item(
            TableName=table_name,
            Item=DynamoDBClient._to_attribute_val(item)
        )
    
    def batch_write_item(self, table_name: str, items: List[dict]) -> list:
        
        to_put_req_item = lambda x: {'PutRequest': { 'Item': DynamoDBClient._to_attribute_val(x) }}
        batch_transformer = lambda batch: { table_name: [to_put_req_item(x) for x in batch] }
        
        def batch_processor(request_item_batch: list):
            response = self.client.batch_write_item(RequestItems=request_item_batch)
            unprocessed_items = response['UnprocessedItems']
            return unprocessed_items
        
        return DynamoDBClient._batch_operation(
            batch_transformer,
            batch_processor,
            items
        )
    
    @staticmethod
    def get_partiql_by_op(table_name: str, pk_field_name: str, op: DBOperation, item: dict):
        params = (table_name, pk_field_name, item)
        if op == DynamoDBClient.DBOperation.UPDATE:
            return DynamoDBClient._to_update_partiql(*params)
        if op == DynamoDBClient.DBOperation.REMOVE_ATTRIBUTES:
            return DynamoDBClient._to_remove_attr_partiql(*params)
        raise NotImplementedError
            
    def batch_execute_statement(self, table_name: str, pk_field_name: str, items: List[tuple[DBOperation, dict]]):
        
        def batch_transformer(batch: List[tuple[DynamoDBClient.DBOperation, dict]]):
            to_statement = lambda statement, params: {
                'Statement': statement,
                'Parameters': params,
            }
            return [
                to_statement(*self.get_partiql_by_op(table_name, pk_field_name, op, item))
                for op, item in batch   
            ]
        
        def batch_processor(param_statements: list):
            response = self.client.batch_execute_statement(Statements=param_statements)
            unprocessed_items = [
                param_statements[i] 
                for i, r in enumerate(response['Responses']) 
                if 'Error' in r
            ]
            if unprocessed_items:
                logging.error(f'Error executing batch statements for these items: {unprocessed_items}')
            return unprocessed_items
        
        return DynamoDBClient._batch_operation(
            batch_transformer,
            batch_processor,
            items
        )
        
    def execute_statement(self, statement, parameters=None, next_token=None, limit=None):
        params = {'Statement': statement}
        def add_if_not_none(k, v):
            if v:
                params[k] = v
        add_if_not_none('Parameters', parameters)
        add_if_not_none('NextToken', next_token)
        add_if_not_none('Limit', limit)
        return self.client.execute_statement(**params)
        
        
class DynamoDBPaginationIterator:
    def __init__(
        self, 
        dynamodb_client: DynamoDBClient, 
        table_name: str, 
        cols: List[str],
        statement_parameters: List[dict] = None,
        query_where_clause: str = None
    ):
        self._dynamodb_client = dynamodb_client
        self.table_name = table_name
        self._statement_parameters = statement_parameters
        self._statement = "\n".join([
            f'SELECT {", ".join(cols)}',
            f'FROM "{table_name}"',
            *([query_where_clause] if query_where_clause else []),
        ])
        self._page = []
        self._next_token = None
        self._idx = 0

    def __iter__(self):
        self._get_next_page()
        return self

    def __next__(self):
        if not self._page:
            raise StopIteration
        
        at_end_of_page = self._idx == len(self._page)
        at_last_page = self._next_token == None

        if at_end_of_page and at_last_page:
            raise StopIteration

        if at_end_of_page:
            self._get_next_page()

        item = self._page[self._idx]
        self._idx += 1
        return item

    def _get_next_page(self):
        resp = self._dynamodb_client.execute_statement(self._statement, self._statement_parameters, limit=100, next_token=self._next_token)
        self._page, self._next_token = [self._from_attr_vals(x) for x in resp["Items"]], resp.get("NextToken", None)
        self._idx = 0
        
    @staticmethod
    def _from_attr_vals(item: dict):
        def cast_non_iterable(v, T):
            if T == 'NULL':
                return None
            if T == 'S':
                return v
            if T == 'N':
                return float(v) if '.' in v else int(v)
            if T == 'BOOL':
                return v
            raise NotImplementedError
        
        def rec(v):
            if 'L' in v and len(v) == 1: # {'L': []}
                return [rec(i) for i in v['L']]
            if 'M' in v and len(v) == 1: # {'M': {}}
                return { key: rec(val) for key, val in v['M'].items()}
            
            T, v = list(v.items())[0]
            return cast_non_iterable(v, T)
        
        return {k: rec(v) for k, v in item.items()}