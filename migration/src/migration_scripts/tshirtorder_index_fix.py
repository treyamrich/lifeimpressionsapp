from enum import Enum
import os
from clients.dynamodb_client import DynamoDBClient, DynamoDBPaginationIterator
from migration_helper import batch_execute_partiql, get_full_table_name
import pandas as pd
from queries import *
from clients.graphql_client import GraphQLClient, PaginationIterator

class TShirtOrderFields(Enum):
    TSHIRT_ID = 'tShirtOrderTshirtId'
    ID = 'id'
    INDEX_FIELD = 'indexField'
    PO_ID = 'purchaseOrderOrderedItemsId'
    CO_ID = 'customerOrderOrderedItemsId'


po_id = TShirtOrderFields.PO_ID.value
co_id = TShirtOrderFields.CO_ID.value
earliest_transaction = "earliestTransaction"
latest_transaction = "latestTransaction"

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

def list_tshirtorder_iterator(table_name: str):
    return DynamoDBPaginationIterator(
        DynamoDBClient(), 
        table_name,
        ["*"],
    )

def validate_migration(it: DynamoDBPaginationIterator):
    def raise_exec(item: dict, msg: str):
        print(item)
        raise Exception(msg)
    for x in it:
        idx_field = x.get('indexField', None)
        if not (idx_field.endswith('-PO') or idx_field.endswith('-CO')):
            raise_exec(x, "-PO or -CO not in indexField")
        if co_id in x and x[co_id] and x.get("receivals", None):
            raise_exec(x, "Receivals added to CO")
        if po_id in x and x[po_id] and x['amountReceived'] > 0 and len(x['receivals']) < 1:
            raise_exec(x, "PO does not have receivals")
        if not x.get(earliest_transaction, None):
            raise_exec(x, "Item does not have {} field".format(earliest_transaction))
        if not x.get(latest_transaction, None):
            raise_exec(x, "Item does not have {} field".format(latest_transaction))
        
def run():
    TSHIRT_ORDER_TABLE_NAME = os.environ['TSHIRT_ORDER_TABLE_NAME']
    TSHIRT_ORDER_CSV_PATH = os.environ['TSHIRT_ORDER_CSV_PATH']
    full_table_name = get_full_table_name(TSHIRT_ORDER_TABLE_NAME)
    get_it = lambda: list_tshirtorder_iterator(full_table_name)

    # tshirt_orders = read_tshirt_order_csv(TSHIRT_ORDER_CSV_PATH)
    tshirt_orders = get_it()

    def process_item(item: dict):
        if item.get(po_id, None):
            suffix = "-PO"
            if item['amountReceived'] > 0:
                receivals = { 'receivals': [{
                    '__typename': 'POReceival',
                    'timestamp': item['createdAt'],
                    'quantity': item['amountReceived']
                }]}
            else:
                receivals = {}
        elif item.get(co_id, None):
            suffix = "-CO"
            receivals = {}
        new_item = {
            'id': item['id'],
            'indexField': f'{item[TShirtOrderFields.TSHIRT_ID.value]}{suffix}',
            earliest_transaction: item['createdAt'],
            latest_transaction: item['createdAt'],
            **receivals
        }
        return (DynamoDBClient.DBOperation.UPDATE, new_item)
    
    update_items = list(map(process_item, tshirt_orders))

    batch_execute_partiql(full_table_name, "id", update_items)
    
    validate_migration(get_it())