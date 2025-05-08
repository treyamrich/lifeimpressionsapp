import { EntityType } from "@/app/(DashboardLayout)/components/po-customer-order-shared-components/CreateOrderPage";
import { queryClient } from "./query-client";
import { InfiniteData } from "@tanstack/react-query";
import { OrderChange, TShirt } from "@/API";
import { Page } from "../types";
import { LRUCache } from "./lru-cache";
import { listOrderChangeHistoryBaseQueryKey, listTShirtBaseQueryKey } from "./list-hooks";

function mutateFirstPageItems<T>(
  data: InfiniteData<Page<T>> | undefined,
  mutator: (pageItems: T[]) => T[]
) {
  if (data && data.pages.length > 0) {
    const firstPage = {
      ...data.pages[0],
      items: mutator(data.pages[0].items),
    };
    return {
      ...data,
      pages: data.pages.map((page, index) => (index === 0 ? firstPage : page)),
    };
  }
  return data;
}

function replaceItemHelper<T>(
  data: InfiniteData<Page<T>> | undefined,
  isItemToReplace: (item: T) => boolean,
  newItem: T
) {
  if (!data) return data;
  const newPages = data.pages.map((page) => {
    const newItems = page.items.map((item) =>
      isItemToReplace(item) ? newItem : item
    );
    return {
      ...page,
      items: newItems,
    };
  });
  return {
    ...data,
    pages: newPages,
  };
}

function deleteItemHelper<T>(
  data: InfiniteData<Page<T>> | undefined,
  isItemToDelete: (item: T) => boolean
) {
  if (!data) return data;
  const newPages = data.pages.map((page) => {
    const newItems = page.items.filter((item) => !isItemToDelete(item));
    return {
      ...page,
      items: newItems,
    };
  });
  return {
    ...data,
    pages: newPages,
  };
}

export const prependOrderChangeHistory = ({
  orderId,
  orderType,
  newOrderChanges,
}: {
  orderId: string;
  orderType?: EntityType;
  newOrderChanges: OrderChange[];
}) =>
  queryClient.setQueryData<InfiniteData<Page<OrderChange>>>(
    [listOrderChangeHistoryBaseQueryKey, orderId, orderType],
    (data) =>
      mutateFirstPageItems<OrderChange>(data, (firstPageItems) => [
        ...newOrderChanges,
        ...firstPageItems,
      ])
  );

/*
  Only for addTShirtMutation() query caches must be cleared because 
  there could be multiple cache-key lists for different searches 
  made by styleNumber. It would be complicated to also conditionally 
  insert the tshirt into the correct cache-key list.
*/
export const addTShirtMutation = (
  tshirt: TShirt,
  lruCache: LRUCache<string>,
  resetStyleNoFilter: () => void
) => {
  resetStyleNoFilter();
  lruCache.evictAll();

  queryClient.setQueryData<InfiniteData<Page<TShirt>>>(
    [listTShirtBaseQueryKey, ""],
    (data) => {
      if (!data) return data;

      // Insert the new tshirt in the order of quantityOnHand
      let inserted = false;
      const newPages = data.pages.map((page) => {
        if (inserted) return page;

        const newItems: TShirt[] = [];
        page.items.forEach((tshirtI) => {
          if (!inserted && tshirt.quantityOnHand <= tshirtI.quantityOnHand) {
            newItems.push(tshirt);
            inserted = true;
          }
          newItems.push(tshirtI);
        });

        return {
          ...page,
          items: newItems,
        };
      });
      return {
        ...data,
        pages: newPages,
      };
    }
  );
};


export const editTShirtMutation = (
  newTShirt: TShirt,
  lruCache: LRUCache<string>,
) => {
  /* 
    Optimistically update. Check all cache keys and try to replace the item.
  */
  const subKeysToUpdate = ["", ...lruCache.keys()];
  subKeysToUpdate.forEach((subKey: string) => {
    queryClient.setQueryData<InfiniteData<Page<TShirt>>>(
      [listTShirtBaseQueryKey, subKey],
      (data) =>
        replaceItemHelper<TShirt>(
          data,
          (item) => item.id === newTShirt.id,
          newTShirt
        )
    );
  });
};

export const deleteTShirtMutation = (
  tshirtId: string,
  lruCache: LRUCache<string>,
) => {
  /* 
    Optimistically update. Check all cache keys and try to delete the item.
  */
  const subKeysToUpdate = ["", ...lruCache.keys()];
  subKeysToUpdate.forEach((subKey: string) => {
    queryClient.setQueryData<InfiniteData<Page<TShirt>>>(
      [listTShirtBaseQueryKey, subKey],
      (data) =>
        deleteItemHelper<TShirt>(
          data,
          (item) => item.id === tshirtId
        )
    );
  });
};