export enum SortDirection {
    ASC = "asc",
    DESC = "desc"
}

export interface Pagination {
    doCompletePagination?: boolean;
    sortDirection?: SortDirection;
    nextToken?: string | null;
    limit?: number;
}

export interface ListAPIResponse<T> {
    data: Page<T>;
}

export interface Page<T> {
    items: T[];
    nextToken: string | null;
}