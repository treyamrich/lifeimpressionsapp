import { CreateTShirtInput, CreateTShirtMutation, TShirt } from "@/API";
import { API } from "aws-amplify";
import {
  GraphQLQuery,
  GRAPHQL_AUTH_MODE,
} from "@aws-amplify/api";
import { createTShirt } from "@/graphql/mutations";
import { DBOperation, DBOperationError } from "./graphql-errors";

export const createTShirtAPI = async (
  tshirt: CreateTShirtInput
): Promise<TShirt | DBOperationError> => {
  const resp = await API.graphql<GraphQLQuery<CreateTShirtMutation>>({
    query: createTShirt,
    variables: { input: tshirt },
    authMode: GRAPHQL_AUTH_MODE.API_KEY,
  })
    .then((res) => res.data?.createTShirt as TShirt)
    .catch((e) => {
      console.log(e);
      return {
        errorMessage: "Failed to create TShirt",
        operationName: DBOperation.CREATE,
      } as DBOperationError;
    });
  return resp;
};
