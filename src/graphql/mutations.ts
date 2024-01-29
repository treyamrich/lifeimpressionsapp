/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTShirt = /* GraphQL */ `
  mutation CreateTShirt(
    $input: CreateTShirtInput!
    $condition: ModelTShirtConditionInput
  ) {
    createTShirt(input: $input, condition: $condition) {
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
export const updateTShirt = /* GraphQL */ `
  mutation UpdateTShirt(
    $input: UpdateTShirtInput!
    $condition: ModelTShirtConditionInput
  ) {
    updateTShirt(input: $input, condition: $condition) {
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
export const deleteTShirt = /* GraphQL */ `
  mutation DeleteTShirt(
    $input: DeleteTShirtInput!
    $condition: ModelTShirtConditionInput
  ) {
    deleteTShirt(input: $input, condition: $condition) {
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
export const createPurchaseOrder = /* GraphQL */ `
  mutation CreatePurchaseOrder(
    $input: CreatePurchaseOrderInput!
    $condition: ModelPurchaseOrderConditionInput
  ) {
    createPurchaseOrder(input: $input, condition: $condition) {
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
          costPerUnit
          discount
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
          id
          createdAt
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
      sentToVendor
      dateExpected
      isDeleted
      type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updatePurchaseOrder = /* GraphQL */ `
  mutation UpdatePurchaseOrder(
    $input: UpdatePurchaseOrderInput!
    $condition: ModelPurchaseOrderConditionInput
  ) {
    updatePurchaseOrder(input: $input, condition: $condition) {
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
          costPerUnit
          discount
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
          id
          createdAt
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
      sentToVendor
      dateExpected
      isDeleted
      type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deletePurchaseOrder = /* GraphQL */ `
  mutation DeletePurchaseOrder(
    $input: DeletePurchaseOrderInput!
    $condition: ModelPurchaseOrderConditionInput
  ) {
    deletePurchaseOrder(input: $input, condition: $condition) {
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
          costPerUnit
          discount
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
          id
          createdAt
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
      sentToVendor
      dateExpected
      isDeleted
      type
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createOrderChange = /* GraphQL */ `
  mutation CreateOrderChange(
    $input: CreateOrderChangeInput!
    $condition: ModelOrderChangeConditionInput
  ) {
    createOrderChange(input: $input, condition: $condition) {
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
      reason
      fieldChanges {
        oldValue
        newValue
        fieldName
        __typename
      }
      id
      createdAt
      updatedAt
      purchaseOrderChangeHistoryId
      customerOrderChangeHistoryId
      orderChangeTshirtId
      __typename
    }
  }
`;
export const updateOrderChange = /* GraphQL */ `
  mutation UpdateOrderChange(
    $input: UpdateOrderChangeInput!
    $condition: ModelOrderChangeConditionInput
  ) {
    updateOrderChange(input: $input, condition: $condition) {
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
      reason
      fieldChanges {
        oldValue
        newValue
        fieldName
        __typename
      }
      id
      createdAt
      updatedAt
      purchaseOrderChangeHistoryId
      customerOrderChangeHistoryId
      orderChangeTshirtId
      __typename
    }
  }
`;
export const deleteOrderChange = /* GraphQL */ `
  mutation DeleteOrderChange(
    $input: DeleteOrderChangeInput!
    $condition: ModelOrderChangeConditionInput
  ) {
    deleteOrderChange(input: $input, condition: $condition) {
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
      reason
      fieldChanges {
        oldValue
        newValue
        fieldName
        __typename
      }
      id
      createdAt
      updatedAt
      purchaseOrderChangeHistoryId
      customerOrderChangeHistoryId
      orderChangeTshirtId
      __typename
    }
  }
`;
export const createTShirtOrder = /* GraphQL */ `
  mutation CreateTShirtOrder(
    $input: CreateTShirtOrderInput!
    $condition: ModelTShirtOrderConditionInput
  ) {
    createTShirtOrder(input: $input, condition: $condition) {
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
      costPerUnit
      discount
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
export const updateTShirtOrder = /* GraphQL */ `
  mutation UpdateTShirtOrder(
    $input: UpdateTShirtOrderInput!
    $condition: ModelTShirtOrderConditionInput
  ) {
    updateTShirtOrder(input: $input, condition: $condition) {
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
      costPerUnit
      discount
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
export const deleteTShirtOrder = /* GraphQL */ `
  mutation DeleteTShirtOrder(
    $input: DeleteTShirtOrderInput!
    $condition: ModelTShirtOrderConditionInput
  ) {
    deleteTShirtOrder(input: $input, condition: $condition) {
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
      costPerUnit
      discount
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
export const createCustomerOrder = /* GraphQL */ `
  mutation CreateCustomerOrder(
    $input: CreateCustomerOrderInput!
    $condition: ModelCustomerOrderConditionInput
  ) {
    createCustomerOrder(input: $input, condition: $condition) {
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
          costPerUnit
          discount
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
          reason
          fieldChanges {
            oldValue
            newValue
            fieldName
            __typename
          }
          id
          createdAt
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
export const updateCustomerOrder = /* GraphQL */ `
  mutation UpdateCustomerOrder(
    $input: UpdateCustomerOrderInput!
    $condition: ModelCustomerOrderConditionInput
  ) {
    updateCustomerOrder(input: $input, condition: $condition) {
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
          costPerUnit
          discount
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
          reason
          fieldChanges {
            oldValue
            newValue
            fieldName
            __typename
          }
          id
          createdAt
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
export const deleteCustomerOrder = /* GraphQL */ `
  mutation DeleteCustomerOrder(
    $input: DeleteCustomerOrderInput!
    $condition: ModelCustomerOrderConditionInput
  ) {
    deleteCustomerOrder(input: $input, condition: $condition) {
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
          costPerUnit
          discount
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
          reason
          fieldChanges {
            oldValue
            newValue
            fieldName
            __typename
          }
          id
          createdAt
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
