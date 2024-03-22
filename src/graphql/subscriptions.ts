/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateTShirt = /* GraphQL */ `subscription OnCreateTShirt($filter: ModelSubscriptionTShirtFilterInput) {
  onCreateTShirt(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateTShirtSubscriptionVariables,
  APITypes.OnCreateTShirtSubscription
>;
export const onUpdateTShirt = /* GraphQL */ `subscription OnUpdateTShirt($filter: ModelSubscriptionTShirtFilterInput) {
  onUpdateTShirt(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateTShirtSubscriptionVariables,
  APITypes.OnUpdateTShirtSubscription
>;
export const onDeleteTShirt = /* GraphQL */ `subscription OnDeleteTShirt($filter: ModelSubscriptionTShirtFilterInput) {
  onDeleteTShirt(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteTShirtSubscriptionVariables,
  APITypes.OnDeleteTShirtSubscription
>;
export const onCreatePurchaseOrder = /* GraphQL */ `subscription OnCreatePurchaseOrder(
  $filter: ModelSubscriptionPurchaseOrderFilterInput
) {
  onCreatePurchaseOrder(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreatePurchaseOrderSubscriptionVariables,
  APITypes.OnCreatePurchaseOrderSubscription
>;
export const onUpdatePurchaseOrder = /* GraphQL */ `subscription OnUpdatePurchaseOrder(
  $filter: ModelSubscriptionPurchaseOrderFilterInput
) {
  onUpdatePurchaseOrder(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdatePurchaseOrderSubscriptionVariables,
  APITypes.OnUpdatePurchaseOrderSubscription
>;
export const onDeletePurchaseOrder = /* GraphQL */ `subscription OnDeletePurchaseOrder(
  $filter: ModelSubscriptionPurchaseOrderFilterInput
) {
  onDeletePurchaseOrder(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeletePurchaseOrderSubscriptionVariables,
  APITypes.OnDeletePurchaseOrderSubscription
>;
export const onCreateOrderChange = /* GraphQL */ `subscription OnCreateOrderChange(
  $filter: ModelSubscriptionOrderChangeFilterInput
) {
  onCreateOrderChange(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateOrderChangeSubscriptionVariables,
  APITypes.OnCreateOrderChangeSubscription
>;
export const onUpdateOrderChange = /* GraphQL */ `subscription OnUpdateOrderChange(
  $filter: ModelSubscriptionOrderChangeFilterInput
) {
  onUpdateOrderChange(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateOrderChangeSubscriptionVariables,
  APITypes.OnUpdateOrderChangeSubscription
>;
export const onDeleteOrderChange = /* GraphQL */ `subscription OnDeleteOrderChange(
  $filter: ModelSubscriptionOrderChangeFilterInput
) {
  onDeleteOrderChange(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteOrderChangeSubscriptionVariables,
  APITypes.OnDeleteOrderChangeSubscription
>;
export const onCreateTShirtOrder = /* GraphQL */ `subscription OnCreateTShirtOrder(
  $filter: ModelSubscriptionTShirtOrderFilterInput
) {
  onCreateTShirtOrder(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateTShirtOrderSubscriptionVariables,
  APITypes.OnCreateTShirtOrderSubscription
>;
export const onUpdateTShirtOrder = /* GraphQL */ `subscription OnUpdateTShirtOrder(
  $filter: ModelSubscriptionTShirtOrderFilterInput
) {
  onUpdateTShirtOrder(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateTShirtOrderSubscriptionVariables,
  APITypes.OnUpdateTShirtOrderSubscription
>;
export const onDeleteTShirtOrder = /* GraphQL */ `subscription OnDeleteTShirtOrder(
  $filter: ModelSubscriptionTShirtOrderFilterInput
) {
  onDeleteTShirtOrder(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteTShirtOrderSubscriptionVariables,
  APITypes.OnDeleteTShirtOrderSubscription
>;
export const onCreateCustomerOrder = /* GraphQL */ `subscription OnCreateCustomerOrder(
  $filter: ModelSubscriptionCustomerOrderFilterInput
) {
  onCreateCustomerOrder(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateCustomerOrderSubscriptionVariables,
  APITypes.OnCreateCustomerOrderSubscription
>;
export const onUpdateCustomerOrder = /* GraphQL */ `subscription OnUpdateCustomerOrder(
  $filter: ModelSubscriptionCustomerOrderFilterInput
) {
  onUpdateCustomerOrder(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateCustomerOrderSubscriptionVariables,
  APITypes.OnUpdateCustomerOrderSubscription
>;
export const onDeleteCustomerOrder = /* GraphQL */ `subscription OnDeleteCustomerOrder(
  $filter: ModelSubscriptionCustomerOrderFilterInput
) {
  onDeleteCustomerOrder(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteCustomerOrderSubscriptionVariables,
  APITypes.OnDeleteCustomerOrderSubscription
>;
export const onCreateInventoryValueCache = /* GraphQL */ `subscription OnCreateInventoryValueCache(
  $filter: ModelSubscriptionInventoryValueCacheFilterInput
) {
  onCreateInventoryValueCache(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateInventoryValueCacheSubscriptionVariables,
  APITypes.OnCreateInventoryValueCacheSubscription
>;
export const onUpdateInventoryValueCache = /* GraphQL */ `subscription OnUpdateInventoryValueCache(
  $filter: ModelSubscriptionInventoryValueCacheFilterInput
) {
  onUpdateInventoryValueCache(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateInventoryValueCacheSubscriptionVariables,
  APITypes.OnUpdateInventoryValueCacheSubscription
>;
export const onDeleteInventoryValueCache = /* GraphQL */ `subscription OnDeleteInventoryValueCache(
  $filter: ModelSubscriptionInventoryValueCacheFilterInput
) {
  onDeleteInventoryValueCache(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteInventoryValueCacheSubscriptionVariables,
  APITypes.OnDeleteInventoryValueCacheSubscription
>;
export const onCreateCacheExpiration = /* GraphQL */ `subscription OnCreateCacheExpiration(
  $filter: ModelSubscriptionCacheExpirationFilterInput
) {
  onCreateCacheExpiration(filter: $filter) {
    id
    earliestExpiredDate
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateCacheExpirationSubscriptionVariables,
  APITypes.OnCreateCacheExpirationSubscription
>;
export const onUpdateCacheExpiration = /* GraphQL */ `subscription OnUpdateCacheExpiration(
  $filter: ModelSubscriptionCacheExpirationFilterInput
) {
  onUpdateCacheExpiration(filter: $filter) {
    id
    earliestExpiredDate
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateCacheExpirationSubscriptionVariables,
  APITypes.OnUpdateCacheExpirationSubscription
>;
export const onDeleteCacheExpiration = /* GraphQL */ `subscription OnDeleteCacheExpiration(
  $filter: ModelSubscriptionCacheExpirationFilterInput
) {
  onDeleteCacheExpiration(filter: $filter) {
    id
    earliestExpiredDate
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteCacheExpirationSubscriptionVariables,
  APITypes.OnDeleteCacheExpirationSubscription
>;
