from clients.graphql_client import Query

listTShirtOrders = Query(
    'listTShirtOrders',
    """
query ListTShirtOrders(
    $filter: ModelTShirtOrderFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTShirtOrders(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        tShirtOrderTshirtId
        indexField
      }
      nextToken
    }
  }
    """
)

listOrderChanges = Query(
    'listOrderChanges',
    """
query ListOrderChanges(
    $filter: ModelOrderChangeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOrderChanges(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        indexField
        id
        purchaseOrderChangeHistoryId
        customerOrderChangeHistoryId
      }
      nextToken
    }
  }
"""
)

getPurchaseOrderIDsOnly = Query(
    'getPurchaseOrder',
    """
query GetPurchaseOrder($id: ID!) {
    getPurchaseOrder(id: $id) {
      id
      orderedItems {
        items {
          id
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }"""
)

getCustomerOrderIDsOnly = Query(
    'getCustomerOrder',
    """
query GetCustomerOrder($id: ID!) {
    getCustomerOrder(id: $id) {
      id
      orderedItems {
        items {
          id
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }"""
)