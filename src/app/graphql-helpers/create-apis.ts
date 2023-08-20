import { CreateTShirtInput, CreateTShirtMutation, TShirt } from "@/API";
import { API } from "aws-amplify";
import { GraphQLQuery, GRAPHQL_AUTH_MODE, GraphQLResult } from '@aws-amplify/api';
import { createTShirt } from "@/graphql/mutations";

export const createTShirtAPI = async (tshirt: CreateTShirtInput): Promise<GraphQLResult<CreateTShirtMutation>> => {
    const resp = await API.graphql<GraphQLQuery<CreateTShirtMutation>>({ query: createTShirt, 
        variables: {input: tshirt}, 
        authMode: GRAPHQL_AUTH_MODE.API_KEY
    }).catch(e => { console.log(e); return e});
    return resp;
}