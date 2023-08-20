export enum DBOperation {
    CREATE = "Create",
    UPDATE = "Update",
    LIST = "List",
    GET = "Get",
    DELETE = "Delete"
}

export interface DBOperationError {
    operationName: DBOperation;
    errorMessage: string | undefined
}

export const defaultDbOperationError: DBOperationError = {
    operationName: DBOperation.CREATE,
    errorMessage: undefined
}