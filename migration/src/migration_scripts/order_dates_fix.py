from datetime import datetime
from enum import Enum
from functools import partial
import os
from typing import Callable, List, Tuple
from clients.dynamodb_client import DynamoDBClient
from migration_helper import batch_execute_partiql, get_full_table_name
import pandas as pd
from queries import *
from clients.graphql_client import GraphQLClient
from date_util import get_time_in_tz, to_ISO8601


class OrderType(Enum):
    PurchaseOrder = 0
    CustomerOrder = 1

def read_order_csv(file) -> List[dict]:
    parse_cols = ['Order ID', 'Order Date']
    orders = pd.read_csv(file, usecols=parse_cols) \
        .to_dict(orient='records')
    return orders

def get_order(graphql_client: GraphQLClient, order_type: OrderType, id: str):
    is_PO = order_type == OrderType.PurchaseOrder
    q = getPurchaseOrderIDsOnly if is_PO else getCustomerOrderIDsOnly
    return graphql_client.make_request(q, { 'id': id })    

def format_date(dt_str: str):
    TZ_OFFSET = -10
    dt = datetime.strptime(dt_str, '%m/%d/%Y %H:%M')
    dt = to_ISO8601(get_time_in_tz(dt, TZ_OFFSET))
    return dt

def validate_migration(get_order: Callable[[str], None], correct_orders: List[dict]):

    def validate_dates(x: dict, expected_date: str):
        for key in ['createdAt', 'updatedAt']:
            if x[key] != expected_date:
                raise Exception(f'Migration Failure: Date didn\'t match {x[key]}')
            
    for order in correct_orders:
        id = order['Order ID']
        expected_date = order['Order Date']
        curr_order = get_order(id)
        validate_dates(curr_order, expected_date)
        for order_item in curr_order['orderedItems']['items']:
            validate_dates(order_item, expected_date)

def run():
    global get_order
    graphql_client = GraphQLClient()
    order_type = OrderType.CustomerOrder
    is_PO = order_type == OrderType.PurchaseOrder
    get_order = partial(get_order, graphql_client, order_type)
    
    table_name = os.environ['PURCHASE_ORDER_TABLE_NAME'] \
        if is_PO else os.environ['CUSTOMER_ORDER_TABLE_NAME']
    tshirt_order_table_name = get_full_table_name(os.environ['TSHIRT_ORDER_TABLE_NAME'])
    order_table_name = get_full_table_name(table_name) 
    
    PO_CSV = 'data/LIH-HighLevelReport-Mar 9, 2024 2_02 PM.csv'
    CO_CSV = 'data/LIH-HighLevelReport-Mar 20, 2024 10_44 AM.csv'
    csv_name = PO_CSV if is_PO else CO_CSV

    corrected_orders = read_order_csv(csv_name)
    corrected_orders = [{**x, 'Order Date': format_date(x['Order Date']) } 
                        for x in corrected_orders]
    corrected_orders_map = {x['Order ID']: x for x in corrected_orders}

    def process_id(order_id: dict) -> Tuple[dict, List[dict]]:
        correct_order = corrected_orders_map[order_id]
        new_date_time = correct_order['Order Date']
        tshirt_orders = get_order(order_id)['orderedItems']['items']
        to_update_input = lambda id: (DynamoDBClient.DBOperation.UPDATE, {
            'id': id,
            'createdAt': new_date_time,
            'updatedAt': new_date_time
        })
        update_order_input = to_update_input(order_id)
        update_tshirt_orders_inputs = [
            to_update_input(tshirt_order['id']) 
            for tshirt_order in tshirt_orders
        ]

        return update_order_input, update_tshirt_orders_inputs

    update_orders, update_order_items = [], []
    for id in corrected_orders_map:
        input = process_id(id)
        update_orders.append(input[0])
        update_order_items.extend(input[1])

    print('Updating orders')
    batch_execute_partiql(order_table_name, "id", update_orders)
    print('Updating TShirt Orders')
    batch_execute_partiql(tshirt_order_table_name, "id", update_order_items)
    print('Validating Migration')
    validate_migration(get_order, corrected_orders)