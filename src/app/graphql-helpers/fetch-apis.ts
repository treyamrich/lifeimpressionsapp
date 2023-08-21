import { ListTShirtsQuery, TShirt } from "@/API";
import { API } from "aws-amplify";
import {
  GraphQLQuery,
  GRAPHQL_AUTH_MODE,
} from "@aws-amplify/api";
import { listTShirts } from "@/graphql/queries";
import { DBOperation, DBOperationError } from "./graphql-errors";

export const listTShirtAPI = async (): Promise<TShirt[] | DBOperationError> => {
  const resp = await API.graphql<GraphQLQuery<ListTShirtsQuery>>({
    query: listTShirts,
    authMode: GRAPHQL_AUTH_MODE.API_KEY,
  })
    .then((res) => res.data?.listTShirts?.items as TShirt[])
    .catch((e) => {
      console.log(e);
      return {
        errorMessage: "Failed to fetch TShirts",
        operationName: DBOperation.LIST,
      } as DBOperationError;
    });
  return resp;
};
