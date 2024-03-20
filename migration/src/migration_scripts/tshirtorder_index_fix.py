from enum import Enum
import os
from clients.dynamodb_client import DynamoDBClient
from migration_helper import batch_execute_partiql, get_full_table_name
import pandas as pd
from queries import *
from clients.graphql_client import GraphQLClient, PaginationIterator

class TShirtOrderFields(Enum):
    TSHIRT_ID = 'tShirtOrderTshirtId'
    ID = 'id'
    INDEX_FIELD = 'indexField'
    

def read_tshirt_order_csv(file):
    d_types = {
        'id': str,
        '__typename': str,
        'amountReceived': int,
        'costPerUnit': float,
        'createdAt': str,
        'discount': float,
        'quantity': str,
        TShirtOrderFields.TSHIRT_ID.value: str,
        'updatedAt': str
    }
    def optional_str_convertor(x): return x if x != '' else None
    converters = {
        'isDeleted': lambda x: True if x == 'TRUE' else None,
        'customerOrderOrderedItemsId': optional_str_convertor,
        'purchaseOrderOrderedItemsId': optional_str_convertor
    }
    tshirt_orders = pd.read_csv(file, dtype=d_types, converters=converters) \
        .to_dict(orient='records')

    return tshirt_orders

def list_tshirtorder_iterator():
    return PaginationIterator(
        GraphQLClient(), 
        listTShirtOrders,
        {}
    )

def validate_migration():
    it = list_tshirtorder_iterator()
    if any(
        x[TShirtOrderFields.INDEX_FIELD.value] != x[TShirtOrderFields.TSHIRT_ID.value] or
        x[TShirtOrderFields.INDEX_FIELD.value] == None
        for x in it
    ):
        raise Exception('Migration validation failure')
    
def run():
    TSHIRT_ORDER_TABLE_NAME = os.environ['TSHIRT_ORDER_TABLE_NAME']
    TSHIRT_ORDER_CSV_PATH = os.environ['TSHIRT_ORDER_CSV_PATH']
    full_table_name = get_full_table_name(TSHIRT_ORDER_TABLE_NAME)

    # tshirt_orders = read_tshirt_order_csv(TSHIRT_ORDER_CSV_PATH)
    tshirt_orders = list_tshirtorder_iterator()
    
    def process_item(item: dict):
        new_item = {
            'id': item['id'],
            'indexField': item[TShirtOrderFields.TSHIRT_ID.value]
        }
        return (DynamoDBClient.DBOperation.UPDATE, new_item)
    
    update_items = list(map(process_item, tshirt_orders))

    batch_execute_partiql(full_table_name, "id", update_items)
    
    validate_migration()