from enum import Enum
import os
from clients.dynamodb_client import DynamoDBClient
from migration_helper import batch_execute_partiql, get_full_table_name
from queries import *
from clients.graphql_client import GraphQLClient, PaginationIterator

inventory_index_value = 'InventoryChange'

class OrderChangeFields(Enum):
    ID = 'id'
    INDEX_FIELD = 'indexField'
    CO_ID = 'customerOrderChangeHistoryId'
    PO_ID = 'purchaseOrderChangeHistoryId'

def list_order_change_iterator():
    return PaginationIterator(
        GraphQLClient(), 
        listOrderChanges,
        {
        'filter': { 
            OrderChangeFields.PO_ID.value: {'attributeExists': False},
            OrderChangeFields.CO_ID.value: {'attributeExists': False}
        }
    })

def validate_migration():
    it = list_order_change_iterator()
    if any(
        x[OrderChangeFields.INDEX_FIELD.value] != inventory_index_value
        for x in it
    ):
        raise Exception('Migration validation failure')
    
def run():
    ORDER_CHANGE_TABLE_NAME = os.environ['ORDER_CHANGE_TABLE_NAME']
    full_table_name = get_full_table_name(ORDER_CHANGE_TABLE_NAME)

    order_changes = list_order_change_iterator()
    
    def process_item(item: dict):
        new_item = {
            'id': item['id'],
            'indexField': inventory_index_value
        }
        return (DynamoDBClient.DBOperation.UPDATE, new_item)
    
    update_items = list(map(process_item, order_changes))

    batch_execute_partiql(full_table_name, "id", update_items)
    
    validate_migration()