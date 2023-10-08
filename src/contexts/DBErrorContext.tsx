import { ReactNode, useState, createContext, useContext, SetStateAction } from "react";
import { DBOperationError, defaultDBOperationError } from "@/app/graphql-helpers/graphql-errors";


type DBErrorContextType = {
    dbOperationError: DBOperationError,
    setDBOperationError: React.Dispatch<SetStateAction<DBOperationError>>;
};

const dbOpErrorContextDefaultValues: DBErrorContextType = {
    dbOperationError: defaultDBOperationError,
    setDBOperationError: () => { }
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


    const value = {
        dbOperationError,
        setDBOperationError
    };

    return (
        <DBOpContext.Provider value={value}>
            {children}
        </DBOpContext.Provider>
    );
};
