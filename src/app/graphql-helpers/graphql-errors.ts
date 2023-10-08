import { useDBOperationContext } from "@/contexts/DBErrorContext";

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

const { setDBOperationError } = useDBOperationContext();

export const rescueDBOperation = async (
  func: any,
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
