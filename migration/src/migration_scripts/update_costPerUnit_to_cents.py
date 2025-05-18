from enum import Enum
import os
from clients.dynamodb_client import DynamoDBClient, DynamoDBPaginationIterator
from migration_helper import batch_execute_partiql, get_full_table_name
import pandas as pd
from queries import *

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

def list_tshirtorder_iterator(table_name: str):
    return DynamoDBPaginationIterator(
        DynamoDBClient(), 
        table_name,
        ["*"],
    )

def validate_migration(it: DynamoDBPaginationIterator):
    for x in it:
        if x['costPerUnit'] != x['costPerUnitCents'] / 100:
            raise Exception(f"costPerUnit mismatch: {x['id']}")
        
        
def run():
    TSHIRT_ORDER_TABLE_NAME = os.environ['TSHIRT_ORDER_TABLE_NAME']
    full_table_name = get_full_table_name(TSHIRT_ORDER_TABLE_NAME)
    get_it = lambda: list_tshirtorder_iterator(full_table_name)

    tshirt_orders = get_it()

    def process_item(item: dict):
        new_item = {
            'id': item['id'],
            'costPerUnitCents': int(item['costPerUnit'] * 100),
        }
        return (DynamoDBClient.DBOperation.UPDATE, new_item)
    
    update_items = list(map(process_item, tshirt_orders))

    batch_execute_partiql(full_table_name, "id", update_items)
    
    validate_migration(get_it())