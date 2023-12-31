import { ReactNode, useState, createContext, useContext, SetStateAction } from "react";

export enum DBOperation {
    CREATE = "Create",
    UPDATE = "Update",
    LIST = "List",
    GET = "Get",
    DELETE = "Delete",
}

export interface DBOperationError {
    operationName: DBOperation;
    errorMessage: string | undefined;
}

export const defaultDBOperationError: DBOperationError = {
    operationName: DBOperation.CREATE,
    errorMessage: undefined,
};


type DBErrorContextType = {
    dbOperationError: DBOperationError,
    clearDBOperationErrors: () => void;
    rescueDBOperation: (func: () => void,
        operation: DBOperation,
        onSuccess: any,
        customErrorMessage?: string) => void
};

const dbOpErrorContextDefaultValues: DBErrorContextType = {
    dbOperationError: defaultDBOperationError,
    clearDBOperationErrors: () => { },
    rescueDBOperation: () => { }
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

    const clearDBOperationErrors = () => setDBOperationError({ ...defaultDBOperationError });

    return (
        <DBOpContext.Provider value={{
            dbOperationError,
            clearDBOperationErrors,
            rescueDBOperation
        }}>
            {children}
        </DBOpContext.Provider>
    );
};
