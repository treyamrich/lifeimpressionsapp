import { Page } from "@/api/types";
import { InfiniteData, QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

export type RefetchFunction<T> = (options?: RefetchOptions) => Promise<QueryObserverResult<InfiniteData<Page<T>>, Error>>;