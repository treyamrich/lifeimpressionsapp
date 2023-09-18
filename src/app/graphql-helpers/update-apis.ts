import { UpdateTShirtInput, UpdateTShirtMutation, TShirt, UpdatePurchaseOrderInput, PurchaseOrder, UpdatePurchaseOrderMutation } from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import { updatePurchaseOrder, updateTShirt } from "@/graphql/mutations";
import { configuredAuthMode } from "./auth-mode";

const cleanObjectForUpdate = (obj: any) => {
  return {
    ...obj,
    updatedAt: undefined,
    createdAt: undefined,
    __typename: undefined,
  };
};

export const updateTShirtAPI = async (
  tshirt: UpdateTShirtInput
): Promise<TShirt> => {
  //Clean up the data by removing fields not defined in the graphql request
  const updatedTShirt = cleanObjectForUpdate(tshirt);
  const resp = await API.graphql<GraphQLQuery<UpdateTShirtMutation>>({
    query: updateTShirt,
    variables: { input: updatedTShirt },
    authMode: configuredAuthMode
  })
    .then((res) => res.data?.updateTShirt as TShirt)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to update TShirt");
    });
  return resp;
};

export const updatePurchaseOrderAPI = async (
  po: UpdatePurchaseOrderInput
): Promise<PurchaseOrder> => {
  //Clean up the data by removing fields not defined in the graphql request
  const updatedPO = cleanObjectForUpdate(po);
  const resp = await API.graphql<GraphQLQuery<UpdatePurchaseOrderMutation>>({
    query: updatePurchaseOrder,
    variables: { input: updatedPO },
    authMode: configuredAuthMode
  })
    .then((res) => res.data?.updatePurchaseOrder as PurchaseOrder)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to update Purchase Order");
    });
  return resp;
}