import { TShirt } from "@/API";
import { tshirtSizeToLabel } from "@/app/(DashboardLayout)/inventory/InventoryTable/table-constants";

export const failedUpdateTShirtStr = (tshirt: TShirt) => 
`(Style No.: ${tshirt.styleNumber}, Size: ${tshirtSizeToLabel[tshirt.size]}, Color: ${tshirt.color})`;