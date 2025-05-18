from enum import Enum
import os
from clients.dynamodb_client import DynamoDBClient, DynamoDBPaginationIterator
from migration_helper import batch_execute_partiql, get_full_table_name
from decimal import Decimal, ROUND_HALF_UP
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
    mismatches = []
    for x in it:
        if x['costPerUnit'] != x['costPerUnitCents'] / 100:
            mismatches.append([x['id'], x['costPerUnit'], x['costPerUnitCents']])
    
    if len(mismatches) > 0:
        print(f"Found {len(mismatches)} mismatches:")
        for mismatch in mismatches:
            print(f"ID: {mismatch[0]}, costPerUnit: {mismatch[1]}, costPerUnitCents: {mismatch[2]}")
        raise Exception("Validation failed: costPerUnit and costPerUnitCents do not match.")
    
def validate_removal(it: DynamoDBPaginationIterator):
    for x in it:
        if 'costPerUnit' in x:
            print(f"ID: {x['id']}, costPerUnit: {x['costPerUnit']}")
            raise Exception("Validation failed: costPerUnit should be removed.")
        
def run():
    TSHIRT_ORDER_TABLE_NAME = os.environ['TSHIRT_ORDER_TABLE_NAME']
    full_table_name = get_full_table_name(TSHIRT_ORDER_TABLE_NAME)
    get_it = lambda: list_tshirtorder_iterator(full_table_name)

    tshirt_orders = get_it()

    # def process_item(item: dict):
    #     cost_per_unit = Decimal(item['costPerUnit'])
    #     cost_per_unit_cents = (cost_per_unit * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    #     new_item = {
    #         'id': item['id'],
    #         'costPerUnitCents': int(cost_per_unit_cents),
    #     }
    #     return (DynamoDBClient.DBOperation.UPDATE, new_item)
    
    def process_item(item: dict):
        new_item = {
            'id': item['id'],
            'costPerUnit': None,
        }
        return (DynamoDBClient.DBOperation.REMOVE_ATTRIBUTES, new_item)
    
    update_items = list(map(process_item, tshirt_orders))

    batch_execute_partiql(full_table_name, "id", update_items)
    
    # validate_migration(get_it())
    validate_removal(get_it())