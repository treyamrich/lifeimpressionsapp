import { SetStateAction } from "react";
import { AsyncBatchItem, DBOperation, DBOperationError } from "./DBErrorContext";

export async function rescueDBOperationBatch<T>(
    setDBOperationError: React.Dispatch<SetStateAction<DBOperationError>>, 
    batchItems: AsyncBatchItem<T>[], 
    customMasterErrMsg?: string
) {
    let promises: any = [];
    let errors: DBOperationError[] = [];
    batchItems.forEach(item => {
        let promise = item.requestFn()
            .then((x) => {
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