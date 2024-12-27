import { CreateOrderChangeInput, TShirtOrder } from "@/API";
import { DBOperation } from "@/contexts/DBErrorContext";
import { UpdateOrderTransactionInput } from "./update-tshirt-order/update-tshirt-order-transaction";
import { fromUTC } from "@/utils/datetimeConversions";

export const validateTShirtOrderInput = (
  tshirtOrder: TShirtOrder,
  dbOperation: DBOperation
) => {
  if (dbOperation === DBOperation.CREATE && tshirtOrder.id !== undefined) {
    throw Error("Creating TShirtOrder should not already have an id");
  }
  if (dbOperation === DBOperation.UPDATE && tshirtOrder.id === undefined) {
    throw Error("Editing TShirtOrder when it did not have an id");
  }
  if (
    tshirtOrder.amountReceived === null ||
    tshirtOrder.amountReceived === undefined ||
    tshirtOrder.amountReceived < 0
  )
    throw Error("Invalid amount received input");
  if (tshirtOrder.quantity < 0) throw Error("Invalid quantity inputs");
  if (tshirtOrder.costPerUnit < 0) throw Error("Invalid cost per unit input");
  if (
    !tshirtOrder.tshirt ||
    !tshirtOrder.tShirtOrderTshirtId ||
    tshirtOrder.tShirtOrderTshirtId.length <= 0
  )
    throw Error("Invalid TShirt for TShirtOrder");
};

export const validateOrderChangeInput = (
  createOrderChangeInput: CreateOrderChangeInput
) => {
  if (createOrderChangeInput.fieldChanges.length === 0)
    throw Error("No changes made to order");
  if (createOrderChangeInput.reason.length === 0)
    throw Error("No reason for editing order provided.");
  if (createOrderChangeInput.orderChangeTshirtId.length === 0)
    throw Error("No thirt id provided");
};

export const validateUpdateOrderInput = (
  input: UpdateOrderTransactionInput,
  tshirtOrderTableOperation: DBOperation
) => {
  if (
    tshirtOrderTableOperation !== DBOperation.CREATE &&
    tshirtOrderTableOperation !== DBOperation.UPDATE
  )
    throw Error("Invalid operation " + tshirtOrderTableOperation);
  const { updatedTShirtOrder, parentOrder, createOrderChangeInput } = input;
  if (parentOrder.id === undefined || parentOrder.id === "")
    throw Error("Order id does not exist");

  // const isValid = (input: UpdateOrderTransactionInput) => {
  //   if (orderIsAfterStartOfMonth(parentOrder)) return true;
  //   const fieldChanges = input.createOrderChangeInput.fieldChanges;
  //   if (fieldChanges.length !== 1) return false;
  //   if (tshirtOrderTableOperation !== DBOperation.UPDATE) return false;

    // const isPO = input.parentOrder.__typename === "PurchaseOrder";
    // const fieldChange = fieldChanges[0];
    // const onlyUpdatingAmtRecvField =
    //   fieldChange.fieldName === TShirtOrderFields.AmtReceived;
    // const isOnlyAddingToExistingPOItem =
    //   isPO && onlyUpdatingAmtRecvField && input.inventoryQtyDelta > 0;

    // if (isOnlyAddingToExistingPOItem) return true;

  //   // At this pt. we already know its a CustomerOrder
  //   if (fieldChange.fieldName !== TShirtOrderFields.Qty) return false;
  //   const delta =
  //     parseInt(fieldChange.newValue) - parseInt(fieldChange.oldValue);
  //   return delta < 0;
  // };

  // if (!isValid(input))
  //   throw Error(
  //     "Orders from prior months cannot be updated except when... 1) Receiving outstanding purchase order items. 2) Returning customer bought items to inventory"
  //   );
  
  let recvDate = input.poItemReceivedDate;
  if(recvDate && fromUTC(recvDate).isBefore(fromUTC(input.parentOrder.createdAt))) {
    throw Error("Date received can't be before the order date")
  }

  validateOrderChangeInput(createOrderChangeInput);
  validateTShirtOrderInput(updatedTShirtOrder, tshirtOrderTableOperation);
};
