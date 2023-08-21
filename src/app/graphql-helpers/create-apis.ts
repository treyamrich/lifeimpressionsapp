import { CreateTShirtInput, CreateTShirtMutation, TShirt } from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery, GRAPHQL_AUTH_MODE } from "@aws-amplify/api";
import { createTShirt } from "@/graphql/mutations";

export const createTShirtAPI = async (
  tshirt: CreateTShirtInput
): Promise<TShirt> => {
  const resp = await API.graphql<GraphQLQuery<CreateTShirtMutation>>({
    query: createTShirt,
    variables: { input: tshirt },
    authMode: GRAPHQL_AUTH_MODE.API_KEY,
  })
    .then((res) => res.data?.createTShirt as TShirt)
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to create TShirt");
    });
  return resp;
};
