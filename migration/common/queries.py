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