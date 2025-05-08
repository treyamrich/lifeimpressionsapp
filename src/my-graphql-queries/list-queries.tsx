// Excludes the change history
const listCustomerOrdersFieldsOnly = `
{
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
`;

export const customerOrderByCustomerNameMinimum = /* GraphQL */ `
  query CustomerOrderByCustomerName(
    $customerName: String!
    $sortDirection: ModelSortDirection
    $filter: ModelCustomerOrderFilterInput
    $limit: Int
    $nextToken: String
  ) {
    customerOrderByCustomerName(
      customerName: $customerName
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) 
    ${listCustomerOrdersFieldsOnly}
    }
`;

// Excludes the change history
export const customerOrdersByCreatedAtMinimum = /* GraphQL */ `
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
    )
    ${listCustomerOrdersFieldsOnly}
    }
`;

// Excludes the change history
export const purchaseOrdersByCreatedAtMinimum = /* GraphQL */ `
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