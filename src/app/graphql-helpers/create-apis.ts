import { CreatePurchaseOrderChangeInput, CreatePurchaseOrderChangeMutation, CreatePurchaseOrderMutation, CreateTShirtInput, CreateTShirtMutation, CreateTShirtOrderMutation, CustomerOrder, PurchaseOrder, PurchaseOrderChange, TShirt, TShirtOrder } from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import { createPurchaseOrder, createPurchaseOrderChange, createTShirt, createTShirtOrder } from "@/graphql/mutations";
import { configuredAuthMode } from "./auth-mode";
import { cleanObjectFields } from "./util";

export const createTShirtAPI = async (
  tshirt: CreateTShirtInput
): Promise<TShirt> => {
  const resp = await API.graphql<GraphQLQuery<CreateTShirtMutation>>({
    query: createTShirt,
    variables: { input: tshirt },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.createTShirt as TShirt)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to create TShirt");
    });
  return resp;
};

export const createPurchaseOrderAPI = async (
  po: PurchaseOrder
): Promise<PurchaseOrder> => {
  const cleanPO = cleanObjectFields(po);
  const resp = await API.graphql<GraphQLQuery<CreatePurchaseOrderMutation>>({
    query: createPurchaseOrder,
    variables: { input: cleanPO },
    authMode: configuredAuthMode
  })
    .then(res => res.data?.createPurchaseOrder as PurchaseOrder)
    .catch(e => {
      console.log(e);
      throw new Error("Failed to create new Purchase Order");
    });
  return resp
}

export const createPurchaseOrderChangeAPI = async (
  poChange: CreatePurchaseOrderChangeInput
): Promise<PurchaseOrderChange> => {
  const resp = await API.graphql<GraphQLQuery<CreatePurchaseOrderChangeMutation>>({
    query: createPurchaseOrderChange,
    variables: { input: poChange },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.createPurchaseOrderChange as PurchaseOrderChange)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to create Purchase Order Change");
    });
  return resp;
}

type PurchaseOrderOrCustomerOrder = PurchaseOrder | CustomerOrder;

export const createTShirtOrderAPI = async (
  parentObject: PurchaseOrderOrCustomerOrder,
  orderedItems: TShirtOrder[]
): Promise<TShirtOrder[]> => {
  const requests: Promise<TShirtOrder | void>[] = [];
  const errors: string[] = [];
  orderedItems.forEach((tshirtOrder: TShirtOrder) => {
    // Populate the foreign key
    const tshirtToAdd = { ...tshirtOrder };
    if (parentObject.__typename === "PurchaseOrder") {
      tshirtToAdd["purchaseOrderOrderedItemsId"] = parentObject.id;
    } else if (parentObject.__typename === "CustomerOrder") {
      tshirtToAdd["customerOrderOrderedItemsId"] = parentObject.id;
    }
    const resp = API.graphql<GraphQLQuery<CreateTShirtOrderMutation>>({
      query: createTShirtOrder,
      variables: { input: tshirtToAdd },
      authMode: configuredAuthMode
    })
      .then(res => res.data?.createTShirtOrder as TShirtOrder)
      .catch(e => {
        console.log(e);
        errors.push(tshirtToAdd.tShirtOrderTshirtStyleNumber);
      });
    requests.push(resp);
  });

  const results = await Promise.all(requests);
  if (errors.length > 0) {
    throw new Error(`Purchase order created but, failed to add TShirt(s): ${errors.toString()} to purchase order`);
  }
  return results as TShirtOrder[];
}