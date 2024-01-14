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
            createdAt
            updatedAt
            __typename
          }
          quantity
          amountReceived
          id
          createdAt
          updatedAt
          purchaseOrderOrderedItemsId
          customerOrderOrderedItemsId
          tShirtOrderTshirtId
          __typename
        }
        nextToken
        __typename
      }
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
            createdAt
            updatedAt
            __typename
          }
          quantityChange
          orderedQuantityChange
          reason
          id
          createdAt
          updatedAt
          purchaseOrderChangeHistoryId
          purchaseOrderChangeTshirtId
          __typename
        }
        nextToken
        __typename
      }
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
    $filter: ModelPurchaseOrderFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPurchaseOrders(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
              createdAt
              updatedAt
              __typename
            }
            quantity
            amountReceived
            id
            createdAt
            updatedAt
            purchaseOrderOrderedItemsId
            customerOrderOrderedItemsId
            tShirtOrderTshirtId
            __typename
          }
          nextToken
          __typename
        }
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
              createdAt
              updatedAt
              __typename
            }
            quantityChange
            orderedQuantityChange
            reason
            id
            createdAt
            updatedAt
            purchaseOrderChangeHistoryId
            purchaseOrderChangeTshirtId
            __typename
          }
          nextToken
          __typename
        }
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
              createdAt
              updatedAt
              __typename
            }
            quantity
            amountReceived
            id
            createdAt
            updatedAt
            purchaseOrderOrderedItemsId
            customerOrderOrderedItemsId
            tShirtOrderTshirtId
            __typename
          }
          nextToken
          __typename
        }
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
              createdAt
              updatedAt
              __typename
            }
            quantityChange
            orderedQuantityChange
            reason
            id
            createdAt
            updatedAt
            purchaseOrderChangeHistoryId
            purchaseOrderChangeTshirtId
            __typename
          }
          nextToken
          __typename
        }
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
export const getPurchaseOrderChange = /* GraphQL */ `
  query GetPurchaseOrderChange($id: ID!) {
    getPurchaseOrderChange(id: $id) {
      tshirt {
        id
        styleNumber
        brand
        color
        size
        type
        quantityOnHand
        isDeleted
        createdAt
        updatedAt
        __typename
      }
      quantityChange
      orderedQuantityChange
      reason
      id
      createdAt
      updatedAt
      purchaseOrderChangeHistoryId
      purchaseOrderChangeTshirtId
      __typename
    }
  }
`;
export const listPurchaseOrderChanges = /* GraphQL */ `
  query ListPurchaseOrderChanges(
    $filter: ModelPurchaseOrderChangeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPurchaseOrderChanges(
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
          createdAt
          updatedAt
          __typename
        }
        quantityChange
        orderedQuantityChange
        reason
        id
        createdAt
        updatedAt
        purchaseOrderChangeHistoryId
        purchaseOrderChangeTshirtId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCustomerOrderChange = /* GraphQL */ `
  query GetCustomerOrderChange($id: ID!) {
    getCustomerOrderChange(id: $id) {
      tshirt {
        id
        styleNumber
        brand
        color
        size
        type
        quantityOnHand
        isDeleted
        createdAt
        updatedAt
        __typename
      }
      orderedQuantityChange
      reason
      id
      createdAt
      updatedAt
      customerOrderChangeHistoryId
      customerOrderChangeTshirtId
      __typename
    }
  }
`;
export const listCustomerOrderChanges = /* GraphQL */ `
  query ListCustomerOrderChanges(
    $filter: ModelCustomerOrderChangeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCustomerOrderChanges(
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
          createdAt
          updatedAt
          __typename
        }
        orderedQuantityChange
        reason
        id
        createdAt
        updatedAt
        customerOrderChangeHistoryId
        customerOrderChangeTshirtId
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
        createdAt
        updatedAt
        __typename
      }
      quantity
      amountReceived
      id
      createdAt
      updatedAt
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
          createdAt
          updatedAt
          __typename
        }
        quantity
        amountReceived
        id
        createdAt
        updatedAt
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
            createdAt
            updatedAt
            __typename
          }
          quantity
          amountReceived
          id
          createdAt
          updatedAt
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
            createdAt
            updatedAt
            __typename
          }
          orderedQuantityChange
          reason
          id
          createdAt
          updatedAt
          customerOrderChangeHistoryId
          customerOrderChangeTshirtId
          __typename
        }
        nextToken
        __typename
      }
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
    $filter: ModelCustomerOrderFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCustomerOrders(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
              createdAt
              updatedAt
              __typename
            }
            quantity
            amountReceived
            id
            createdAt
            updatedAt
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
              createdAt
              updatedAt
              __typename
            }
            orderedQuantityChange
            reason
            id
            createdAt
            updatedAt
            customerOrderChangeHistoryId
            customerOrderChangeTshirtId
            __typename
          }
          nextToken
          __typename
        }
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
              createdAt
              updatedAt
              __typename
            }
            quantity
            amountReceived
            id
            createdAt
            updatedAt
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
              createdAt
              updatedAt
              __typename
            }
            orderedQuantityChange
            reason
            id
            createdAt
            updatedAt
            customerOrderChangeHistoryId
            customerOrderChangeTshirtId
            __typename
          }
          nextToken
          __typename
        }
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
