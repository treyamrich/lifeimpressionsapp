import { TShirt, TShirtOrder } from "@/API";
import { tshirtSizeToLabel } from "@/app/(DashboardLayout)/inventory/InventoryTable/table-constants";
import dayjs from "dayjs";

export const combineTShirtOrderQtys = (
  o1: TShirtOrder,
  o2: TShirtOrder
): TShirtOrder => {
  const amtRecv1 = o1.amountReceived ?? 0;
  const amtRecv2 = o2.amountReceived ?? 0;
  const o1WasUpdatedLater = dayjs.utc(o1.updatedAt) > dayjs.utc(o2.updatedAt);
  return {
    ...o1,
    updatedAt: o1WasUpdatedLater ? o1.updatedAt : o2.updatedAt,
    quantity: o1.quantity + o2.quantity,
    amountReceived: amtRecv1 + amtRecv2,
  };
};

type StrToTShirtOrder = { [key: string]: TShirtOrder };

export const groupTShirtOrders = (tshirtOrders: TShirtOrder[]) =>
  Object.values(
    tshirtOrders.reduce((prev, curr) => {
      const groupKey = curr.tShirtOrderTshirtId;
      if (prev[groupKey]) {
        prev[groupKey] = combineTShirtOrderQtys(prev[groupKey], curr);
      } else {
        prev[groupKey] = curr;
      }
      return prev;
    }, {} as StrToTShirtOrder)
  );

export const failedUpdateTShirtStr = (tshirt: TShirt) => 
`(Style No.: ${tshirt.styleNumber}, Size: ${tshirtSizeToLabel[tshirt.size]}, Color: ${tshirt.color})`;