/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateTShirt = /* GraphQL */ `
  subscription OnCreateTShirt($filter: ModelSubscriptionTShirtFilterInput) {
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
`;
export const onUpdateTShirt = /* GraphQL */ `
  subscription OnUpdateTShirt($filter: ModelSubscriptionTShirtFilterInput) {
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
`;
export const onDeleteTShirt = /* GraphQL */ `
  subscription OnDeleteTShirt($filter: ModelSubscriptionTShirtFilterInput) {
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
`;
export const onCreatePurchaseOrder = /* GraphQL */ `
  subscription OnCreatePurchaseOrder(
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
          costPerUnit
          discount
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
      discount
      dateExpected
      isDeleted
      type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdatePurchaseOrder = /* GraphQL */ `
  subscription OnUpdatePurchaseOrder(
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
          costPerUnit
          discount
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
      discount
      dateExpected
      isDeleted
      type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeletePurchaseOrder = /* GraphQL */ `
  subscription OnDeletePurchaseOrder(
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
          costPerUnit
          discount
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
      discount
      dateExpected
      isDeleted
      type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateOrderChange = /* GraphQL */ `
  subscription OnCreateOrderChange(
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
`;
export const onUpdateOrderChange = /* GraphQL */ `
  subscription OnUpdateOrderChange(
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
`;
export const onDeleteOrderChange = /* GraphQL */ `
  subscription OnDeleteOrderChange(
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
`;
export const onCreateTShirtOrder = /* GraphQL */ `
  subscription OnCreateTShirtOrder(
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
      costPerUnit
      discount
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
export const onUpdateTShirtOrder = /* GraphQL */ `
  subscription OnUpdateTShirtOrder(
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
      costPerUnit
      discount
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
export const onDeleteTShirtOrder = /* GraphQL */ `
  subscription OnDeleteTShirtOrder(
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
      costPerUnit
      discount
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
export const onCreateCustomerOrder = /* GraphQL */ `
  subscription OnCreateCustomerOrder(
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
          costPerUnit
          discount
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
      discount
      isDeleted
      type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateCustomerOrder = /* GraphQL */ `
  subscription OnUpdateCustomerOrder(
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
          costPerUnit
          discount
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
      discount
      isDeleted
      type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteCustomerOrder = /* GraphQL */ `
  subscription OnDeleteCustomerOrder(
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
          costPerUnit
          discount
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
      discount
      isDeleted
      type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateInventoryValueCache = /* GraphQL */ `
  subscription OnCreateInventoryValueCache(
    $filter: ModelSubscriptionInventoryValueCacheFilterInput
  ) {
    onCreateInventoryValueCache(filter: $filter) {
      id
      lastItemValues {
        aggregateValue
        itemId
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
export const onUpdateInventoryValueCache = /* GraphQL */ `
  subscription OnUpdateInventoryValueCache(
    $filter: ModelSubscriptionInventoryValueCacheFilterInput
  ) {
    onUpdateInventoryValueCache(filter: $filter) {
      id
      lastItemValues {
        aggregateValue
        itemId
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
export const onDeleteInventoryValueCache = /* GraphQL */ `
  subscription OnDeleteInventoryValueCache(
    $filter: ModelSubscriptionInventoryValueCacheFilterInput
  ) {
    onDeleteInventoryValueCache(filter: $filter) {
      id
      lastItemValues {
        aggregateValue
        itemId
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
