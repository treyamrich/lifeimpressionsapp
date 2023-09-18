
import { API } from "aws-amplify";
import { GraphQLQuery } from "@aws-amplify/api";
import { deleteTShirtOrder } from "@/graphql/mutations";
import { DeleteTShirtOrderInput, DeleteTShirtOrderMutation, TShirtOrder } from "@/API";
import { configuredAuthMode } from "./auth-mode";

export const deleteTShirtOrderAPI = async (
    id: DeleteTShirtOrderInput
): Promise<TShirtOrder> => {
    const resp = await API.graphql<GraphQLQuery<DeleteTShirtOrderMutation>>({
        query: deleteTShirtOrder,
        variables: { input: id },
        authMode: configuredAuthMode
    })
        .then(res => res.data?.deleteTShirtOrder as TShirtOrder)
        .catch(e => {
            console.log(e);
            throw new Error("Failed to delete TShirtOrder")
        });
    return resp;
}