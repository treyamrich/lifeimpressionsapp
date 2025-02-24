from decimal import Decimal
from typing import List
import unittest
from unittest.mock import MagicMock
import mock_apis
from mock_apis import OrderItemMockResponseBuilder, OrderType, build_date, build_iso_date
import sys
import os

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import DateRange, InventoryItem, ItemValueCalculator, InventoryItemValue, MyDateTime, QueueItem, StepSize
sys.path.pop(0)


class TestGetValuesByItem(unittest.TestCase):
    # We don't care about the previous value, since the past value is also computed when loading
    # from the last queue heads for POs and COs
    inv_item = InventoryItem('id', 'style_num', 'color', 'size', 2)
    base_iiv = InventoryItemValue(
        itemId=inv_item.id, 
        inventoryQty=inv_item.quantityOnHand,
        tshirtColor=inv_item.color,
        tshirtSize=inv_item.size,
        tshirtStyleNumber=inv_item.styleNumber,
    )
    
    def setUp(self):
        self.mock_graphql_client = MagicMock()
        
    def test_general_case(self):
        expected_po_head = build_date(2020, 1, 2, hour = 3)
        date_range = DateRange(build_date(2020, 1, 2), build_date(2020, 1, 3), StepSize.DAY)
        start_incl, end_excl = date_range.get_bounds()
        builder = OrderItemMockResponseBuilder()

        # Left over values from previous period
        builder[2020, 1, 1] = [
            (OrderType.PurchaseOrder, 50, 5.12), # 2 * 5.12  = $10.24
            (OrderType.PurchaseOrder, 10, 6.32)  # 10 * 6.32 = $63.20
        ]
        queue_head = build_iso_date(2020, 1, 1)
        prev_iiv = self.base_iiv.copy(
            poQueueHead = queue_head,
            coQueueHead = queue_head,
            coQueueHeadQtyRemain = 0,
            poQueueHeadQtyRemain = 2,
            aggregateValue = 2 * 5.12 + 10 * 6.32 # = $73.44
        )
        
        builder[2020, 1, 2] = [
            (OrderType.CustomerOrder, 10),        # expect val $73.44 - (2 x $5.12) - (8 x $6.32) = $12.64
            (OrderType.PurchaseOrder, 3, 5.12),   # expect val $12.63999 + (3 x $5.12) = $28
            (OrderType.CustomerOrder, 5),         # expect val $28 - (2 x $6.32) - (3 x $5.12) = $0
            (OrderType.PurchaseOrder, 25, 20.12), # expect val $(25 x 20.12) = $503
            (OrderType.CustomerOrder, 5)          # expect val $(20 x 20.12) = $402.40
        ]

        builder[2020, 1, 3] = [(OrderType.CustomerOrder, 5, 5)] # Is on exclusive end boundary

        expected = self.base_iiv.copy(
            numUnsold = 20,
            poQueueHead = MyDateTime.to_ISO8601(expected_po_head),
            coQueueHead = MyDateTime.to_ISO8601(end_excl),
            coQueueHeadQtyRemain = 0,
            poQueueHeadQtyRemain = 20,
            aggregateValue = Decimal('402.40')
        )

        self._set_mock_graphql_responses(builder)
        calculator = self._build_item_value_calculator(date_range, prev_iiv)

        v = calculator[start_incl]
        self.assertEqual(expected, v)

    def test_empty_value(self):
        date_range = DateRange(build_date(2020, 1, 2), build_date(2020, 1, 3), StepSize.DAY)
        start_incl, end_excl = date_range.get_bounds()
        expected_queue_head = MyDateTime.to_ISO8601(end_excl)
        expected = self.base_iiv.copy(
            poQueueHead = expected_queue_head,
            coQueueHead = expected_queue_head,
        )

        builder = OrderItemMockResponseBuilder()
        self._set_mock_graphql_responses(builder)
        calculator = self._build_item_value_calculator(date_range)

        v = calculator[start_incl]
        self.assertEqual(expected, v)

    def test_over_sold_item(self):
        date_range = DateRange(build_date(2020, 1, 1), build_date(2020, 1, 3), StepSize.DAY)
        start_incl, end_excl = date_range.get_bounds()
        builder = OrderItemMockResponseBuilder()

        builder[2020, 1, 1] = [
            (OrderType.PurchaseOrder, 10, 22),
            (OrderType.CustomerOrder, 50),
        ]
        builder[2020, 1, 2] = [
            (OrderType.PurchaseOrder, 40, 22),
            (OrderType.PurchaseOrder, 3, 25.1),
            (OrderType.CustomerOrder, 5),
            (OrderType.CustomerOrder, 5),
            (OrderType.CustomerOrder, 5) 
        ]

        expected_1 = self.base_iiv.copy(
            numUnsold = -40,
            poQueueHead = build_iso_date(2020, 1, 2),
            coQueueHead = build_iso_date(2020, 1, 1, hour=1),
            coQueueHeadQtyRemain = 40,
            poQueueHeadQtyRemain = 0,
            aggregateValue = Decimal('0')
        )
        expected_2 = self.base_iiv.copy(
            numUnsold = -12,
            poQueueHead = MyDateTime.to_ISO8601(end_excl),
            coQueueHead = build_iso_date(2020, 1, 2, hour=2),
            coQueueHeadQtyRemain = 2,
            poQueueHeadQtyRemain = 0,
            aggregateValue = Decimal('0.0')
        )

        self._set_mock_graphql_responses(builder)
        calculator = self._build_item_value_calculator(date_range)

        v = calculator[build_date(2020, 1, 1)]
        self.assertEqual(expected_1, v)

        v = calculator[build_date(2020, 1, 2)]
        self.assertEqual(expected_2, v)

    def test_value_over_months(self):
        date_range = DateRange(build_date(2020, 2, 1), build_date(2020, 3, 14), StepSize.MONTH)
        start_incl, end_excl = date_range.get_bounds()
        builder = OrderItemMockResponseBuilder()

        builder[2020, 1, 1] = [
            (OrderType.PurchaseOrder, 10, 22), # Ignored since queue head isn't in range
            (OrderType.CustomerOrder, 50),
        ]
        builder[2020, 2, 14] = [
            (OrderType.PurchaseOrder, 40, 22),
            (OrderType.PurchaseOrder, 3, 25.1),
            (OrderType.PurchaseOrder, 10, 66.1)
        ]
        builder[2020, 2, 27] = [(OrderType.CustomerOrder, 5)]
        builder[2020, 3, 9] = [(OrderType.CustomerOrder, 7)]
        builder[2020, 3, 15] = [(OrderType.PurchaseOrder, 3, 25.1)] # Is not included

        prev_iiv = self.base_iiv.copy(
            poQueueHead = build_iso_date(2020, 2, 1),
            coQueueHead = build_iso_date(2020, 1, 1, hour=1),
            coQueueHeadQtyRemain = 40,
            poQueueHeadQtyRemain = 0,
        )
        expected_1 = self.base_iiv.copy(
            numUnsold = 8,
            poQueueHead = build_iso_date(2020, 2, 14, hour=2),
            coQueueHead = build_iso_date(2020, 3, 1),
            coQueueHeadQtyRemain = 0,
            poQueueHeadQtyRemain = 8,
            aggregateValue = Decimal('528.8')
        )
        expected_2 = self.base_iiv.copy(
            numUnsold = 1,
            poQueueHead = build_iso_date(2020, 2, 14, hour=2),
            coQueueHead = MyDateTime.to_ISO8601(end_excl),
            coQueueHeadQtyRemain = 0,
            poQueueHeadQtyRemain = 1,
            aggregateValue = Decimal('66.1')
        )

        self._set_mock_graphql_responses(builder)
        calculator = self._build_item_value_calculator(date_range, prev_iiv)

        v = calculator[build_date(2020, 2, 1)]
        self.assertEqual(expected_1, v)

        # This would not be the value for the full month of March, but only up to the 14th
        v = calculator[build_date(2020, 3, 1)]
        self.assertEqual(expected_2, v)

        v = calculator[build_date(2020, 3, 15)]
        self.assertEqual(None, v)

        # Ensure the keys are mapping to the date range values
        # and that the tshirt fields are set correctly
        values = calculator.items()
        self.assertEqual(2, len(values))
        i = 0
        for start, _ in date_range:
            value_date, iiv = values[i]
            self.assertEqual(start, value_date)
            self.assertEqual(iiv.tshirtColor, self.inv_item.color)
            self.assertEqual(iiv.tshirtSize, self.inv_item.size)
            self.assertEqual(iiv.tshirtStyleNumber, self.inv_item.styleNumber)
            i += 1

    def _set_mock_graphql_responses(self, builder: OrderItemMockResponseBuilder):
        co_resp, po_resp = builder.build_stream_split()
        self.mock_graphql_client.make_request.side_effect = [next(po_resp), next(co_resp)]

    def _build_item_value_calculator(
        self, 
        date_range: DateRange,
        prev_iiv: InventoryItemValue = base_iiv
    ):  
        return ItemValueCalculator(
            date_range,
            self.inv_item,
            prev_iiv,
            self.mock_graphql_client,
        ).calculate()
    
if __name__ == '__main__':
    unittest.main()