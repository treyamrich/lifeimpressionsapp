import { POReceival, TShirtOrder } from "@/API";
import { fromUTC } from "@/utils/datetimeConversions";

export type GetUpdatePOItemResult = {
  earliestTShirtOrderDate: string;
  newResponseTShirtOrder: TShirtOrder;
}

export const getDecreasePOItemStatement = (
  updatedTShirtOrder: TShirtOrder,
  amtRecvDelta: number
): GetUpdatePOItemResult => {

  let poReceivals = updatedTShirtOrder.receivals;
  if (!poReceivals || !poReceivals.length) 
    throw Error('No item receivals when trying to decrease item qty.');

  let poReceivalsCopy = [...poReceivals];
  let remainingRemovals = Math.abs(amtRecvDelta);
  let n = poReceivalsCopy.length;
  let earliestReceivalTimestamp = poReceivalsCopy[n-1].timestamp;
  let newEarliestTransaction = updatedTShirtOrder.earliestTransaction;
  let newLatestTransaction = updatedTShirtOrder.latestTransaction;
    
  for (let i = n - 1; i >= 0 && remainingRemovals > 0; i--) {
    let amtRecv = poReceivalsCopy[i].quantity;
    let remainder = amtRecv - remainingRemovals;
    earliestReceivalTimestamp = poReceivalsCopy[i].timestamp;

    if (i == 0 && remainder < 0)
      throw Error('Negative items received not allowed')

    if (remainder <= 0) {
      poReceivalsCopy.splice(i)
    } else {
      poReceivalsCopy[i] = {
        ...poReceivalsCopy[i],
        quantity: remainder,
      };
      poReceivalsCopy.splice(i+1);
    }
    remainingRemovals = -remainder;
  }

  if (poReceivalsCopy.length === 0) {
    newEarliestTransaction = updatedTShirtOrder.createdAt;
    newLatestTransaction = updatedTShirtOrder.createdAt;
  } else {
    newLatestTransaction = poReceivalsCopy[poReceivalsCopy.length-1].timestamp; 
  }

  let newResponseTShirtOrder: TShirtOrder = {
    ...updatedTShirtOrder,
    receivals: poReceivalsCopy,
    earliestTransaction: newEarliestTransaction,
    latestTransaction: newLatestTransaction
  };
  
  return { 
    newResponseTShirtOrder,
    earliestTShirtOrderDate: earliestReceivalTimestamp 
  };
};

export const getIncreasePOItemStatement = (
  updatedTShirtOrder: TShirtOrder,
  amtRecvDelta: number,
  receivedAtDatetime: string,
): GetUpdatePOItemResult => {
  let newPOReceivals = [...(updatedTShirtOrder.receivals ?? [])];
  let newPORecvDt = fromUTC(receivedAtDatetime);
  let newEarliestTransaction = updatedTShirtOrder.earliestTransaction;
  let newLatestTransaction = updatedTShirtOrder.latestTransaction;
  let insertIdx = newPOReceivals.findIndex(recieval => {
    let recievalDt = fromUTC(recieval.timestamp)
    return newPORecvDt.isBefore(recievalDt)
  })
  insertIdx = insertIdx < 0 ? newPOReceivals.length : insertIdx;
  const poRecv: POReceival = {
    __typename: "POReceival",
    quantity: amtRecvDelta,
    timestamp: receivedAtDatetime
  }

  if (newPOReceivals.length === 0) {
    newEarliestTransaction = receivedAtDatetime;
    newLatestTransaction = receivedAtDatetime;
  }
  else if(insertIdx === 0) {
    newEarliestTransaction = receivedAtDatetime;
  } 
  else if (insertIdx === newPOReceivals.length) {
    newLatestTransaction = receivedAtDatetime;
  }

  newPOReceivals.splice(insertIdx, 0, poRecv);
  let newResponseTShirtOrder: TShirtOrder = {
    ...updatedTShirtOrder,
    receivals: newPOReceivals,
    earliestTransaction: newEarliestTransaction,
    latestTransaction: newLatestTransaction
  };

  return {
    newResponseTShirtOrder,
    earliestTShirtOrderDate: receivedAtDatetime
  }
}