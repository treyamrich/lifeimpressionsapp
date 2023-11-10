import {
  UpdateTShirtInput,
  UpdateTShirtMutation,
  TShirt,
  UpdateTShirtOrderInput,
  TShirtOrder,
  UpdateTShirtOrderMutation,
  UpdateCustomerOrderInput,
  UpdateCustomerOrderMutation,
  CustomerOrder,
} from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import {
  updateCustomerOrder,
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

export const updateCustomerOrderAPI = async (
  customerOrder: UpdateCustomerOrderInput
): Promise<CustomerOrder> => {
  const cleanedCustomerOrder = cleanObjectFields(customerOrder);
  const nullablePhone = cleanedCustomerOrder.customerPhoneNumber === undefined ? null : cleanedCustomerOrder.customerPhoneNumber;
  const nullableEmail = cleanedCustomerOrder.customerEmail === undefined ? null : cleanedCustomerOrder.customerEmail;
  const updatedCustomerOrder = {...cleanedCustomerOrder,
    customerPhoneNumber: nullablePhone,
    customerEmail: nullableEmail
  };

  const resp = await API.graphql<GraphQLQuery<UpdateCustomerOrderMutation>>({
    query: updateCustomerOrder,
    variables: { input: updatedCustomerOrder },
    authMode: configuredAuthMode,
  })
    .then((res) => res.data?.updateCustomerOrder as CustomerOrder)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to update CustomerOrder");
    });
  return resp;
};