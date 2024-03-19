import { ParameterizedStatement } from "@aws-sdk/client-dynamodb";
import { GetUpdateTShirtOrderStatements, UpdateOrderTransactionInput } from "./update-tshirt-order-transaction";
import { TShirtOrder } from "@/API";
import { PurchaseOrderOrCustomerOrder, getHardDeleteTShirtOrderPartiQL, getUpdateTShirtOrderTablePartiQL } from "../partiql-helpers";
import { datetimeInPlaceSort } from "@/utils/datetimeConversions";

export const getDecreasePOItemStatements = (
  parentOrder: PurchaseOrderOrCustomerOrder,
  input: UpdateOrderTransactionInput,
  amtRecvDelta: number
): GetUpdateTShirtOrderStatements => {
  const { updatedTShirtOrder } = input;

  let orderedItems = (parentOrder.orderedItems?.items as TShirtOrder[]) ?? [];
  let receivedPOItems = orderedItems.filter(
    (tshirtOrder) =>
      tshirtOrder.tShirtOrderTshirtId === updatedTShirtOrder.tShirtOrderTshirtId
  );
  datetimeInPlaceSort(receivedPOItems, x => x.createdAt)

  let remainingRemovals = Math.abs(amtRecvDelta);
  let removalStatements: ParameterizedStatement[] = [];
  let n = receivedPOItems.length;
  let earliestTShirtOrder = receivedPOItems[n-1];
  let finalIdx = n-1;
  
  for (let i = n - 1; i >= 0 && remainingRemovals > 0; i--) {
    let amtRecv = receivedPOItems[i].amountReceived ?? 0;
    let remainder = amtRecv - remainingRemovals;
    earliestTShirtOrder = receivedPOItems[i];
    finalIdx = i;

    if(i !== 0 && remainder <= 0){
      removalStatements.push(
        getHardDeleteTShirtOrderPartiQL(receivedPOItems[i])
      );
      remainingRemovals = -remainder;
    } else if (remainder >= 0) {
      let updatedTShirtOrder: TShirtOrder = {
        ...receivedPOItems[i],
        amountReceived: remainder,
      };
      removalStatements.push(
        getUpdateTShirtOrderTablePartiQL(updatedTShirtOrder)
      );
      remainingRemovals = 0;
    }
  }

  return { updateTShirtOrderStatements: removalStatements, earliestTShirtOrder: earliestTShirtOrder};
};
