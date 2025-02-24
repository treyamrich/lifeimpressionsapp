from decimal import Decimal
import random
from typing import List
import unittest
from unittest.mock import MagicMock
from mock_apis import build_date
import sys
import os
from datetime import datetime

# Import your module
sys.path.insert(0, os.path.abspath(".."))
from src.index import (
    DateRange,
    Factory,
    InventoryItem,
    InventoryValueCache,
    InventoryValueCalculator,
    InventoryItemValue,
    StepSize,
)

sys.path.pop(0)


class TestInventoryValueCalculator(unittest.TestCase):

    def setUp(self):
        self.mock_graphql_client = MagicMock()
        self.mock_dynamodb_client = MagicMock()
        inventory = [
            InventoryItem("item_1", "", "", "", 0),
            InventoryItem("item_2", "", "", "", 0),
        ]
        self.mock_inventory = MagicMock()
        self.mock_inventory.list.return_value = inventory
        self.factory = Factory(
            self.mock_graphql_client, self.mock_dynamodb_client, self.mock_inventory
        )

    # The InventoryValueCalculator should aggregate the inventory values by day
    # received from various ItemValueCalculators
    def test_aggregation_by_day(self):
        date_range = DateRange(
            build_date(2020, 1, 1), build_date(2020, 2, 1), StepSize.DAY
        )
        prev_cache = self._build_inv_val_cache(build_date(2019, 12, 31), [])

        inventory_calculator = InventoryValueCalculator(
            date_range,
            self.factory,
            prev_cache,
        )

        iiv_set_1 = [
            self._build_iiv("item_1", inv_qty=random.randint(0, 5)) for _ in date_range
        ]
        mock_calc_1 = self._build_mock_item_val_calculator(iiv_set_1)
        iiv_set_2 = [
            self._build_iiv("item_2", inv_qty=random.randint(0, 5)) for _ in date_range
        ]
        mock_calc_2 = self._build_mock_item_val_calculator(iiv_set_2)
        mocks = [mock_calc_1, mock_calc_2]
        mock_new_item_val_calculator = MagicMock()
        mock_new_item_val_calculator.side_effect = mocks
        self.factory.new_item_val_calculator = mock_new_item_val_calculator

        inventory_calculator.calculate()
        self.mock_inventory.list.assert_called_once()
        self._assert_new_item_val_calculator_called(
            mock_new_item_val_calculator, date_range, self.mock_inventory, prev_cache
        )
        self._assert_mock_item_calculator_called(date_range, *mocks)

        for i, (start, _) in enumerate(date_range):
            actual_inv_val_cache = inventory_calculator[start]
            self.assertEqual(actual_inv_val_cache["item_1"], iiv_set_1[i])
            self.assertEqual(actual_inv_val_cache["item_2"], iiv_set_2[i])

    def _build_mock_item_val_calculator(
        self, expected_iiv_seq: List[InventoryItemValue]
    ):
        mock_item_calc = MagicMock()
        mock_item_calc.__getitem__.side_effect = expected_iiv_seq
        return mock_item_calc

    def _assert_mock_item_calculator_called(
        self,
        date_range: DateRange,
        *mock_item_calc: MagicMock,
    ):
        # Assert aggregation done on the correct days
        for idx, (start, _) in enumerate(date_range):
            for calc in mock_item_calc:
                self.assertEqual(calc.__getitem__.call_args_list[idx][0][0], start)

    def _assert_new_item_val_calculator_called(
        self,
        mock: MagicMock,
        date_range: DateRange,
        inventory: List[InventoryItem],
        prev_cache: InventoryValueCache,
    ):
        for i, inventory_item in enumerate(inventory):
            args, _ = mock.call_args_list[i]
            self.assertEqual(args[0], date_range)
            self.assertEqual(args[1], inventory_item)
            self.assertEqual(args[2], prev_cache[inventory_item.id])
            self.assertEqual(args[3], self.mock_graphql_client)

    def _build_inv_val_cache(
        self, created_date: datetime, cache_items: List[InventoryItemValue]
    ) -> InventoryValueCache:
        cache = InventoryValueCache(
            self.mock_graphql_client,
            self.mock_dynamodb_client,
            created_date=created_date
        )
        for i in cache_items:
            cache[i.itemId] = i
        return cache

    def _build_iiv(self, item_id: str, inv_qty: int = 0) -> InventoryItemValue:
        res = InventoryItemValue(item_id)
        res.aggregateValue = (Decimal(random.randint(0, 5)),)
        res.numUnsold = (random.randint(0, 5),)
        res.inventoryQty = (inv_qty,)
        return res


if __name__ == "__main__":
    unittest.main()
