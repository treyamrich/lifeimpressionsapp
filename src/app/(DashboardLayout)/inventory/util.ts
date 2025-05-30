import { TShirt } from "@/API";
import { DBOperation } from "@/contexts/DBErrorContext";
import { listTShirtAPI } from "@/graphql-helpers/list-apis";
import { CSVHeader, downloadCSV } from "@/utils/csvGeneration";
import { getTodayInSetTz, toReadableDateTime } from "@/utils/datetimeConversions";
import { TShirtFields, tshirtSizeToLabel, tshirtTypeToLabel } from "./InventoryTable/table-constants";
import { Page } from "@/api/types";

export const fetchAllNonDeletedTShirts = (
  rescueDBOperation: (
    func: () => void,
    operation: DBOperation,
    onSuccess: any,
    errorTranslator?: (error: Error) => string
  ) => void,
  responseHandler: (resp: Page<TShirt>) => void
) => {
  const deletedFilter = { isDeleted: { ne: true } };
  rescueDBOperation(
    () =>
      listTShirtAPI({
        filters: deletedFilter,
        doCompletePagination: true,
      }),
    DBOperation.LIST,
    responseHandler
  );
};

export const downloadInventoryCSV = (inventory: TShirt[]) => {
  const enhancedInventory = inventory.map((tshirt: TShirt) => {
    return {
        ...tshirt,
        createdAt: toReadableDateTime(tshirt.createdAt),
        updatedAt: toReadableDateTime(tshirt.updatedAt),
        [TShirtFields.Size]: tshirtSizeToLabel[tshirt.size],
        [TShirtFields.Type]: tshirtTypeToLabel[tshirt.type]
    }
  });

  let headers: CSVHeader[] = [
    { columnKey: "id", headerName: "TShirt ID" },

    { columnKey: TShirtFields.StyleNumber, headerName: "Style No."},
    { columnKey: TShirtFields.QtyOnHand, headerName: "Qty On Hand"},
    { columnKey: TShirtFields.Color, headerName: "Color"},
    { columnKey: TShirtFields.Size, headerName: "Size"},

    { columnKey: TShirtFields.Brand, headerName: "Brand"},
    { columnKey: TShirtFields.Type, headerName: "Type"},

    { columnKey: "createdAt", headerName: "Order Date" },
    { columnKey: "updatedAt", headerName: "Last Modified" },
    { columnKey: "isDeleted", headerName: "Was Deleted" },
  ];

  const today = toReadableDateTime(getTodayInSetTz().toString());
  const csvName = `LIH-Inventory-Export-${today}.csv`;
  downloadCSV(csvName, headers, enhancedInventory);
}
