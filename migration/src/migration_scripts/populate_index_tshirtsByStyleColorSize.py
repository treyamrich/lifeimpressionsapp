# This script populates the newly added index field tshirtsByStyleColorSize in the TShirt table
# The index was added manually in DynamoDB and doesn't show in the GraphQL schema
from enum import Enum
import os
from clients.dynamodb_client import DynamoDBClient, DynamoDBPaginationIterator
from migration_helper import batch_execute_partiql, get_full_table_name
from queries import *

inventory_index_value = 'InventoryChange'

class TShirtFields(Enum):
    ID = 'id'
    INDEX_FIELD = 'tshirtsByStyleColorSize'
    STYLE_NUMBER = 'styleNumber'
    COLOR = 'color'
    SIZE = 'size'

def list_tshirts_iterator(table_name: str):
    return DynamoDBPaginationIterator(
        DynamoDBClient(), 
        table_name,
        ["*"],
    )
    
def compute_index_field(t: dict):
    return "|".join([
        t[TShirtFields.STYLE_NUMBER.value],
        t[TShirtFields.COLOR.value],
        t[TShirtFields.SIZE.value]
    ])

def validate_migration(table_name: str):
    it = list_tshirts_iterator(table_name)
    if any(
        x[TShirtFields.INDEX_FIELD.value] != compute_index_field(x)
        for x in it
    ):
        raise Exception('Migration validation failure')
    
def run():
    TSHIRT_TABLE_NAME = os.environ['TSHIRT_TABLE_NAME']
    full_table_name = get_full_table_name(TSHIRT_TABLE_NAME)

    tshirts = list_tshirts_iterator(full_table_name)
    
    def process_item(item: dict):
        new_item = {
            TShirtFields.ID.value: item[TShirtFields.ID.value],
            TShirtFields.INDEX_FIELD.value: compute_index_field(item),
        }
        return (DynamoDBClient.DBOperation.UPDATE, new_item)
    
    update_items = list(map(process_item, tshirts))

    batch_execute_partiql(full_table_name, "id", update_items)
    
    validate_migration(full_table_name)