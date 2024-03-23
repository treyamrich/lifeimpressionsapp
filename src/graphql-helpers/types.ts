import { DocumentNode } from 'graphql';
import {

    ModelSortDirection,
    ModelStringKeyConditionInput,
} from "@/API";

export type Query = {
    name: string;
    query: string | DocumentNode;
}

export interface ListAPIInput<T> {
    doCompletePagination?: boolean;
    filters?: T;
    sortDirection?: ModelSortDirection;
    createdAt?: ModelStringKeyConditionInput;
    nextToken?: string | null;
    indexPartitionKey?: string;
}

export type ListAPIResponse<T> = {
    result: T[];
    nextToken: string | null | undefined;
};