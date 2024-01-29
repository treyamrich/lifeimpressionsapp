import { TShirtOrder } from "@/API";
import { DBOperation } from "@/contexts/DBErrorContext";

export const validateTShirtOrderInput = (tshirtOrder: TShirtOrder, dbOperation: DBOperation) => {
    if (dbOperation === DBOperation.CREATE && tshirtOrder.id !== undefined) {
        throw Error("Creating TShirtOrder should not already have an id")
    }
    if (dbOperation === DBOperation.UPDATE && tshirtOrder.id === undefined) {
        throw Error("Editing TShirtOrder when it did not have an id")
    }
    if (tshirtOrder.amountReceived === null || tshirtOrder.amountReceived === undefined || tshirtOrder.amountReceived < 0) throw Error("Invalid amount received input");
    if (tshirtOrder.quantity < 0) throw Error("Invalid quantity inputs");
    if (tshirtOrder.costPerUnit < 0) throw Error("Invalid cost per unit input");
    if(tshirtOrder.discount < 0) throw Error("Invalid discount input");
    if (!tshirtOrder.tshirt || !tshirtOrder.tShirtOrderTshirtId || tshirtOrder.tShirtOrderTshirtId.length <= 0) throw Error("Invalid TShirt for TShirtOrder")
}