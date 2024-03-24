export const getPurchaseOrderMin = /* GraphQL */ `
  query GetPurchaseOrder($id: ID!) {
    getPurchaseOrder(id: $id) {
      id
      orderNumber
      isDeleted
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const getCustomerOrderMin = /* GraphQL */ `
  query GetCustomerOrder($id: ID!) {
    getCustomerOrder(id: $id) {
      id
      orderNumber
      isDeleted
      createdAt
      updatedAt
      __typename
    }
  }
`;