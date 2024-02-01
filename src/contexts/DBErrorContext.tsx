import { ReactNode, useState, createContext, useContext, SetStateAction } from "react";

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
        customErrorMessage?: string) => void;
    rescueDBOperationBatch: <T>(batchItems: AsyncBatchItem<T>[]) => void;
};

function dummyBatchFn<T>(batchItems: AsyncBatchItem<T>[]) { }

const dbOpErrorContextDefaultValues: DBErrorContextType = {
    dbOperationError: defaultDBOperationError,
    clearDBOperationErrors: () => { },
    rescueDBOperation: () => { },
    rescueDBOperationBatch: dummyBatchFn,
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
        customErrorMessage: string = ""
    ) => {
        let resp;
        try {
            resp = await func();
            onSuccess(resp);
        } catch (err: any) {
            console.log(err);
            setDBOperationError({
                errorMessage: customErrorMessage ? customErrorMessage : err?.message,
                operationName: operation,
            } as DBOperationError);
        }
        return resp;
    };

    async function rescueDBOperationBatch<T>(batchItems: AsyncBatchItem<T>[], customMasterErrMsg?: string) {
        let promises: any = [];
        let errors: DBOperationError[] = [];
        batchItems.forEach(item => {
            let promise = item.requestFn()
                .then(x => {
                    if (item.successHandler)
                        item.successHandler(x)
                })
                .catch(e => {
                    let errMsg = item.errorMessage ?
                        item.errorMessage :
                        `Failed operation: ${item.dbOperation}`;
                    errors.push({ errorMessage: errMsg, operationName: item.dbOperation })

                    if (item.errorHandler)
                        item.errorHandler(e)
                });
            promises.push(promise);
        });

        await Promise.all(promises);
        
        if (errors.length > 0) {
            let newErrMsg = customMasterErrMsg ?
                customMasterErrMsg :
                errors.map(e => e.errorMessage).join(', ');
            setDBOperationError({
                errorMessage: newErrMsg,
                operationName: DBOperation.BATCH,
            } as DBOperationError);
        }
    }

    const clearDBOperationErrors = () => setDBOperationError({ ...defaultDBOperationError });

    return (
        <DBOpContext.Provider value={{
            dbOperationError,
            clearDBOperationErrors,
            rescueDBOperation,
            rescueDBOperationBatch
        }}>
            {children}
        </DBOpContext.Provider>
    );
};
