/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTShirt = /* GraphQL */ `
  query GetTShirt($id: ID!) {
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
`;
export const listTShirts = /* GraphQL */ `
  query ListTShirts(
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
`;
export const tshirtsByQty = /* GraphQL */ `
  query TshirtsByQty(
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
`;
export const getPurchaseOrder = /* GraphQL */ `
  query GetPurchaseOrder($id: ID!) {
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
          amountReceived
          receivals {
            timestamp
            quantity
            __typename
          }
          costPerUnit
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
`;
export const listPurchaseOrders = /* GraphQL */ `
  query ListPurchaseOrders(
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
            amountReceived
            receivals {
              timestamp
              quantity
              __typename
            }
            costPerUnit
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
`;
export const purchaseOrdersByCreatedAt = /* GraphQL */ `
  query PurchaseOrdersByCreatedAt(
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
            amountReceived
            receivals {
              timestamp
              quantity
              __typename
            }
            costPerUnit
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
`;
export const getOrderChange = /* GraphQL */ `
  query GetOrderChange($id: ID!) {
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
`;
export const listOrderChanges = /* GraphQL */ `
  query ListOrderChanges(
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
`;
export const orderChangesByCreatedAt = /* GraphQL */ `
  query OrderChangesByCreatedAt(
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
`;
export const getTShirtOrder = /* GraphQL */ `
  query GetTShirtOrder($id: ID!) {
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
      amountReceived
      receivals {
        timestamp
        quantity
        __typename
      }
      costPerUnit
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
`;
export const listTShirtOrders = /* GraphQL */ `
  query ListTShirtOrders(
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
        amountReceived
        receivals {
          timestamp
          quantity
          __typename
        }
        costPerUnit
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
`;
export const tshirtOrderByUpdatedAt = /* GraphQL */ `
  query TshirtOrderByUpdatedAt(
    $indexField: String!
    $updatedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelTShirtOrderFilterInput
    $limit: Int
    $nextToken: String
  ) {
    tshirtOrderByUpdatedAt(
      indexField: $indexField
      updatedAt: $updatedAt
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
        amountReceived
        receivals {
          timestamp
          quantity
          __typename
        }
        costPerUnit
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
`;
export const getCustomerOrder = /* GraphQL */ `
  query GetCustomerOrder($id: ID!) {
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
          amountReceived
          receivals {
            timestamp
            quantity
            __typename
          }
          costPerUnit
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
`;
export const listCustomerOrders = /* GraphQL */ `
  query ListCustomerOrders(
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
            amountReceived
            receivals {
              timestamp
              quantity
              __typename
            }
            costPerUnit
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
`;
export const customerOrdersByCreatedAt = /* GraphQL */ `
  query CustomerOrdersByCreatedAt(
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
            amountReceived
            receivals {
              timestamp
              quantity
              __typename
            }
            costPerUnit
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
`;
export const getInventoryValueCache = /* GraphQL */ `
  query GetInventoryValueCache($createdAt: AWSDate!) {
    getInventoryValueCache(createdAt: $createdAt) {
      lastItemValues {
        aggregateValue
        itemId
        tshirtStyleNumber
        tshirtColor
        tshirtSize
        earliestUnsold
        numUnsold
        inventoryQty
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listInventoryValueCaches = /* GraphQL */ `
  query ListInventoryValueCaches(
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
          earliestUnsold
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
`;
export const getCacheExpiration = /* GraphQL */ `
  query GetCacheExpiration($id: String!) {
    getCacheExpiration(id: $id) {
      id
      earliestExpiredDate
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listCacheExpirations = /* GraphQL */ `
  query ListCacheExpirations(
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
`;
