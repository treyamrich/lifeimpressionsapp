import os
import json
import datetime
from queries import *
from clients.dynamodb_client import DynamoDBClient

script_dir = os.path.dirname(os.path.abspath(__file__))
migration_dir = os.path.dirname(script_dir)
data_dir = os.path.join(migration_dir, 'data')
    
def migrate_table_items(table_name: str, pk_field_name: str, items: list[dict]):
    current_datetime = datetime.datetime.now() \
        .strftime("%Y-%m-%d %H:%M:%S")

    client = DynamoDBClient()

    unprocessed_list = client.batch_execute_statement(table_name, pk_field_name, items)
    if not unprocessed_list: return
    
    error_path = os.path.join(data_dir, f'unprocessed_items_{current_datetime}.json')
    with open(error_path, 'w') as f:
        f.write(json.dumps(unprocessed_list, indent=4))
