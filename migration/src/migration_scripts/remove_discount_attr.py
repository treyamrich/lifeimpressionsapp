import os
from clients.dynamodb_client import DynamoDBClient, DynamoDBPaginationIterator
from migration_helper import batch_execute_partiql, get_full_table_name
from queries import *
from . import tshirtorder_index_fix

DISCOUNT_FIELD = 'discount'
    
def validate_migration(pagination_iterators: list):
    for table, it in pagination_iterators:
        print('Validating table', table)
        if any(
            DISCOUNT_FIELD in x and x[DISCOUNT_FIELD] != None
            for x in it
        ):
            raise Exception('Migration validation failure')
    
def run():
    purchase_order_table_name = get_full_table_name(os.environ['PURCHASE_ORDER_TABLE_NAME'])
    customer_order_table_name = get_full_table_name(os.environ['CUSTOMER_ORDER_TABLE_NAME'])
    tshirt_order_table_name = get_full_table_name(os.environ['TSHIRT_ORDER_TABLE_NAME'])
    table_names = [customer_order_table_name, purchase_order_table_name]
    
    # TSHIRT_ORDER_CSV_PATH = os.environ['TSHIRT_ORDER_CSV_PATH']
    # tshirt_orders = tshirtorder_index_fix.read_tshirt_order_csv(TSHIRT_ORDER_CSV_PATH)
    
    client = DynamoDBClient()
    
    get_iter = lambda table_name: DynamoDBPaginationIterator(
        client, 
        table_name, 
        ['id']
    )
    get_table_and_iters = lambda: [(table, get_iter(table)) for table in table_names]

    def process_item(item):
        new_item = {
            'id': item['id'],
            'discount': None
        }
        return (DynamoDBClient.DBOperation.REMOVE_ATTRIBUTES, new_item)
    
    for table, it in get_table_and_iters():
        print('DOING TABLE', table)
        update_items = list(map(process_item, it))
        batch_execute_partiql(table, 'id', update_items)
    
    validate_migration(get_table_and_iters())