import os
import json
import datetime
from typing import Callable, List
from queries import *
from clients.dynamodb_client import DynamoDBClient

script_dir = os.path.dirname(os.path.abspath(__file__))
migration_dir = os.path.dirname(script_dir)
data_dir = os.path.join(migration_dir, 'data')
    
def batch_migrate_table_items(migration_fn: Callable):
    current_datetime = datetime.datetime.now() \
        .strftime("%Y-%m-%d %H:%M:%S")
    current_datetime_safe = current_datetime.replace(' ', '_').replace(':', '_')

    unprocessed_list = migration_fn()
    if not unprocessed_list: return
    
    error_path = os.path.join(data_dir, f'unprocessed_items_{current_datetime_safe}.json')
    with open(error_path, 'w') as f:
        f.write(json.dumps(unprocessed_list, indent=4))

def get_full_table_name(table_name: str):
    TABLE_SUFFIX = os.environ['TABLE_SUFFIX']
    return f'{table_name}{TABLE_SUFFIX}'

def batch_execute_partiql(table_name: str, pk_field_name: str, items: List[tuple[DynamoDBClient.DBOperation, dict]]):
    def f():
        client = DynamoDBClient()
        return client.batch_execute_statement(table_name, pk_field_name, items)
    batch_migrate_table_items(f)