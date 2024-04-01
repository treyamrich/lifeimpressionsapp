import os
from clients.dynamodb_client import DynamoDBClient, DynamoDBPaginationIterator
from migration_helper import batch_execute_partiql, get_full_table_name
from queries import *

MISPELLED_FIELD = 'recieval'
    
def validate_migration(it):
    print('Validating migration')
    if any(
        MISPELLED_FIELD in x and x[MISPELLED_FIELD] != None
        for x in it
    ):
        raise Exception('Migration validation failure')
    
def run():
    tshirt_order_table_name = get_full_table_name(os.environ['TSHIRT_ORDER_TABLE_NAME'])
    
    # TSHIRT_ORDER_CSV_PATH = os.environ['TSHIRT_ORDER_CSV_PATH']
    # tshirt_orders = tshirtorder_index_fix.read_tshirt_order_csv(TSHIRT_ORDER_CSV_PATH)
    
    client = DynamoDBClient()
    get_iter = lambda: DynamoDBPaginationIterator(
        client, 
        tshirt_order_table_name, 
        ['id']
    )
    def process_item(item):
        new_item = {
            'id': item['id'],
            MISPELLED_FIELD: None
        }
        return (DynamoDBClient.DBOperation.REMOVE_ATTRIBUTES, new_item)
    
    print('Migrating Table', tshirt_order_table_name)
    update_items = list(map(process_item, get_iter()))
    batch_execute_partiql(tshirt_order_table_name, 'id', update_items)
    
    validate_migration(get_iter())