import { fromUTC, getStartOfMonth } from "@/utils/datetimeConversions";
import { PurchaseOrderOrCustomerOrder } from "./partiql-helpers";
import { UpdateOrderTransactionInput } from "./update-tshirt-order/update-tshirt-order-transaction";
import { TShirtOrder } from "@/API";
import { AttributeValue } from "@aws-sdk/client-dynamodb";

export const isCO = (order: PurchaseOrderOrCustomerOrder) => order.__typename === 'CustomerOrder';
export const isPO = (order: PurchaseOrderOrCustomerOrder) => order.__typename === 'PurchaseOrder';

export const orderIsAfterStartOfMonth = (
    order: PurchaseOrderOrCustomerOrder
  ): boolean => isAfterStartOfMonth(order.createdAt)

export const isAfterStartOfMonth = (
  dateTimeStr: string
) => fromUTC(dateTimeStr) >= getStartOfMonth(0);


export const fromAttrVals = (item: any) => {
    const castNonIterable = (v: AttributeValue) => {
      if (v.NULL) return null;
      if (v.S) return v.S;
      if (v.N) return parseFloat(v.N);
      if (v.BOOL) return v.BOOL;
      throw new Error('Not Implemented')
    }
    
    const rec = (v: any): any => {
      if (v.L) 
        return v.L.map((x: AttributeValue) => rec(x));
      if (v.M) {
        let res: any = {};
        Object.keys(v.M).forEach((k: string) => {
          res[k] = rec(v.M[k])
        })
        return res;
      }
      return castNonIterable(v)
    }

    Object.keys(item).forEach(key => {
      item[key] = rec(item[key])
    })
    return item
}