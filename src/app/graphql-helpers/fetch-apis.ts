import { ListTShirtsQuery, TShirt } from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery, GRAPHQL_AUTH_MODE } from "@aws-amplify/api";
import { listTShirts } from "@/graphql/queries";

export const listTShirtAPI = async (): Promise<TShirt[]> => {
  const resp = await API.graphql<GraphQLQuery<ListTShirtsQuery>>({
    query: listTShirts,
    authMode: GRAPHQL_AUTH_MODE.API_KEY,
  })
    .then((res) => res.data?.listTShirts?.items as TShirt[])
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to fetch TShirts");
    });
  return resp;
};
