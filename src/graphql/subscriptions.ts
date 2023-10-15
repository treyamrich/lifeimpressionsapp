/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateTShirt = /* GraphQL */ `
  subscription OnCreateTShirt($filter: ModelSubscriptionTShirtFilterInput) {
    onCreateTShirt(filter: $filter) {
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
export const onUpdateTShirt = /* GraphQL */ `
  subscription OnUpdateTShirt($filter: ModelSubscriptionTShirtFilterInput) {
    onUpdateTShirt(filter: $filter) {
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
export const onDeleteTShirt = /* GraphQL */ `
  subscription OnDeleteTShirt($filter: ModelSubscriptionTShirtFilterInput) {
    onDeleteTShirt(filter: $filter) {
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
          quantity
          amountReceived
          id
          createdAt
          updatedAt
          purchaseOrderOrderedItemsId
          customerOrderOrderedItemsId
          tShirtOrderTshirtStyleNumber
          __typename
        }
        nextToken
        __typename
      }
      status
      changeHistory {
        items {
          quantityChange
          orderedQuantityChange
          reason
          id
          createdAt
          updatedAt
          purchaseOrderChangeHistoryId
          purchaseOrderChangeTshirtStyleNumber
          __typename
        }
        nextToken
        __typename
      }
      isDeleted
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
          quantity
          amountReceived
          id
          createdAt
          updatedAt
          purchaseOrderOrderedItemsId
          customerOrderOrderedItemsId
          tShirtOrderTshirtStyleNumber
          __typename
        }
        nextToken
        __typename
      }
      status
      changeHistory {
        items {
          quantityChange
          orderedQuantityChange
          reason
          id
          createdAt
          updatedAt
          purchaseOrderChangeHistoryId
          purchaseOrderChangeTshirtStyleNumber
          __typename
        }
        nextToken
        __typename
      }
      isDeleted
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
          quantity
          amountReceived
          id
          createdAt
          updatedAt
          purchaseOrderOrderedItemsId
          customerOrderOrderedItemsId
          tShirtOrderTshirtStyleNumber
          __typename
        }
        nextToken
        __typename
      }
      status
      changeHistory {
        items {
          quantityChange
          orderedQuantityChange
          reason
          id
          createdAt
          updatedAt
          purchaseOrderChangeHistoryId
          purchaseOrderChangeTshirtStyleNumber
          __typename
        }
        nextToken
        __typename
      }
      isDeleted
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreatePurchaseOrderChange = /* GraphQL */ `
  subscription OnCreatePurchaseOrderChange(
    $filter: ModelSubscriptionPurchaseOrderChangeFilterInput
  ) {
    onCreatePurchaseOrderChange(filter: $filter) {
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
      quantityChange
      orderedQuantityChange
      reason
      id
      createdAt
      updatedAt
      purchaseOrderChangeHistoryId
      purchaseOrderChangeTshirtStyleNumber
      __typename
    }
  }
`;
export const onUpdatePurchaseOrderChange = /* GraphQL */ `
  subscription OnUpdatePurchaseOrderChange(
    $filter: ModelSubscriptionPurchaseOrderChangeFilterInput
  ) {
    onUpdatePurchaseOrderChange(filter: $filter) {
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
      quantityChange
      orderedQuantityChange
      reason
      id
      createdAt
      updatedAt
      purchaseOrderChangeHistoryId
      purchaseOrderChangeTshirtStyleNumber
      __typename
    }
  }
`;
export const onDeletePurchaseOrderChange = /* GraphQL */ `
  subscription OnDeletePurchaseOrderChange(
    $filter: ModelSubscriptionPurchaseOrderChangeFilterInput
  ) {
    onDeletePurchaseOrderChange(filter: $filter) {
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
      quantityChange
      orderedQuantityChange
      reason
      id
      createdAt
      updatedAt
      purchaseOrderChangeHistoryId
      purchaseOrderChangeTshirtStyleNumber
      __typename
    }
  }
`;
export const onCreateCustomerOrderChange = /* GraphQL */ `
  subscription OnCreateCustomerOrderChange(
    $filter: ModelSubscriptionCustomerOrderChangeFilterInput
  ) {
    onCreateCustomerOrderChange(filter: $filter) {
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
      orderedQuantityChange
      reason
      id
      createdAt
      updatedAt
      customerOrderChangeHistoryId
      customerOrderChangeTshirtStyleNumber
      __typename
    }
  }
`;
export const onUpdateCustomerOrderChange = /* GraphQL */ `
  subscription OnUpdateCustomerOrderChange(
    $filter: ModelSubscriptionCustomerOrderChangeFilterInput
  ) {
    onUpdateCustomerOrderChange(filter: $filter) {
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
      orderedQuantityChange
      reason
      id
      createdAt
      updatedAt
      customerOrderChangeHistoryId
      customerOrderChangeTshirtStyleNumber
      __typename
    }
  }
`;
export const onDeleteCustomerOrderChange = /* GraphQL */ `
  subscription OnDeleteCustomerOrderChange(
    $filter: ModelSubscriptionCustomerOrderChangeFilterInput
  ) {
    onDeleteCustomerOrderChange(filter: $filter) {
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
      orderedQuantityChange
      reason
      id
      createdAt
      updatedAt
      customerOrderChangeHistoryId
      customerOrderChangeTshirtStyleNumber
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
      tShirtOrderTshirtStyleNumber
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
      tShirtOrderTshirtStyleNumber
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
      tShirtOrderTshirtStyleNumber
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
          quantity
          amountReceived
          id
          createdAt
          updatedAt
          purchaseOrderOrderedItemsId
          customerOrderOrderedItemsId
          tShirtOrderTshirtStyleNumber
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
          orderedQuantityChange
          reason
          id
          createdAt
          updatedAt
          customerOrderChangeHistoryId
          customerOrderChangeTshirtStyleNumber
          __typename
        }
        nextToken
        __typename
      }
      isDeleted
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
          quantity
          amountReceived
          id
          createdAt
          updatedAt
          purchaseOrderOrderedItemsId
          customerOrderOrderedItemsId
          tShirtOrderTshirtStyleNumber
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
          orderedQuantityChange
          reason
          id
          createdAt
          updatedAt
          customerOrderChangeHistoryId
          customerOrderChangeTshirtStyleNumber
          __typename
        }
        nextToken
        __typename
      }
      isDeleted
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
          quantity
          amountReceived
          id
          createdAt
          updatedAt
          purchaseOrderOrderedItemsId
          customerOrderOrderedItemsId
          tShirtOrderTshirtStyleNumber
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
          orderedQuantityChange
          reason
          id
          createdAt
          updatedAt
          customerOrderChangeHistoryId
          customerOrderChangeTshirtStyleNumber
          __typename
        }
        nextToken
        __typename
      }
      isDeleted
      createdAt
      updatedAt
      __typename
    }
  }
`;
