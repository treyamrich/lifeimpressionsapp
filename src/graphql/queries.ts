/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getTShirt = /* GraphQL */ `query GetTShirt($id: ID!) {
  getTShirt(id: $id) {
    id
    styleNumber
    brand
    color
    size
    type
    quantityOnHand
    isDeleted
    indexField
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetTShirtQueryVariables, APITypes.GetTShirtQuery>;
export const listTShirts = /* GraphQL */ `query ListTShirts(
  $id: ID
  $filter: ModelTShirtFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listTShirts(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      styleNumber
      brand
      color
      size
      type
      quantityOnHand
      isDeleted
      indexField
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTShirtsQueryVariables,
  APITypes.ListTShirtsQuery
>;
export const tshirtsByStyleNumber = /* GraphQL */ `query TshirtsByStyleNumber(
  $styleNumber: String!
  $quantityOnHand: ModelIntKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelTShirtFilterInput
  $limit: Int
  $nextToken: String
) {
  tshirtsByStyleNumber(
    styleNumber: $styleNumber
    quantityOnHand: $quantityOnHand
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      styleNumber
      brand
      color
      size
      type
      quantityOnHand
      isDeleted
      indexField
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.TshirtsByStyleNumberQueryVariables,
  APITypes.TshirtsByStyleNumberQuery
>;
export const tshirtsByQty = /* GraphQL */ `query TshirtsByQty(
  $indexField: String!
  $quantityOnHand: ModelIntKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelTShirtFilterInput
  $limit: Int
  $nextToken: String
) {
  tshirtsByQty(
    indexField: $indexField
    quantityOnHand: $quantityOnHand
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      styleNumber
      brand
      color
      size
      type
      quantityOnHand
      isDeleted
      indexField
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.TshirtsByQtyQueryVariables,
  APITypes.TshirtsByQtyQuery
>;
export const getPurchaseOrder = /* GraphQL */ `query GetPurchaseOrder($id: ID!) {
  getPurchaseOrder(id: $id) {
    id
    orderNumber
    vendor
    orderedItems {
      items {
        tshirt {
          id
          styleNumber
          brand
          color
          size
          type
          quantityOnHand
          isDeleted
          indexField
          createdAt
          updatedAt
          __typename
        }
        quantity
        costPerUnit
        amountReceived
        receivals {
          timestamp
          quantity
          __typename
        }
        earliestTransaction
        latestTransaction
        indexField
        updatedAt
        isDeleted
        id
        createdAt
        purchaseOrderOrderedItemsId
        customerOrderOrderedItemsId
        tShirtOrderTshirtId
        __typename
      }
      nextToken
      __typename
    }
    orderNotes
    status
    changeHistory {
      items {
        tshirt {
          id
          styleNumber
          brand
          color
          size
          type
          quantityOnHand
          isDeleted
          indexField
          createdAt
          updatedAt
          __typename
        }
        reason
        fieldChanges {
          oldValue
          newValue
          fieldName
          __typename
        }
        createdAt
        indexField
        id
        updatedAt
        purchaseOrderChangeHistoryId
        customerOrderChangeHistoryId
        orderChangeTshirtId
        __typename
      }
      nextToken
      __typename
    }
    taxRate
    shipping
    shippingAddress
    fees
    dateExpected
    isDeleted
    type
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetPurchaseOrderQueryVariables,
  APITypes.GetPurchaseOrderQuery
>;
export const listPurchaseOrders = /* GraphQL */ `query ListPurchaseOrders(
  $id: ID
  $filter: ModelPurchaseOrderFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listPurchaseOrders(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      orderNumber
      vendor
      orderedItems {
        items {
          tshirt {
            id
            styleNumber
            brand
            color
            size
            type
            quantityOnHand
            isDeleted
            indexField
            createdAt
            updatedAt
            __typename
          }
          quantity
          costPerUnit
          amountReceived
          receivals {
            timestamp
            quantity
            __typename
          }
          earliestTransaction
          latestTransaction
          indexField
          updatedAt
          isDeleted
          id
          createdAt
          purchaseOrderOrderedItemsId
          customerOrderOrderedItemsId
          tShirtOrderTshirtId
          __typename
        }
        nextToken
        __typename
      }
      orderNotes
      status
      changeHistory {
        items {
          tshirt {
            id
            styleNumber
            brand
            color
            size
            type
            quantityOnHand
            isDeleted
            indexField
            createdAt
            updatedAt
            __typename
          }
          reason
          fieldChanges {
            oldValue
            newValue
            fieldName
            __typename
          }
          createdAt
          indexField
          id
          updatedAt
          purchaseOrderChangeHistoryId
          customerOrderChangeHistoryId
          orderChangeTshirtId
          __typename
        }
        nextToken
        __typename
      }
      taxRate
      shipping
      shippingAddress
      fees
      dateExpected
      isDeleted
      type
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListPurchaseOrdersQueryVariables,
  APITypes.ListPurchaseOrdersQuery
>;
export const purchaseOrdersByCreatedAt = /* GraphQL */ `query PurchaseOrdersByCreatedAt(
  $type: String!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelPurchaseOrderFilterInput
  $limit: Int
  $nextToken: String
) {
  purchaseOrdersByCreatedAt(
    type: $type
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      orderNumber
      vendor
      orderedItems {
        items {
          tshirt {
            id
            styleNumber
            brand
            color
            size
            type
            quantityOnHand
            isDeleted
            indexField
            createdAt
            updatedAt
            __typename
          }
          quantity
          costPerUnit
          amountReceived
          receivals {
            timestamp
            quantity
            __typename
          }
          earliestTransaction
          latestTransaction
          indexField
          updatedAt
          isDeleted
          id
          createdAt
          purchaseOrderOrderedItemsId
          customerOrderOrderedItemsId
          tShirtOrderTshirtId
          __typename
        }
        nextToken
        __typename
      }
      orderNotes
      status
      changeHistory {
        items {
          tshirt {
            id
            styleNumber
            brand
            color
            size
            type
            quantityOnHand
            isDeleted
            indexField
            createdAt
            updatedAt
            __typename
          }
          reason
          fieldChanges {
            oldValue
            newValue
            fieldName
            __typename
          }
          createdAt
          indexField
          id
          updatedAt
          purchaseOrderChangeHistoryId
          customerOrderChangeHistoryId
          orderChangeTshirtId
          __typename
        }
        nextToken
        __typename
      }
      taxRate
      shipping
      shippingAddress
      fees
      dateExpected
      isDeleted
      type
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.PurchaseOrdersByCreatedAtQueryVariables,
  APITypes.PurchaseOrdersByCreatedAtQuery
>;
export const getOrderChange = /* GraphQL */ `query GetOrderChange($id: ID!) {
  getOrderChange(id: $id) {
    tshirt {
      id
      styleNumber
      brand
      color
      size
      type
      quantityOnHand
      isDeleted
      indexField
      createdAt
      updatedAt
      __typename
    }
    reason
    fieldChanges {
      oldValue
      newValue
      fieldName
      __typename
    }
    createdAt
    indexField
    id
    updatedAt
    purchaseOrderChangeHistoryId
    customerOrderChangeHistoryId
    orderChangeTshirtId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetOrderChangeQueryVariables,
  APITypes.GetOrderChangeQuery
>;
export const listOrderChanges = /* GraphQL */ `query ListOrderChanges(
  $filter: ModelOrderChangeFilterInput
  $limit: Int
  $nextToken: String
) {
  listOrderChanges(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      tshirt {
        id
        styleNumber
        brand
        color
        size
        type
        quantityOnHand
        isDeleted
        indexField
        createdAt
        updatedAt
        __typename
      }
      reason
      fieldChanges {
        oldValue
        newValue
        fieldName
        __typename
      }
      createdAt
      indexField
      id
      updatedAt
      purchaseOrderChangeHistoryId
      customerOrderChangeHistoryId
      orderChangeTshirtId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListOrderChangesQueryVariables,
  APITypes.ListOrderChangesQuery
>;
export const orderChangesByCreatedAt = /* GraphQL */ `query OrderChangesByCreatedAt(
  $indexField: String!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelOrderChangeFilterInput
  $limit: Int
  $nextToken: String
) {
  orderChangesByCreatedAt(
    indexField: $indexField
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      tshirt {
        id
        styleNumber
        brand
        color
        size
        type
        quantityOnHand
        isDeleted
        indexField
        createdAt
        updatedAt
        __typename
      }
      reason
      fieldChanges {
        oldValue
        newValue
        fieldName
        __typename
      }
      createdAt
      indexField
      id
      updatedAt
      purchaseOrderChangeHistoryId
      customerOrderChangeHistoryId
      orderChangeTshirtId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.OrderChangesByCreatedAtQueryVariables,
  APITypes.OrderChangesByCreatedAtQuery
>;
export const getTShirtOrder = /* GraphQL */ `query GetTShirtOrder($id: ID!) {
  getTShirtOrder(id: $id) {
    tshirt {
      id
      styleNumber
      brand
      color
      size
      type
      quantityOnHand
      isDeleted
      indexField
      createdAt
      updatedAt
      __typename
    }
    quantity
    costPerUnit
    amountReceived
    receivals {
      timestamp
      quantity
      __typename
    }
    earliestTransaction
    latestTransaction
    indexField
    updatedAt
    isDeleted
    id
    createdAt
    purchaseOrderOrderedItemsId
    customerOrderOrderedItemsId
    tShirtOrderTshirtId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetTShirtOrderQueryVariables,
  APITypes.GetTShirtOrderQuery
>;
export const listTShirtOrders = /* GraphQL */ `query ListTShirtOrders(
  $filter: ModelTShirtOrderFilterInput
  $limit: Int
  $nextToken: String
) {
  listTShirtOrders(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      tshirt {
        id
        styleNumber
        brand
        color
        size
        type
        quantityOnHand
        isDeleted
        indexField
        createdAt
        updatedAt
        __typename
      }
      quantity
      costPerUnit
      amountReceived
      receivals {
        timestamp
        quantity
        __typename
      }
      earliestTransaction
      latestTransaction
      indexField
      updatedAt
      isDeleted
      id
      createdAt
      purchaseOrderOrderedItemsId
      customerOrderOrderedItemsId
      tShirtOrderTshirtId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTShirtOrdersQueryVariables,
  APITypes.ListTShirtOrdersQuery
>;
export const tshirtTransactionQueues = /* GraphQL */ `query TshirtTransactionQueues(
  $indexField: String!
  $earliestTransaction: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelTShirtOrderFilterInput
  $limit: Int
  $nextToken: String
) {
  tshirtTransactionQueues(
    indexField: $indexField
    earliestTransaction: $earliestTransaction
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      tshirt {
        id
        styleNumber
        brand
        color
        size
        type
        quantityOnHand
        isDeleted
        indexField
        createdAt
        updatedAt
        __typename
      }
      quantity
      costPerUnit
      amountReceived
      receivals {
        timestamp
        quantity
        __typename
      }
      earliestTransaction
      latestTransaction
      indexField
      updatedAt
      isDeleted
      id
      createdAt
      purchaseOrderOrderedItemsId
      customerOrderOrderedItemsId
      tShirtOrderTshirtId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.TshirtTransactionQueuesQueryVariables,
  APITypes.TshirtTransactionQueuesQuery
>;
export const getCustomerOrder = /* GraphQL */ `query GetCustomerOrder($id: ID!) {
  getCustomerOrder(id: $id) {
    id
    customerName
    customerEmail
    customerPhoneNumber
    orderedItems {
      items {
        tshirt {
          id
          styleNumber
          brand
          color
          size
          type
          quantityOnHand
          isDeleted
          indexField
          createdAt
          updatedAt
          __typename
        }
        quantity
        costPerUnit
        amountReceived
        receivals {
          timestamp
          quantity
          __typename
        }
        earliestTransaction
        latestTransaction
        indexField
        updatedAt
        isDeleted
        id
        createdAt
        purchaseOrderOrderedItemsId
        customerOrderOrderedItemsId
        tShirtOrderTshirtId
        __typename
      }
      nextToken
      __typename
    }
    orderNumber
    orderStatus
    orderNotes
    dateNeededBy
    changeHistory {
      items {
        tshirt {
          id
          styleNumber
          brand
          color
          size
          type
          quantityOnHand
          isDeleted
          indexField
          createdAt
          updatedAt
          __typename
        }
        reason
        fieldChanges {
          oldValue
          newValue
          fieldName
          __typename
        }
        createdAt
        indexField
        id
        updatedAt
        purchaseOrderChangeHistoryId
        customerOrderChangeHistoryId
        orderChangeTshirtId
        __typename
      }
      nextToken
      __typename
    }
    taxRate
    isDeleted
    type
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCustomerOrderQueryVariables,
  APITypes.GetCustomerOrderQuery
>;
export const listCustomerOrders = /* GraphQL */ `query ListCustomerOrders(
  $id: ID
  $filter: ModelCustomerOrderFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listCustomerOrders(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      customerName
      customerEmail
      customerPhoneNumber
      orderedItems {
        items {
          tshirt {
            id
            styleNumber
            brand
            color
            size
            type
            quantityOnHand
            isDeleted
            indexField
            createdAt
            updatedAt
            __typename
          }
          quantity
          costPerUnit
          amountReceived
          receivals {
            timestamp
            quantity
            __typename
          }
          earliestTransaction
          latestTransaction
          indexField
          updatedAt
          isDeleted
          id
          createdAt
          purchaseOrderOrderedItemsId
          customerOrderOrderedItemsId
          tShirtOrderTshirtId
          __typename
        }
        nextToken
        __typename
      }
      orderNumber
      orderStatus
      orderNotes
      dateNeededBy
      changeHistory {
        items {
          tshirt {
            id
            styleNumber
            brand
            color
            size
            type
            quantityOnHand
            isDeleted
            indexField
            createdAt
            updatedAt
            __typename
          }
          reason
          fieldChanges {
            oldValue
            newValue
            fieldName
            __typename
          }
          createdAt
          indexField
          id
          updatedAt
          purchaseOrderChangeHistoryId
          customerOrderChangeHistoryId
          orderChangeTshirtId
          __typename
        }
        nextToken
        __typename
      }
      taxRate
      isDeleted
      type
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCustomerOrdersQueryVariables,
  APITypes.ListCustomerOrdersQuery
>;
export const customerOrdersByCreatedAt = /* GraphQL */ `query CustomerOrdersByCreatedAt(
  $type: String!
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelCustomerOrderFilterInput
  $limit: Int
  $nextToken: String
) {
  customerOrdersByCreatedAt(
    type: $type
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      customerName
      customerEmail
      customerPhoneNumber
      orderedItems {
        items {
          tshirt {
            id
            styleNumber
            brand
            color
            size
            type
            quantityOnHand
            isDeleted
            indexField
            createdAt
            updatedAt
            __typename
          }
          quantity
          costPerUnit
          amountReceived
          receivals {
            timestamp
            quantity
            __typename
          }
          earliestTransaction
          latestTransaction
          indexField
          updatedAt
          isDeleted
          id
          createdAt
          purchaseOrderOrderedItemsId
          customerOrderOrderedItemsId
          tShirtOrderTshirtId
          __typename
        }
        nextToken
        __typename
      }
      orderNumber
      orderStatus
      orderNotes
      dateNeededBy
      changeHistory {
        items {
          tshirt {
            id
            styleNumber
            brand
            color
            size
            type
            quantityOnHand
            isDeleted
            indexField
            createdAt
            updatedAt
            __typename
          }
          reason
          fieldChanges {
            oldValue
            newValue
            fieldName
            __typename
          }
          createdAt
          indexField
          id
          updatedAt
          purchaseOrderChangeHistoryId
          customerOrderChangeHistoryId
          orderChangeTshirtId
          __typename
        }
        nextToken
        __typename
      }
      taxRate
      isDeleted
      type
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.CustomerOrdersByCreatedAtQueryVariables,
  APITypes.CustomerOrdersByCreatedAtQuery
>;
export const getInventoryValueCache = /* GraphQL */ `query GetInventoryValueCache($createdAt: AWSDate!) {
  getInventoryValueCache(createdAt: $createdAt) {
    lastItemValues {
      aggregateValue
      itemId
      tshirtStyleNumber
      tshirtColor
      tshirtSize
      poQueueHead
      poQueueHeadQtyRemain
      coQueueHead
      coQueueHeadQtyRemain
      numUnsold
      inventoryQty
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetInventoryValueCacheQueryVariables,
  APITypes.GetInventoryValueCacheQuery
>;
export const listInventoryValueCaches = /* GraphQL */ `query ListInventoryValueCaches(
  $createdAt: AWSDate
  $filter: ModelInventoryValueCacheFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listInventoryValueCaches(
    createdAt: $createdAt
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      lastItemValues {
        aggregateValue
        itemId
        tshirtStyleNumber
        tshirtColor
        tshirtSize
        poQueueHead
        poQueueHeadQtyRemain
        coQueueHead
        coQueueHeadQtyRemain
        numUnsold
        inventoryQty
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListInventoryValueCachesQueryVariables,
  APITypes.ListInventoryValueCachesQuery
>;
export const getCacheExpiration = /* GraphQL */ `query GetCacheExpiration($id: String!) {
  getCacheExpiration(id: $id) {
    id
    earliestExpiredDate
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCacheExpirationQueryVariables,
  APITypes.GetCacheExpirationQuery
>;
export const listCacheExpirations = /* GraphQL */ `query ListCacheExpirations(
  $id: String
  $filter: ModelCacheExpirationFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listCacheExpirations(
    id: $id
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      earliestExpiredDate
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCacheExpirationsQueryVariables,
  APITypes.ListCacheExpirationsQuery
>;
