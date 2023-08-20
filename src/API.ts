/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateTShirtInput = {
  id?: string | null,
  styleNumber: string,
  brand: string,
  color: string,
  size: TShirtSize,
  type: TShirtType,
  quantityOnHand: number,
};

export enum TShirtSize {
  NB = "NB",
  SixMonths = "SixMonths",
  TwelveMonths = "TwelveMonths",
  EighteenMonths = "EighteenMonths",
  TwoT = "TwoT",
  ThreeT = "ThreeT",
  FourT = "FourT",
  FiveT = "FiveT",
  YXS = "YXS",
  YS = "YS",
  YM = "YM",
  YL = "YL",
  YXL = "YXL",
  AS = "AS",
  AM = "AM",
  AL = "AL",
  AXL = "AXL",
  TwoX = "TwoX",
  ThreeX = "ThreeX",
  FourX = "FourX",
  FiveX = "FiveX",
}


export enum TShirtType {
  Cotton = "Cotton",
  Drifit = "Drifit",
  Blend = "Blend",
}


export type ModelTShirtConditionInput = {
  styleNumber?: ModelStringInput | null,
  brand?: ModelStringInput | null,
  color?: ModelStringInput | null,
  size?: ModelTShirtSizeInput | null,
  type?: ModelTShirtTypeInput | null,
  quantityOnHand?: ModelIntInput | null,
  and?: Array< ModelTShirtConditionInput | null > | null,
  or?: Array< ModelTShirtConditionInput | null > | null,
  not?: ModelTShirtConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelTShirtSizeInput = {
  eq?: TShirtSize | null,
  ne?: TShirtSize | null,
};

export type ModelTShirtTypeInput = {
  eq?: TShirtType | null,
  ne?: TShirtType | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type TShirt = {
  __typename: "TShirt",
  id: string,
  styleNumber: string,
  brand: string,
  color: string,
  size: TShirtSize,
  type: TShirtType,
  quantityOnHand: number,
  createdAt: string,
  updatedAt: string,
};

export type UpdateTShirtInput = {
  id: string,
  styleNumber?: string | null,
  brand?: string | null,
  color?: string | null,
  size?: TShirtSize | null,
  type?: TShirtType | null,
  quantityOnHand?: number | null,
};

export type DeleteTShirtInput = {
  id: string,
};

export type CreatePurchaseOrderInput = {
  id?: string | null,
  vendor: string,
};

export type ModelPurchaseOrderConditionInput = {
  vendor?: ModelStringInput | null,
  and?: Array< ModelPurchaseOrderConditionInput | null > | null,
  or?: Array< ModelPurchaseOrderConditionInput | null > | null,
  not?: ModelPurchaseOrderConditionInput | null,
};

export type PurchaseOrder = {
  __typename: "PurchaseOrder",
  id: string,
  vendor: string,
  orderedItems?: ModelTShirtOrderConnection | null,
  createdAt: string,
  updatedAt: string,
};

export type ModelTShirtOrderConnection = {
  __typename: "ModelTShirtOrderConnection",
  items:  Array<TShirtOrder | null >,
  nextToken?: string | null,
};

export type TShirtOrder = {
  __typename: "TShirtOrder",
  tshirt: TShirt,
  quantity: number,
  id: string,
  createdAt: string,
  updatedAt: string,
  purchaseOrderOrderedItemsId: string,
  customerOrderOrderedItemsId: string,
};

export type UpdatePurchaseOrderInput = {
  id: string,
  vendor?: string | null,
};

export type DeletePurchaseOrderInput = {
  id: string,
};

export type CreateTShirtOrderInput = {
  quantity: number,
  id?: string | null,
  purchaseOrderOrderedItemsId: string,
  customerOrderOrderedItemsId: string,
};

export type ModelTShirtOrderConditionInput = {
  quantity?: ModelIntInput | null,
  and?: Array< ModelTShirtOrderConditionInput | null > | null,
  or?: Array< ModelTShirtOrderConditionInput | null > | null,
  not?: ModelTShirtOrderConditionInput | null,
  purchaseOrderOrderedItemsId?: ModelIDInput | null,
  customerOrderOrderedItemsId?: ModelIDInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type UpdateTShirtOrderInput = {
  quantity?: number | null,
  id: string,
  purchaseOrderOrderedItemsId?: string | null,
  customerOrderOrderedItemsId?: string | null,
};

export type DeleteTShirtOrderInput = {
  id: string,
};

export type CreateCustomerOrderInput = {
  id?: string | null,
  contact: CustomerContactInput,
  orderDate: string,
  dateNeededBy?: string | null,
};

export type CustomerContactInput = {
  name: string,
  email?: string | null,
  phoneNumber?: string | null,
};

export type ModelCustomerOrderConditionInput = {
  orderDate?: ModelStringInput | null,
  dateNeededBy?: ModelStringInput | null,
  and?: Array< ModelCustomerOrderConditionInput | null > | null,
  or?: Array< ModelCustomerOrderConditionInput | null > | null,
  not?: ModelCustomerOrderConditionInput | null,
};

export type CustomerOrder = {
  __typename: "CustomerOrder",
  id: string,
  contact: CustomerContact,
  orderDate: string,
  dateNeededBy?: string | null,
  orderedItems?: ModelTShirtOrderConnection | null,
  createdAt: string,
  updatedAt: string,
};

export type CustomerContact = {
  __typename: "CustomerContact",
  name: string,
  email?: string | null,
  phoneNumber?: string | null,
};

export type UpdateCustomerOrderInput = {
  id: string,
  contact?: CustomerContactInput | null,
  orderDate?: string | null,
  dateNeededBy?: string | null,
};

export type DeleteCustomerOrderInput = {
  id: string,
};

export type ModelTShirtFilterInput = {
  id?: ModelIDInput | null,
  styleNumber?: ModelStringInput | null,
  brand?: ModelStringInput | null,
  color?: ModelStringInput | null,
  size?: ModelTShirtSizeInput | null,
  type?: ModelTShirtTypeInput | null,
  quantityOnHand?: ModelIntInput | null,
  and?: Array< ModelTShirtFilterInput | null > | null,
  or?: Array< ModelTShirtFilterInput | null > | null,
  not?: ModelTShirtFilterInput | null,
};

export type ModelTShirtConnection = {
  __typename: "ModelTShirtConnection",
  items:  Array<TShirt | null >,
  nextToken?: string | null,
};

export type ModelPurchaseOrderFilterInput = {
  id?: ModelIDInput | null,
  vendor?: ModelStringInput | null,
  and?: Array< ModelPurchaseOrderFilterInput | null > | null,
  or?: Array< ModelPurchaseOrderFilterInput | null > | null,
  not?: ModelPurchaseOrderFilterInput | null,
};

export type ModelPurchaseOrderConnection = {
  __typename: "ModelPurchaseOrderConnection",
  items:  Array<PurchaseOrder | null >,
  nextToken?: string | null,
};

export type ModelTShirtOrderFilterInput = {
  quantity?: ModelIntInput | null,
  and?: Array< ModelTShirtOrderFilterInput | null > | null,
  or?: Array< ModelTShirtOrderFilterInput | null > | null,
  not?: ModelTShirtOrderFilterInput | null,
  purchaseOrderOrderedItemsId?: ModelIDInput | null,
  customerOrderOrderedItemsId?: ModelIDInput | null,
};

export type ModelCustomerOrderFilterInput = {
  id?: ModelIDInput | null,
  orderDate?: ModelStringInput | null,
  dateNeededBy?: ModelStringInput | null,
  and?: Array< ModelCustomerOrderFilterInput | null > | null,
  or?: Array< ModelCustomerOrderFilterInput | null > | null,
  not?: ModelCustomerOrderFilterInput | null,
};

export type ModelCustomerOrderConnection = {
  __typename: "ModelCustomerOrderConnection",
  items:  Array<CustomerOrder | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionTShirtFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  styleNumber?: ModelSubscriptionStringInput | null,
  brand?: ModelSubscriptionStringInput | null,
  color?: ModelSubscriptionStringInput | null,
  size?: ModelSubscriptionStringInput | null,
  type?: ModelSubscriptionStringInput | null,
  quantityOnHand?: ModelSubscriptionIntInput | null,
  and?: Array< ModelSubscriptionTShirtFilterInput | null > | null,
  or?: Array< ModelSubscriptionTShirtFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionPurchaseOrderFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  vendor?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionPurchaseOrderFilterInput | null > | null,
  or?: Array< ModelSubscriptionPurchaseOrderFilterInput | null > | null,
};

export type ModelSubscriptionTShirtOrderFilterInput = {
  quantity?: ModelSubscriptionIntInput | null,
  and?: Array< ModelSubscriptionTShirtOrderFilterInput | null > | null,
  or?: Array< ModelSubscriptionTShirtOrderFilterInput | null > | null,
};

export type ModelSubscriptionCustomerOrderFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  orderDate?: ModelSubscriptionStringInput | null,
  dateNeededBy?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionCustomerOrderFilterInput | null > | null,
  or?: Array< ModelSubscriptionCustomerOrderFilterInput | null > | null,
};

export type CreateTShirtMutationVariables = {
  input: CreateTShirtInput,
  condition?: ModelTShirtConditionInput | null,
};

export type CreateTShirtMutation = {
  createTShirt?:  {
    __typename: "TShirt",
    id: string,
    styleNumber: string,
    brand: string,
    color: string,
    size: TShirtSize,
    type: TShirtType,
    quantityOnHand: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateTShirtMutationVariables = {
  input: UpdateTShirtInput,
  condition?: ModelTShirtConditionInput | null,
};

export type UpdateTShirtMutation = {
  updateTShirt?:  {
    __typename: "TShirt",
    id: string,
    styleNumber: string,
    brand: string,
    color: string,
    size: TShirtSize,
    type: TShirtType,
    quantityOnHand: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteTShirtMutationVariables = {
  input: DeleteTShirtInput,
  condition?: ModelTShirtConditionInput | null,
};

export type DeleteTShirtMutation = {
  deleteTShirt?:  {
    __typename: "TShirt",
    id: string,
    styleNumber: string,
    brand: string,
    color: string,
    size: TShirtSize,
    type: TShirtType,
    quantityOnHand: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreatePurchaseOrderMutationVariables = {
  input: CreatePurchaseOrderInput,
  condition?: ModelPurchaseOrderConditionInput | null,
};

export type CreatePurchaseOrderMutation = {
  createPurchaseOrder?:  {
    __typename: "PurchaseOrder",
    id: string,
    vendor: string,
    orderedItems?:  {
      __typename: "ModelTShirtOrderConnection",
      items:  Array< {
        __typename: "TShirtOrder",
        quantity: number,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId: string,
        customerOrderOrderedItemsId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdatePurchaseOrderMutationVariables = {
  input: UpdatePurchaseOrderInput,
  condition?: ModelPurchaseOrderConditionInput | null,
};

export type UpdatePurchaseOrderMutation = {
  updatePurchaseOrder?:  {
    __typename: "PurchaseOrder",
    id: string,
    vendor: string,
    orderedItems?:  {
      __typename: "ModelTShirtOrderConnection",
      items:  Array< {
        __typename: "TShirtOrder",
        quantity: number,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId: string,
        customerOrderOrderedItemsId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeletePurchaseOrderMutationVariables = {
  input: DeletePurchaseOrderInput,
  condition?: ModelPurchaseOrderConditionInput | null,
};

export type DeletePurchaseOrderMutation = {
  deletePurchaseOrder?:  {
    __typename: "PurchaseOrder",
    id: string,
    vendor: string,
    orderedItems?:  {
      __typename: "ModelTShirtOrderConnection",
      items:  Array< {
        __typename: "TShirtOrder",
        quantity: number,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId: string,
        customerOrderOrderedItemsId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateTShirtOrderMutationVariables = {
  input: CreateTShirtOrderInput,
  condition?: ModelTShirtOrderConditionInput | null,
};

export type CreateTShirtOrderMutation = {
  createTShirtOrder?:  {
    __typename: "TShirtOrder",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand: number,
      createdAt: string,
      updatedAt: string,
    },
    quantity: number,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderOrderedItemsId: string,
    customerOrderOrderedItemsId: string,
  } | null,
};

export type UpdateTShirtOrderMutationVariables = {
  input: UpdateTShirtOrderInput,
  condition?: ModelTShirtOrderConditionInput | null,
};

export type UpdateTShirtOrderMutation = {
  updateTShirtOrder?:  {
    __typename: "TShirtOrder",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand: number,
      createdAt: string,
      updatedAt: string,
    },
    quantity: number,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderOrderedItemsId: string,
    customerOrderOrderedItemsId: string,
  } | null,
};

export type DeleteTShirtOrderMutationVariables = {
  input: DeleteTShirtOrderInput,
  condition?: ModelTShirtOrderConditionInput | null,
};

export type DeleteTShirtOrderMutation = {
  deleteTShirtOrder?:  {
    __typename: "TShirtOrder",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand: number,
      createdAt: string,
      updatedAt: string,
    },
    quantity: number,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderOrderedItemsId: string,
    customerOrderOrderedItemsId: string,
  } | null,
};

export type CreateCustomerOrderMutationVariables = {
  input: CreateCustomerOrderInput,
  condition?: ModelCustomerOrderConditionInput | null,
};

export type CreateCustomerOrderMutation = {
  createCustomerOrder?:  {
    __typename: "CustomerOrder",
    id: string,
    contact:  {
      __typename: "CustomerContact",
      name: string,
      email?: string | null,
      phoneNumber?: string | null,
    },
    orderDate: string,
    dateNeededBy?: string | null,
    orderedItems?:  {
      __typename: "ModelTShirtOrderConnection",
      items:  Array< {
        __typename: "TShirtOrder",
        quantity: number,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId: string,
        customerOrderOrderedItemsId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateCustomerOrderMutationVariables = {
  input: UpdateCustomerOrderInput,
  condition?: ModelCustomerOrderConditionInput | null,
};

export type UpdateCustomerOrderMutation = {
  updateCustomerOrder?:  {
    __typename: "CustomerOrder",
    id: string,
    contact:  {
      __typename: "CustomerContact",
      name: string,
      email?: string | null,
      phoneNumber?: string | null,
    },
    orderDate: string,
    dateNeededBy?: string | null,
    orderedItems?:  {
      __typename: "ModelTShirtOrderConnection",
      items:  Array< {
        __typename: "TShirtOrder",
        quantity: number,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId: string,
        customerOrderOrderedItemsId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteCustomerOrderMutationVariables = {
  input: DeleteCustomerOrderInput,
  condition?: ModelCustomerOrderConditionInput | null,
};

export type DeleteCustomerOrderMutation = {
  deleteCustomerOrder?:  {
    __typename: "CustomerOrder",
    id: string,
    contact:  {
      __typename: "CustomerContact",
      name: string,
      email?: string | null,
      phoneNumber?: string | null,
    },
    orderDate: string,
    dateNeededBy?: string | null,
    orderedItems?:  {
      __typename: "ModelTShirtOrderConnection",
      items:  Array< {
        __typename: "TShirtOrder",
        quantity: number,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId: string,
        customerOrderOrderedItemsId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetTShirtQueryVariables = {
  id: string,
};

export type GetTShirtQuery = {
  getTShirt?:  {
    __typename: "TShirt",
    id: string,
    styleNumber: string,
    brand: string,
    color: string,
    size: TShirtSize,
    type: TShirtType,
    quantityOnHand: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListTShirtsQueryVariables = {
  filter?: ModelTShirtFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTShirtsQuery = {
  listTShirts?:  {
    __typename: "ModelTShirtConnection",
    items:  Array< {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand: number,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetPurchaseOrderQueryVariables = {
  id: string,
};

export type GetPurchaseOrderQuery = {
  getPurchaseOrder?:  {
    __typename: "PurchaseOrder",
    id: string,
    vendor: string,
    orderedItems?:  {
      __typename: "ModelTShirtOrderConnection",
      items:  Array< {
        __typename: "TShirtOrder",
        quantity: number,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId: string,
        customerOrderOrderedItemsId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListPurchaseOrdersQueryVariables = {
  filter?: ModelPurchaseOrderFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPurchaseOrdersQuery = {
  listPurchaseOrders?:  {
    __typename: "ModelPurchaseOrderConnection",
    items:  Array< {
      __typename: "PurchaseOrder",
      id: string,
      vendor: string,
      orderedItems?:  {
        __typename: "ModelTShirtOrderConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetTShirtOrderQueryVariables = {
  id: string,
};

export type GetTShirtOrderQuery = {
  getTShirtOrder?:  {
    __typename: "TShirtOrder",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand: number,
      createdAt: string,
      updatedAt: string,
    },
    quantity: number,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderOrderedItemsId: string,
    customerOrderOrderedItemsId: string,
  } | null,
};

export type ListTShirtOrdersQueryVariables = {
  filter?: ModelTShirtOrderFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTShirtOrdersQuery = {
  listTShirtOrders?:  {
    __typename: "ModelTShirtOrderConnection",
    items:  Array< {
      __typename: "TShirtOrder",
      tshirt:  {
        __typename: "TShirt",
        id: string,
        styleNumber: string,
        brand: string,
        color: string,
        size: TShirtSize,
        type: TShirtType,
        quantityOnHand: number,
        createdAt: string,
        updatedAt: string,
      },
      quantity: number,
      id: string,
      createdAt: string,
      updatedAt: string,
      purchaseOrderOrderedItemsId: string,
      customerOrderOrderedItemsId: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetCustomerOrderQueryVariables = {
  id: string,
};

export type GetCustomerOrderQuery = {
  getCustomerOrder?:  {
    __typename: "CustomerOrder",
    id: string,
    contact:  {
      __typename: "CustomerContact",
      name: string,
      email?: string | null,
      phoneNumber?: string | null,
    },
    orderDate: string,
    dateNeededBy?: string | null,
    orderedItems?:  {
      __typename: "ModelTShirtOrderConnection",
      items:  Array< {
        __typename: "TShirtOrder",
        quantity: number,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId: string,
        customerOrderOrderedItemsId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListCustomerOrdersQueryVariables = {
  filter?: ModelCustomerOrderFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListCustomerOrdersQuery = {
  listCustomerOrders?:  {
    __typename: "ModelCustomerOrderConnection",
    items:  Array< {
      __typename: "CustomerOrder",
      id: string,
      contact:  {
        __typename: "CustomerContact",
        name: string,
        email?: string | null,
        phoneNumber?: string | null,
      },
      orderDate: string,
      dateNeededBy?: string | null,
      orderedItems?:  {
        __typename: "ModelTShirtOrderConnection",
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateTShirtSubscriptionVariables = {
  filter?: ModelSubscriptionTShirtFilterInput | null,
};

export type OnCreateTShirtSubscription = {
  onCreateTShirt?:  {
    __typename: "TShirt",
    id: string,
    styleNumber: string,
    brand: string,
    color: string,
    size: TShirtSize,
    type: TShirtType,
    quantityOnHand: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateTShirtSubscriptionVariables = {
  filter?: ModelSubscriptionTShirtFilterInput | null,
};

export type OnUpdateTShirtSubscription = {
  onUpdateTShirt?:  {
    __typename: "TShirt",
    id: string,
    styleNumber: string,
    brand: string,
    color: string,
    size: TShirtSize,
    type: TShirtType,
    quantityOnHand: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteTShirtSubscriptionVariables = {
  filter?: ModelSubscriptionTShirtFilterInput | null,
};

export type OnDeleteTShirtSubscription = {
  onDeleteTShirt?:  {
    __typename: "TShirt",
    id: string,
    styleNumber: string,
    brand: string,
    color: string,
    size: TShirtSize,
    type: TShirtType,
    quantityOnHand: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreatePurchaseOrderSubscriptionVariables = {
  filter?: ModelSubscriptionPurchaseOrderFilterInput | null,
};

export type OnCreatePurchaseOrderSubscription = {
  onCreatePurchaseOrder?:  {
    __typename: "PurchaseOrder",
    id: string,
    vendor: string,
    orderedItems?:  {
      __typename: "ModelTShirtOrderConnection",
      items:  Array< {
        __typename: "TShirtOrder",
        quantity: number,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId: string,
        customerOrderOrderedItemsId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdatePurchaseOrderSubscriptionVariables = {
  filter?: ModelSubscriptionPurchaseOrderFilterInput | null,
};

export type OnUpdatePurchaseOrderSubscription = {
  onUpdatePurchaseOrder?:  {
    __typename: "PurchaseOrder",
    id: string,
    vendor: string,
    orderedItems?:  {
      __typename: "ModelTShirtOrderConnection",
      items:  Array< {
        __typename: "TShirtOrder",
        quantity: number,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId: string,
        customerOrderOrderedItemsId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeletePurchaseOrderSubscriptionVariables = {
  filter?: ModelSubscriptionPurchaseOrderFilterInput | null,
};

export type OnDeletePurchaseOrderSubscription = {
  onDeletePurchaseOrder?:  {
    __typename: "PurchaseOrder",
    id: string,
    vendor: string,
    orderedItems?:  {
      __typename: "ModelTShirtOrderConnection",
      items:  Array< {
        __typename: "TShirtOrder",
        quantity: number,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId: string,
        customerOrderOrderedItemsId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateTShirtOrderSubscriptionVariables = {
  filter?: ModelSubscriptionTShirtOrderFilterInput | null,
};

export type OnCreateTShirtOrderSubscription = {
  onCreateTShirtOrder?:  {
    __typename: "TShirtOrder",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand: number,
      createdAt: string,
      updatedAt: string,
    },
    quantity: number,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderOrderedItemsId: string,
    customerOrderOrderedItemsId: string,
  } | null,
};

export type OnUpdateTShirtOrderSubscriptionVariables = {
  filter?: ModelSubscriptionTShirtOrderFilterInput | null,
};

export type OnUpdateTShirtOrderSubscription = {
  onUpdateTShirtOrder?:  {
    __typename: "TShirtOrder",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand: number,
      createdAt: string,
      updatedAt: string,
    },
    quantity: number,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderOrderedItemsId: string,
    customerOrderOrderedItemsId: string,
  } | null,
};

export type OnDeleteTShirtOrderSubscriptionVariables = {
  filter?: ModelSubscriptionTShirtOrderFilterInput | null,
};

export type OnDeleteTShirtOrderSubscription = {
  onDeleteTShirtOrder?:  {
    __typename: "TShirtOrder",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand: number,
      createdAt: string,
      updatedAt: string,
    },
    quantity: number,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderOrderedItemsId: string,
    customerOrderOrderedItemsId: string,
  } | null,
};

export type OnCreateCustomerOrderSubscriptionVariables = {
  filter?: ModelSubscriptionCustomerOrderFilterInput | null,
};

export type OnCreateCustomerOrderSubscription = {
  onCreateCustomerOrder?:  {
    __typename: "CustomerOrder",
    id: string,
    contact:  {
      __typename: "CustomerContact",
      name: string,
      email?: string | null,
      phoneNumber?: string | null,
    },
    orderDate: string,
    dateNeededBy?: string | null,
    orderedItems?:  {
      __typename: "ModelTShirtOrderConnection",
      items:  Array< {
        __typename: "TShirtOrder",
        quantity: number,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId: string,
        customerOrderOrderedItemsId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateCustomerOrderSubscriptionVariables = {
  filter?: ModelSubscriptionCustomerOrderFilterInput | null,
};

export type OnUpdateCustomerOrderSubscription = {
  onUpdateCustomerOrder?:  {
    __typename: "CustomerOrder",
    id: string,
    contact:  {
      __typename: "CustomerContact",
      name: string,
      email?: string | null,
      phoneNumber?: string | null,
    },
    orderDate: string,
    dateNeededBy?: string | null,
    orderedItems?:  {
      __typename: "ModelTShirtOrderConnection",
      items:  Array< {
        __typename: "TShirtOrder",
        quantity: number,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId: string,
        customerOrderOrderedItemsId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteCustomerOrderSubscriptionVariables = {
  filter?: ModelSubscriptionCustomerOrderFilterInput | null,
};

export type OnDeleteCustomerOrderSubscription = {
  onDeleteCustomerOrder?:  {
    __typename: "CustomerOrder",
    id: string,
    contact:  {
      __typename: "CustomerContact",
      name: string,
      email?: string | null,
      phoneNumber?: string | null,
    },
    orderDate: string,
    dateNeededBy?: string | null,
    orderedItems?:  {
      __typename: "ModelTShirtOrderConnection",
      items:  Array< {
        __typename: "TShirtOrder",
        quantity: number,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId: string,
        customerOrderOrderedItemsId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};
