import unittest
from unittest.mock import MagicMock
import mock_apis
from mock_apis import OrderType
import sys
import os

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import Main, InventoryItemValue, MyDateTime
sys.path.pop(0)


class TestUnsoldItemsValue(unittest.TestCase):
    
    def setUp(self):
        self.end_exclusive = MyDateTime.get_now_UTC()
        self.start_inclusive = self.end_exclusive
        self.end_exclusive_str = MyDateTime.to_ISO8601(self.end_exclusive)
        self.mock_graphql_client = MagicMock()
        self.main = Main(self.mock_graphql_client, MagicMock())
        self.initial_item_value = 10
        
        v = InventoryItemValue('some_id', poQueueHeadQtyRemain=2)
        v.aggregateValue = self.initial_item_value
        self.initial_cache_val = v


    def _call_get_unsold_items_value(self, data: list) -> InventoryItemValue:
        mock = MagicMock()
        mock.return_value = mock_apis.mock_get_order_item_iterators(data)
        self.main._get_order_items_iterators = mock
        inv_item_val = self.main._get_unsold_items_value(self.initial_cache_val, self.start_inclusive, self.end_exclusive)
        return inv_item_val
    
    def _transform_data(self, data: list):
        return map(lambda x: {
            'order_type': x[0], 
            'qty': x[1], 
            'cost_per_unit': x[2],
            'timestamp': x[3]
        }, data)
        
    def test_general_case(self):
        expected_po_head = 'PO_HEAD'
        data = self._transform_data([
            (OrderType.CustomerOrder, 10, 0, ''), # i = 0; Expect 0
            (OrderType.PurchaseOrder, 3, 5.12, ''), # i = 1; Expect 0; PO Queue Head Remaining = 2
            (OrderType.CustomerOrder, 5, 0, ''), # i = 2; Expect 0
            (OrderType.PurchaseOrder, 25, 20.12, expected_po_head), # i = 3; Expect $(12 x 20.12) = $241.44
            (OrderType.CustomerOrder, 5, 0, ''), # i = 4; Expect $(7 x 20.12) = $140.84
        ])
        expected = InventoryItemValue(
            itemId = self.initial_cache_val.itemId,
            aggregateValue = 140.84 + self.initial_cache_val.aggregateValue,
            numUnsold = 7,
            poQueueHead = expected_po_head,
            coQueueHead = self.end_exclusive_str,
            coQueueHeadQtyRemain = 0,
            poQueueHeadQtyRemain = 7
        )
        unsold_value = self._call_get_unsold_items_value(data)
        self.assertEqual(expected, unsold_value)

    def test_empty_case(self):        
        expected = InventoryItemValue(
            itemId = self.initial_cache_val.itemId,
            aggregateValue = self.initial_cache_val.aggregateValue,
            numUnsold = 0,
            poQueueHead = self.end_exclusive_str,
            coQueueHead = self.end_exclusive_str,
            coQueueHeadQtyRemain = 0,
            poQueueHeadQtyRemain = 0
        )
        unsold_val = self._call_get_unsold_items_value([])
        self.assertEqual(unsold_val, expected)

    def test_over_sold_item(self):
        expected_co_head = 'CO_HEAD'
        data = self._transform_data([
            (OrderType.PurchaseOrder, 10, 22, ''), # PO Queue Head Remaining = 2
            (OrderType.CustomerOrder, 3, 33, expected_co_head),
            (OrderType.CustomerOrder, 5, 4, ''),
            (OrderType.CustomerOrder, 5, 5, ''),
            (OrderType.CustomerOrder, 5, 1, ''),
        ])
        expected = InventoryItemValue(
            itemId = self.initial_cache_val.itemId,
            aggregateValue = self.initial_cache_val.aggregateValue,
            numUnsold = -16,
            poQueueHead = self.end_exclusive_str,
            coQueueHead = expected_co_head,
            coQueueHeadQtyRemain = 1,
            poQueueHeadQtyRemain = 0
        )
        unsold_value = self._call_get_unsold_items_value(data)
        self.assertEqual(expected, unsold_value)

    def test_any_adjustments(self):
        expected_po_head = 'PO_HEAD'
        data = self._transform_data([
            (OrderType.CustomerOrder, 3, 0, ''),  # i = 0; Sold 3; Expect: $0
            (OrderType.CustomerOrder, 3, 0, ''),  # i = 1; Sold 3; Expect: $0
            (OrderType.PurchaseOrder, 5, 10, ''),  # i = 2; Bought 5; Expect $0; PO Queue Head Remaining = 2
            (OrderType.PurchaseOrder, 8, 2, expected_po_head),  # i = 3; Bought 1; Expect $(4 x 2) = $8
            (OrderType.PurchaseOrder, 2, 20, ''),  # i = 4; Bought 2; Expect: $(4 x 2) +  $(2 x 20) = $48
            (OrderType.CustomerOrder, 3, 0, ''), # i = 5; Sold 3; Expect $(1 x 2) + (2 x 20) = $42
        ])
        expected = InventoryItemValue(
            itemId = self.initial_cache_val.itemId,
            aggregateValue = 42 + self.initial_cache_val.aggregateValue,
            numUnsold = 3,
            poQueueHead = expected_po_head,
            coQueueHead = self.end_exclusive_str,
            coQueueHeadQtyRemain = 0,
            poQueueHeadQtyRemain = 1
        )
        unsold_value = self._call_get_unsold_items_value(data)
        self.assertEqual(expected, unsold_value)

if __name__ == '__main__':
    unittest.main()