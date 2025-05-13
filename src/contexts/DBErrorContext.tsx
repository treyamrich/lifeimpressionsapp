import { ReactNode, useState, createContext, useContext, SetStateAction } from "react";
import { rescueDBOperationBatch } from "./db-context-funcs";

export enum DBOperation {
    CREATE = "Create",
    UPDATE = "Update",
    LIST = "List",
    GET = "Get",
    DELETE = "Delete",
    BATCH = "Batch",
}

export interface DBOperationError {
    operationName: DBOperation;
    errorMessage: string | undefined;
}

export const defaultDBOperationError: DBOperationError = {
    operationName: DBOperation.CREATE,
    errorMessage: undefined,
};

export type AsyncBatchItem<T> = {
    requestFn: () => Promise<T>;
    dbOperation: DBOperation;
    successHandler?: (res: T) => void;
    errorHandler?: (e: any) => void;
    errorMessage?: string;
}

type DBErrorContextType = {
    dbOperationError: DBOperationError,
    clearDBOperationErrors: () => void;
    rescueDBOperation: (func: () => void,
        operation: DBOperation,
        onSuccess: any,
        errorTranslator?: (error: Error) => string
    ) => Promise<any>;
    rescueDBOperationBatch: <T>(batchItems: AsyncBatchItem<T>[]) => Promise<void>;
};

const dbOpErrorContextDefaultValues: DBErrorContextType = {
    dbOperationError: defaultDBOperationError,
    clearDBOperationErrors: () => { },
    rescueDBOperation: () => Promise.resolve(),
    rescueDBOperationBatch: () => Promise.resolve(),
};

const DBOpContext = createContext<DBErrorContextType>(dbOpErrorContextDefaultValues);
export const useDBOperationContext = () => useContext(DBOpContext);

type Props = {
    children: ReactNode;
};

export const DBOperationContextProvider = ({ children }: Props) => {
    const [dbOperationError, setDBOperationError] = useState({
        ...defaultDBOperationError,
    } as DBOperationError);

    const rescueDBOperation = async (
        func: () => void,
        operation: DBOperation,
        onSuccess: any,
        errorTranslator?: (error: Error) => string,
    ) => {
        let resp;
        try {
            resp = await func();
            onSuccess(resp);
        } catch (err: any) {
            console.log(err);
            setDBOperationError({
                errorMessage: errorTranslator ? errorTranslator(err) : err?.message,
                operationName: operation,
            } as DBOperationError);
        }
        return resp;
    };

    async function rescueDBOperationBatchHelper<T>(
        batchItems: AsyncBatchItem<T>[], 
        customMasterErrMsg?: string
    ) {
        return await rescueDBOperationBatch(setDBOperationError, batchItems, customMasterErrMsg)
    }

    const clearDBOperationErrors = () => setDBOperationError({ ...defaultDBOperationError });

    return (
        <DBOpContext.Provider value={{
            dbOperationError,
            clearDBOperationErrors,
            rescueDBOperation,
            rescueDBOperationBatch: rescueDBOperationBatchHelper
        }}>
            {children}
        </DBOpContext.Provider>
    );
};
