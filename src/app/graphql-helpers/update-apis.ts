import {
  UpdateTShirtInput,
  UpdateTShirtMutation,
  TShirt,
  UpdatePurchaseOrderInput,
  PurchaseOrder,
  UpdatePurchaseOrderMutation,
  UpdateTShirtOrderInput,
  TShirtOrder,
  UpdateTShirtOrderMutation,
} from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import {
  updatePurchaseOrder,
  updateTShirt,
  updateTShirtOrder,
} from "@/graphql/mutations";
import { configuredAuthMode } from "./auth-mode";
import { cleanObjectFields } from "./util";

export const updateTShirtAPI = async (
  tshirt: UpdateTShirtInput
): Promise<TShirt> => {
  //Clean up the data by removing fields not defined in the graphql request
  const updatedTShirt = cleanObjectFields(tshirt);
  const resp = await API.graphql<GraphQLQuery<UpdateTShirtMutation>>({
    query: updateTShirt,
    variables: { input: updatedTShirt },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.updateTShirt as TShirt)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to update TShirt");
    });
  return resp;
};

export const updateTShirtOrderAPI = async (
  tshirtOrder: UpdateTShirtOrderInput
): Promise<TShirtOrder> => {
  const updatedTshirtOrder = cleanObjectFields(tshirtOrder);
  const resp = await API.graphql<GraphQLQuery<UpdateTShirtOrderMutation>>({
    query: updateTShirtOrder,
    variables: { input: updatedTshirtOrder },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.updateTShirtOrder as TShirtOrder)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to update TShirtOrder");
    });
  return resp;
};

export const updatePurchaseOrderAPI = async (
  po: UpdatePurchaseOrderInput
): Promise<PurchaseOrder> => {
  //Clean up the data by removing fields not defined in the graphql request
  const updatedPO = cleanObjectFields(po);
  const resp = await API.graphql<GraphQLQuery<UpdatePurchaseOrderMutation>>({
    query: updatePurchaseOrder,
    variables: { input: updatedPO },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.updatePurchaseOrder as PurchaseOrder)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to update Purchase Order");
    });
  return resp;
};
