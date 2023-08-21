/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTShirt = /* GraphQL */ `
  query GetTShirt($styleNumber: String!) {
    getTShirt(styleNumber: $styleNumber) {
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
    $styleNumber: String
    $filter: ModelTShirtFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listTShirts(
      styleNumber: $styleNumber
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      vendor
      orderedItems {
        items {
          quantity
          id
          createdAt
          updatedAt
          purchaseOrderOrderedItemsId
          customerOrderOrderedItemsId
          __typename
        }
        nextToken
        __typename
      }
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
        vendor
        orderedItems {
          nextToken
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
export const getTShirtOrder = /* GraphQL */ `
  query GetTShirtOrder($id: ID!) {
    getTShirtOrder(id: $id) {
      tshirt {
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
      id
      createdAt
      updatedAt
      purchaseOrderOrderedItemsId
      customerOrderOrderedItemsId
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
        id
        createdAt
        updatedAt
        purchaseOrderOrderedItemsId
        customerOrderOrderedItemsId
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
      contact {
        name
        email
        phoneNumber
        __typename
      }
      orderDate
      dateNeededBy
      orderedItems {
        items {
          quantity
          id
          createdAt
          updatedAt
          purchaseOrderOrderedItemsId
          customerOrderOrderedItemsId
          __typename
        }
        nextToken
        __typename
      }
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
        contact {
          name
          email
          phoneNumber
          __typename
        }
        orderDate
        dateNeededBy
        orderedItems {
          nextToken
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
