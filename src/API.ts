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
  quantityOnHand?: number | null,
  isDeleted?: boolean | null,
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
  isDeleted?: ModelBooleanInput | null,
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

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
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
  quantityOnHand?: number | null,
  isDeleted?: boolean | null,
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
  isDeleted?: boolean | null,
};

export type DeleteTShirtInput = {
  id: string,
};

export type CreatePurchaseOrderInput = {
  id?: string | null,
  orderNumber: string,
  vendor: string,
  status: POStatus,
  isDeleted?: boolean | null,
  type?: string | null,
  createdAt?: string | null,
};

export enum POStatus {
  Open = "Open",
  Closed = "Closed",
}


export type ModelPurchaseOrderConditionInput = {
  orderNumber?: ModelStringInput | null,
  vendor?: ModelStringInput | null,
  status?: ModelPOStatusInput | null,
  isDeleted?: ModelBooleanInput | null,
  type?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  and?: Array< ModelPurchaseOrderConditionInput | null > | null,
  or?: Array< ModelPurchaseOrderConditionInput | null > | null,
  not?: ModelPurchaseOrderConditionInput | null,
};

export type ModelPOStatusInput = {
  eq?: POStatus | null,
  ne?: POStatus | null,
};

export type PurchaseOrder = {
  __typename: "PurchaseOrder",
  id: string,
  orderNumber: string,
  vendor: string,
  orderedItems?: ModelTShirtOrderConnection | null,
  status: POStatus,
  changeHistory?: ModelPurchaseOrderChangeConnection | null,
  isDeleted?: boolean | null,
  type?: string | null,
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
  amountReceived?: number | null,
  id: string,
  createdAt: string,
  updatedAt: string,
  purchaseOrderOrderedItemsId?: string | null,
  customerOrderOrderedItemsId?: string | null,
  tShirtOrderTshirtId: string,
};

export type ModelPurchaseOrderChangeConnection = {
  __typename: "ModelPurchaseOrderChangeConnection",
  items:  Array<PurchaseOrderChange | null >,
  nextToken?: string | null,
};

export type PurchaseOrderChange = {
  __typename: "PurchaseOrderChange",
  tshirt: TShirt,
  quantityChange: number,
  orderedQuantityChange: number,
  reason: string,
  id: string,
  createdAt: string,
  updatedAt: string,
  purchaseOrderChangeHistoryId?: string | null,
  purchaseOrderChangeTshirtId: string,
};

export type UpdatePurchaseOrderInput = {
  id: string,
  orderNumber?: string | null,
  vendor?: string | null,
  status?: POStatus | null,
  isDeleted?: boolean | null,
  type?: string | null,
  createdAt?: string | null,
};

export type DeletePurchaseOrderInput = {
  id: string,
};

export type CreatePurchaseOrderChangeInput = {
  quantityChange: number,
  orderedQuantityChange: number,
  reason: string,
  id?: string | null,
  purchaseOrderChangeHistoryId?: string | null,
  purchaseOrderChangeTshirtId: string,
};

export type ModelPurchaseOrderChangeConditionInput = {
  quantityChange?: ModelIntInput | null,
  orderedQuantityChange?: ModelIntInput | null,
  reason?: ModelStringInput | null,
  and?: Array< ModelPurchaseOrderChangeConditionInput | null > | null,
  or?: Array< ModelPurchaseOrderChangeConditionInput | null > | null,
  not?: ModelPurchaseOrderChangeConditionInput | null,
  purchaseOrderChangeHistoryId?: ModelIDInput | null,
  purchaseOrderChangeTshirtId?: ModelIDInput | null,
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

export type UpdatePurchaseOrderChangeInput = {
  quantityChange?: number | null,
  orderedQuantityChange?: number | null,
  reason?: string | null,
  id: string,
  purchaseOrderChangeHistoryId?: string | null,
  purchaseOrderChangeTshirtId?: string | null,
};

export type DeletePurchaseOrderChangeInput = {
  id: string,
};

export type CreateCustomerOrderChangeInput = {
  orderedQuantityChange: number,
  reason: string,
  id?: string | null,
  customerOrderChangeHistoryId?: string | null,
  customerOrderChangeTshirtId: string,
};

export type ModelCustomerOrderChangeConditionInput = {
  orderedQuantityChange?: ModelIntInput | null,
  reason?: ModelStringInput | null,
  and?: Array< ModelCustomerOrderChangeConditionInput | null > | null,
  or?: Array< ModelCustomerOrderChangeConditionInput | null > | null,
  not?: ModelCustomerOrderChangeConditionInput | null,
  customerOrderChangeHistoryId?: ModelIDInput | null,
  customerOrderChangeTshirtId?: ModelIDInput | null,
};

export type CustomerOrderChange = {
  __typename: "CustomerOrderChange",
  tshirt: TShirt,
  orderedQuantityChange: number,
  reason: string,
  id: string,
  createdAt: string,
  updatedAt: string,
  customerOrderChangeHistoryId?: string | null,
  customerOrderChangeTshirtId: string,
};

export type UpdateCustomerOrderChangeInput = {
  orderedQuantityChange?: number | null,
  reason?: string | null,
  id: string,
  customerOrderChangeHistoryId?: string | null,
  customerOrderChangeTshirtId?: string | null,
};

export type DeleteCustomerOrderChangeInput = {
  id: string,
};

export type CreateTShirtOrderInput = {
  quantity: number,
  amountReceived?: number | null,
  id?: string | null,
  purchaseOrderOrderedItemsId?: string | null,
  customerOrderOrderedItemsId?: string | null,
  tShirtOrderTshirtId: string,
};

export type ModelTShirtOrderConditionInput = {
  quantity?: ModelIntInput | null,
  amountReceived?: ModelIntInput | null,
  and?: Array< ModelTShirtOrderConditionInput | null > | null,
  or?: Array< ModelTShirtOrderConditionInput | null > | null,
  not?: ModelTShirtOrderConditionInput | null,
  purchaseOrderOrderedItemsId?: ModelIDInput | null,
  customerOrderOrderedItemsId?: ModelIDInput | null,
  tShirtOrderTshirtId?: ModelIDInput | null,
};

export type UpdateTShirtOrderInput = {
  quantity?: number | null,
  amountReceived?: number | null,
  id: string,
  purchaseOrderOrderedItemsId?: string | null,
  customerOrderOrderedItemsId?: string | null,
  tShirtOrderTshirtId?: string | null,
};

export type DeleteTShirtOrderInput = {
  id: string,
};

export type CreateCustomerOrderInput = {
  id?: string | null,
  customerName: string,
  customerEmail?: string | null,
  customerPhoneNumber?: string | null,
  orderNumber: string,
  orderStatus: CustomerOrderStatus,
  orderNotes?: string | null,
  dateNeededBy: string,
  isDeleted?: boolean | null,
  type?: string | null,
  createdAt?: string | null,
};

export enum CustomerOrderStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  BLOCKED = "BLOCKED",
  COMPLETED = "COMPLETED",
}


export type ModelCustomerOrderConditionInput = {
  customerName?: ModelStringInput | null,
  customerEmail?: ModelStringInput | null,
  customerPhoneNumber?: ModelStringInput | null,
  orderNumber?: ModelStringInput | null,
  orderStatus?: ModelCustomerOrderStatusInput | null,
  orderNotes?: ModelStringInput | null,
  dateNeededBy?: ModelStringInput | null,
  isDeleted?: ModelBooleanInput | null,
  type?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  and?: Array< ModelCustomerOrderConditionInput | null > | null,
  or?: Array< ModelCustomerOrderConditionInput | null > | null,
  not?: ModelCustomerOrderConditionInput | null,
};

export type ModelCustomerOrderStatusInput = {
  eq?: CustomerOrderStatus | null,
  ne?: CustomerOrderStatus | null,
};

export type CustomerOrder = {
  __typename: "CustomerOrder",
  id: string,
  customerName: string,
  customerEmail?: string | null,
  customerPhoneNumber?: string | null,
  orderedItems?: ModelTShirtOrderConnection | null,
  orderNumber: string,
  orderStatus: CustomerOrderStatus,
  orderNotes?: string | null,
  dateNeededBy: string,
  changeHistory?: ModelCustomerOrderChangeConnection | null,
  isDeleted?: boolean | null,
  type?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type ModelCustomerOrderChangeConnection = {
  __typename: "ModelCustomerOrderChangeConnection",
  items:  Array<CustomerOrderChange | null >,
  nextToken?: string | null,
};

export type UpdateCustomerOrderInput = {
  id: string,
  customerName?: string | null,
  customerEmail?: string | null,
  customerPhoneNumber?: string | null,
  orderNumber?: string | null,
  orderStatus?: CustomerOrderStatus | null,
  orderNotes?: string | null,
  dateNeededBy?: string | null,
  isDeleted?: boolean | null,
  type?: string | null,
  createdAt?: string | null,
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
  isDeleted?: ModelBooleanInput | null,
  and?: Array< ModelTShirtFilterInput | null > | null,
  or?: Array< ModelTShirtFilterInput | null > | null,
  not?: ModelTShirtFilterInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelTShirtConnection = {
  __typename: "ModelTShirtConnection",
  items:  Array<TShirt | null >,
  nextToken?: string | null,
};

export type ModelPurchaseOrderFilterInput = {
  id?: ModelIDInput | null,
  orderNumber?: ModelStringInput | null,
  vendor?: ModelStringInput | null,
  status?: ModelPOStatusInput | null,
  isDeleted?: ModelBooleanInput | null,
  type?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  and?: Array< ModelPurchaseOrderFilterInput | null > | null,
  or?: Array< ModelPurchaseOrderFilterInput | null > | null,
  not?: ModelPurchaseOrderFilterInput | null,
};

export type ModelPurchaseOrderConnection = {
  __typename: "ModelPurchaseOrderConnection",
  items:  Array<PurchaseOrder | null >,
  nextToken?: string | null,
};

export type ModelStringKeyConditionInput = {
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export type ModelPurchaseOrderChangeFilterInput = {
  quantityChange?: ModelIntInput | null,
  orderedQuantityChange?: ModelIntInput | null,
  reason?: ModelStringInput | null,
  and?: Array< ModelPurchaseOrderChangeFilterInput | null > | null,
  or?: Array< ModelPurchaseOrderChangeFilterInput | null > | null,
  not?: ModelPurchaseOrderChangeFilterInput | null,
  purchaseOrderChangeHistoryId?: ModelIDInput | null,
  purchaseOrderChangeTshirtId?: ModelIDInput | null,
};

export type ModelCustomerOrderChangeFilterInput = {
  orderedQuantityChange?: ModelIntInput | null,
  reason?: ModelStringInput | null,
  and?: Array< ModelCustomerOrderChangeFilterInput | null > | null,
  or?: Array< ModelCustomerOrderChangeFilterInput | null > | null,
  not?: ModelCustomerOrderChangeFilterInput | null,
  customerOrderChangeHistoryId?: ModelIDInput | null,
  customerOrderChangeTshirtId?: ModelIDInput | null,
};

export type ModelTShirtOrderFilterInput = {
  quantity?: ModelIntInput | null,
  amountReceived?: ModelIntInput | null,
  and?: Array< ModelTShirtOrderFilterInput | null > | null,
  or?: Array< ModelTShirtOrderFilterInput | null > | null,
  not?: ModelTShirtOrderFilterInput | null,
  purchaseOrderOrderedItemsId?: ModelIDInput | null,
  customerOrderOrderedItemsId?: ModelIDInput | null,
  tShirtOrderTshirtId?: ModelIDInput | null,
};

export type ModelCustomerOrderFilterInput = {
  id?: ModelIDInput | null,
  customerName?: ModelStringInput | null,
  customerEmail?: ModelStringInput | null,
  customerPhoneNumber?: ModelStringInput | null,
  orderNumber?: ModelStringInput | null,
  orderStatus?: ModelCustomerOrderStatusInput | null,
  orderNotes?: ModelStringInput | null,
  dateNeededBy?: ModelStringInput | null,
  isDeleted?: ModelBooleanInput | null,
  type?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
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
  isDeleted?: ModelSubscriptionBooleanInput | null,
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

export type ModelSubscriptionBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
};

export type ModelSubscriptionPurchaseOrderFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  orderNumber?: ModelSubscriptionStringInput | null,
  vendor?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  isDeleted?: ModelSubscriptionBooleanInput | null,
  type?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionPurchaseOrderFilterInput | null > | null,
  or?: Array< ModelSubscriptionPurchaseOrderFilterInput | null > | null,
};

export type ModelSubscriptionPurchaseOrderChangeFilterInput = {
  quantityChange?: ModelSubscriptionIntInput | null,
  orderedQuantityChange?: ModelSubscriptionIntInput | null,
  reason?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionPurchaseOrderChangeFilterInput | null > | null,
  or?: Array< ModelSubscriptionPurchaseOrderChangeFilterInput | null > | null,
};

export type ModelSubscriptionCustomerOrderChangeFilterInput = {
  orderedQuantityChange?: ModelSubscriptionIntInput | null,
  reason?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionCustomerOrderChangeFilterInput | null > | null,
  or?: Array< ModelSubscriptionCustomerOrderChangeFilterInput | null > | null,
};

export type ModelSubscriptionTShirtOrderFilterInput = {
  quantity?: ModelSubscriptionIntInput | null,
  amountReceived?: ModelSubscriptionIntInput | null,
  and?: Array< ModelSubscriptionTShirtOrderFilterInput | null > | null,
  or?: Array< ModelSubscriptionTShirtOrderFilterInput | null > | null,
};

export type ModelSubscriptionCustomerOrderFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  customerName?: ModelSubscriptionStringInput | null,
  customerEmail?: ModelSubscriptionStringInput | null,
  customerPhoneNumber?: ModelSubscriptionStringInput | null,
  orderNumber?: ModelSubscriptionStringInput | null,
  orderStatus?: ModelSubscriptionStringInput | null,
  orderNotes?: ModelSubscriptionStringInput | null,
  dateNeededBy?: ModelSubscriptionStringInput | null,
  isDeleted?: ModelSubscriptionBooleanInput | null,
  type?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
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
    quantityOnHand?: number | null,
    isDeleted?: boolean | null,
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
    quantityOnHand?: number | null,
    isDeleted?: boolean | null,
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
    quantityOnHand?: number | null,
    isDeleted?: boolean | null,
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
    orderNumber: string,
    vendor: string,
    orderedItems?:  {
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
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantity: number,
        amountReceived?: number | null,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId?: string | null,
        customerOrderOrderedItemsId?: string | null,
        tShirtOrderTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    status: POStatus,
    changeHistory?:  {
      __typename: "ModelPurchaseOrderChangeConnection",
      items:  Array< {
        __typename: "PurchaseOrderChange",
        tshirt:  {
          __typename: "TShirt",
          id: string,
          styleNumber: string,
          brand: string,
          color: string,
          size: TShirtSize,
          type: TShirtType,
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantityChange: number,
        orderedQuantityChange: number,
        reason: string,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderChangeHistoryId?: string | null,
        purchaseOrderChangeTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    isDeleted?: boolean | null,
    type?: string | null,
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
    orderNumber: string,
    vendor: string,
    orderedItems?:  {
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
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantity: number,
        amountReceived?: number | null,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId?: string | null,
        customerOrderOrderedItemsId?: string | null,
        tShirtOrderTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    status: POStatus,
    changeHistory?:  {
      __typename: "ModelPurchaseOrderChangeConnection",
      items:  Array< {
        __typename: "PurchaseOrderChange",
        tshirt:  {
          __typename: "TShirt",
          id: string,
          styleNumber: string,
          brand: string,
          color: string,
          size: TShirtSize,
          type: TShirtType,
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantityChange: number,
        orderedQuantityChange: number,
        reason: string,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderChangeHistoryId?: string | null,
        purchaseOrderChangeTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    isDeleted?: boolean | null,
    type?: string | null,
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
    orderNumber: string,
    vendor: string,
    orderedItems?:  {
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
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantity: number,
        amountReceived?: number | null,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId?: string | null,
        customerOrderOrderedItemsId?: string | null,
        tShirtOrderTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    status: POStatus,
    changeHistory?:  {
      __typename: "ModelPurchaseOrderChangeConnection",
      items:  Array< {
        __typename: "PurchaseOrderChange",
        tshirt:  {
          __typename: "TShirt",
          id: string,
          styleNumber: string,
          brand: string,
          color: string,
          size: TShirtSize,
          type: TShirtType,
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantityChange: number,
        orderedQuantityChange: number,
        reason: string,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderChangeHistoryId?: string | null,
        purchaseOrderChangeTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    isDeleted?: boolean | null,
    type?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreatePurchaseOrderChangeMutationVariables = {
  input: CreatePurchaseOrderChangeInput,
  condition?: ModelPurchaseOrderChangeConditionInput | null,
};

export type CreatePurchaseOrderChangeMutation = {
  createPurchaseOrderChange?:  {
    __typename: "PurchaseOrderChange",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    quantityChange: number,
    orderedQuantityChange: number,
    reason: string,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderChangeHistoryId?: string | null,
    purchaseOrderChangeTshirtId: string,
  } | null,
};

export type UpdatePurchaseOrderChangeMutationVariables = {
  input: UpdatePurchaseOrderChangeInput,
  condition?: ModelPurchaseOrderChangeConditionInput | null,
};

export type UpdatePurchaseOrderChangeMutation = {
  updatePurchaseOrderChange?:  {
    __typename: "PurchaseOrderChange",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    quantityChange: number,
    orderedQuantityChange: number,
    reason: string,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderChangeHistoryId?: string | null,
    purchaseOrderChangeTshirtId: string,
  } | null,
};

export type DeletePurchaseOrderChangeMutationVariables = {
  input: DeletePurchaseOrderChangeInput,
  condition?: ModelPurchaseOrderChangeConditionInput | null,
};

export type DeletePurchaseOrderChangeMutation = {
  deletePurchaseOrderChange?:  {
    __typename: "PurchaseOrderChange",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    quantityChange: number,
    orderedQuantityChange: number,
    reason: string,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderChangeHistoryId?: string | null,
    purchaseOrderChangeTshirtId: string,
  } | null,
};

export type CreateCustomerOrderChangeMutationVariables = {
  input: CreateCustomerOrderChangeInput,
  condition?: ModelCustomerOrderChangeConditionInput | null,
};

export type CreateCustomerOrderChangeMutation = {
  createCustomerOrderChange?:  {
    __typename: "CustomerOrderChange",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    orderedQuantityChange: number,
    reason: string,
    id: string,
    createdAt: string,
    updatedAt: string,
    customerOrderChangeHistoryId?: string | null,
    customerOrderChangeTshirtId: string,
  } | null,
};

export type UpdateCustomerOrderChangeMutationVariables = {
  input: UpdateCustomerOrderChangeInput,
  condition?: ModelCustomerOrderChangeConditionInput | null,
};

export type UpdateCustomerOrderChangeMutation = {
  updateCustomerOrderChange?:  {
    __typename: "CustomerOrderChange",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    orderedQuantityChange: number,
    reason: string,
    id: string,
    createdAt: string,
    updatedAt: string,
    customerOrderChangeHistoryId?: string | null,
    customerOrderChangeTshirtId: string,
  } | null,
};

export type DeleteCustomerOrderChangeMutationVariables = {
  input: DeleteCustomerOrderChangeInput,
  condition?: ModelCustomerOrderChangeConditionInput | null,
};

export type DeleteCustomerOrderChangeMutation = {
  deleteCustomerOrderChange?:  {
    __typename: "CustomerOrderChange",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    orderedQuantityChange: number,
    reason: string,
    id: string,
    createdAt: string,
    updatedAt: string,
    customerOrderChangeHistoryId?: string | null,
    customerOrderChangeTshirtId: string,
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
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    quantity: number,
    amountReceived?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderOrderedItemsId?: string | null,
    customerOrderOrderedItemsId?: string | null,
    tShirtOrderTshirtId: string,
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
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    quantity: number,
    amountReceived?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderOrderedItemsId?: string | null,
    customerOrderOrderedItemsId?: string | null,
    tShirtOrderTshirtId: string,
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
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    quantity: number,
    amountReceived?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderOrderedItemsId?: string | null,
    customerOrderOrderedItemsId?: string | null,
    tShirtOrderTshirtId: string,
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
    customerName: string,
    customerEmail?: string | null,
    customerPhoneNumber?: string | null,
    orderedItems?:  {
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
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantity: number,
        amountReceived?: number | null,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId?: string | null,
        customerOrderOrderedItemsId?: string | null,
        tShirtOrderTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    orderNumber: string,
    orderStatus: CustomerOrderStatus,
    orderNotes?: string | null,
    dateNeededBy: string,
    changeHistory?:  {
      __typename: "ModelCustomerOrderChangeConnection",
      items:  Array< {
        __typename: "CustomerOrderChange",
        tshirt:  {
          __typename: "TShirt",
          id: string,
          styleNumber: string,
          brand: string,
          color: string,
          size: TShirtSize,
          type: TShirtType,
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        orderedQuantityChange: number,
        reason: string,
        id: string,
        createdAt: string,
        updatedAt: string,
        customerOrderChangeHistoryId?: string | null,
        customerOrderChangeTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    isDeleted?: boolean | null,
    type?: string | null,
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
    customerName: string,
    customerEmail?: string | null,
    customerPhoneNumber?: string | null,
    orderedItems?:  {
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
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantity: number,
        amountReceived?: number | null,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId?: string | null,
        customerOrderOrderedItemsId?: string | null,
        tShirtOrderTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    orderNumber: string,
    orderStatus: CustomerOrderStatus,
    orderNotes?: string | null,
    dateNeededBy: string,
    changeHistory?:  {
      __typename: "ModelCustomerOrderChangeConnection",
      items:  Array< {
        __typename: "CustomerOrderChange",
        tshirt:  {
          __typename: "TShirt",
          id: string,
          styleNumber: string,
          brand: string,
          color: string,
          size: TShirtSize,
          type: TShirtType,
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        orderedQuantityChange: number,
        reason: string,
        id: string,
        createdAt: string,
        updatedAt: string,
        customerOrderChangeHistoryId?: string | null,
        customerOrderChangeTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    isDeleted?: boolean | null,
    type?: string | null,
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
    customerName: string,
    customerEmail?: string | null,
    customerPhoneNumber?: string | null,
    orderedItems?:  {
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
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantity: number,
        amountReceived?: number | null,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId?: string | null,
        customerOrderOrderedItemsId?: string | null,
        tShirtOrderTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    orderNumber: string,
    orderStatus: CustomerOrderStatus,
    orderNotes?: string | null,
    dateNeededBy: string,
    changeHistory?:  {
      __typename: "ModelCustomerOrderChangeConnection",
      items:  Array< {
        __typename: "CustomerOrderChange",
        tshirt:  {
          __typename: "TShirt",
          id: string,
          styleNumber: string,
          brand: string,
          color: string,
          size: TShirtSize,
          type: TShirtType,
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        orderedQuantityChange: number,
        reason: string,
        id: string,
        createdAt: string,
        updatedAt: string,
        customerOrderChangeHistoryId?: string | null,
        customerOrderChangeTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    isDeleted?: boolean | null,
    type?: string | null,
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
    quantityOnHand?: number | null,
    isDeleted?: boolean | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListTShirtsQueryVariables = {
  id?: string | null,
  filter?: ModelTShirtFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
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
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
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
    orderNumber: string,
    vendor: string,
    orderedItems?:  {
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
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantity: number,
        amountReceived?: number | null,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId?: string | null,
        customerOrderOrderedItemsId?: string | null,
        tShirtOrderTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    status: POStatus,
    changeHistory?:  {
      __typename: "ModelPurchaseOrderChangeConnection",
      items:  Array< {
        __typename: "PurchaseOrderChange",
        tshirt:  {
          __typename: "TShirt",
          id: string,
          styleNumber: string,
          brand: string,
          color: string,
          size: TShirtSize,
          type: TShirtType,
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantityChange: number,
        orderedQuantityChange: number,
        reason: string,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderChangeHistoryId?: string | null,
        purchaseOrderChangeTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    isDeleted?: boolean | null,
    type?: string | null,
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
      orderNumber: string,
      vendor: string,
      orderedItems?:  {
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
            quantityOnHand?: number | null,
            isDeleted?: boolean | null,
            createdAt: string,
            updatedAt: string,
          },
          quantity: number,
          amountReceived?: number | null,
          id: string,
          createdAt: string,
          updatedAt: string,
          purchaseOrderOrderedItemsId?: string | null,
          customerOrderOrderedItemsId?: string | null,
          tShirtOrderTshirtId: string,
        } | null >,
        nextToken?: string | null,
      } | null,
      status: POStatus,
      changeHistory?:  {
        __typename: "ModelPurchaseOrderChangeConnection",
        items:  Array< {
          __typename: "PurchaseOrderChange",
          tshirt:  {
            __typename: "TShirt",
            id: string,
            styleNumber: string,
            brand: string,
            color: string,
            size: TShirtSize,
            type: TShirtType,
            quantityOnHand?: number | null,
            isDeleted?: boolean | null,
            createdAt: string,
            updatedAt: string,
          },
          quantityChange: number,
          orderedQuantityChange: number,
          reason: string,
          id: string,
          createdAt: string,
          updatedAt: string,
          purchaseOrderChangeHistoryId?: string | null,
          purchaseOrderChangeTshirtId: string,
        } | null >,
        nextToken?: string | null,
      } | null,
      isDeleted?: boolean | null,
      type?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type PurchaseOrdersByCreatedAtQueryVariables = {
  type: string,
  createdAt?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelPurchaseOrderFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type PurchaseOrdersByCreatedAtQuery = {
  purchaseOrdersByCreatedAt?:  {
    __typename: "ModelPurchaseOrderConnection",
    items:  Array< {
      __typename: "PurchaseOrder",
      id: string,
      orderNumber: string,
      vendor: string,
      orderedItems?:  {
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
            quantityOnHand?: number | null,
            isDeleted?: boolean | null,
            createdAt: string,
            updatedAt: string,
          },
          quantity: number,
          amountReceived?: number | null,
          id: string,
          createdAt: string,
          updatedAt: string,
          purchaseOrderOrderedItemsId?: string | null,
          customerOrderOrderedItemsId?: string | null,
          tShirtOrderTshirtId: string,
        } | null >,
        nextToken?: string | null,
      } | null,
      status: POStatus,
      changeHistory?:  {
        __typename: "ModelPurchaseOrderChangeConnection",
        items:  Array< {
          __typename: "PurchaseOrderChange",
          tshirt:  {
            __typename: "TShirt",
            id: string,
            styleNumber: string,
            brand: string,
            color: string,
            size: TShirtSize,
            type: TShirtType,
            quantityOnHand?: number | null,
            isDeleted?: boolean | null,
            createdAt: string,
            updatedAt: string,
          },
          quantityChange: number,
          orderedQuantityChange: number,
          reason: string,
          id: string,
          createdAt: string,
          updatedAt: string,
          purchaseOrderChangeHistoryId?: string | null,
          purchaseOrderChangeTshirtId: string,
        } | null >,
        nextToken?: string | null,
      } | null,
      isDeleted?: boolean | null,
      type?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetPurchaseOrderChangeQueryVariables = {
  id: string,
};

export type GetPurchaseOrderChangeQuery = {
  getPurchaseOrderChange?:  {
    __typename: "PurchaseOrderChange",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    quantityChange: number,
    orderedQuantityChange: number,
    reason: string,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderChangeHistoryId?: string | null,
    purchaseOrderChangeTshirtId: string,
  } | null,
};

export type ListPurchaseOrderChangesQueryVariables = {
  filter?: ModelPurchaseOrderChangeFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPurchaseOrderChangesQuery = {
  listPurchaseOrderChanges?:  {
    __typename: "ModelPurchaseOrderChangeConnection",
    items:  Array< {
      __typename: "PurchaseOrderChange",
      tshirt:  {
        __typename: "TShirt",
        id: string,
        styleNumber: string,
        brand: string,
        color: string,
        size: TShirtSize,
        type: TShirtType,
        quantityOnHand?: number | null,
        isDeleted?: boolean | null,
        createdAt: string,
        updatedAt: string,
      },
      quantityChange: number,
      orderedQuantityChange: number,
      reason: string,
      id: string,
      createdAt: string,
      updatedAt: string,
      purchaseOrderChangeHistoryId?: string | null,
      purchaseOrderChangeTshirtId: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetCustomerOrderChangeQueryVariables = {
  id: string,
};

export type GetCustomerOrderChangeQuery = {
  getCustomerOrderChange?:  {
    __typename: "CustomerOrderChange",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    orderedQuantityChange: number,
    reason: string,
    id: string,
    createdAt: string,
    updatedAt: string,
    customerOrderChangeHistoryId?: string | null,
    customerOrderChangeTshirtId: string,
  } | null,
};

export type ListCustomerOrderChangesQueryVariables = {
  filter?: ModelCustomerOrderChangeFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListCustomerOrderChangesQuery = {
  listCustomerOrderChanges?:  {
    __typename: "ModelCustomerOrderChangeConnection",
    items:  Array< {
      __typename: "CustomerOrderChange",
      tshirt:  {
        __typename: "TShirt",
        id: string,
        styleNumber: string,
        brand: string,
        color: string,
        size: TShirtSize,
        type: TShirtType,
        quantityOnHand?: number | null,
        isDeleted?: boolean | null,
        createdAt: string,
        updatedAt: string,
      },
      orderedQuantityChange: number,
      reason: string,
      id: string,
      createdAt: string,
      updatedAt: string,
      customerOrderChangeHistoryId?: string | null,
      customerOrderChangeTshirtId: string,
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
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    quantity: number,
    amountReceived?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderOrderedItemsId?: string | null,
    customerOrderOrderedItemsId?: string | null,
    tShirtOrderTshirtId: string,
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
        quantityOnHand?: number | null,
        isDeleted?: boolean | null,
        createdAt: string,
        updatedAt: string,
      },
      quantity: number,
      amountReceived?: number | null,
      id: string,
      createdAt: string,
      updatedAt: string,
      purchaseOrderOrderedItemsId?: string | null,
      customerOrderOrderedItemsId?: string | null,
      tShirtOrderTshirtId: string,
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
    customerName: string,
    customerEmail?: string | null,
    customerPhoneNumber?: string | null,
    orderedItems?:  {
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
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantity: number,
        amountReceived?: number | null,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId?: string | null,
        customerOrderOrderedItemsId?: string | null,
        tShirtOrderTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    orderNumber: string,
    orderStatus: CustomerOrderStatus,
    orderNotes?: string | null,
    dateNeededBy: string,
    changeHistory?:  {
      __typename: "ModelCustomerOrderChangeConnection",
      items:  Array< {
        __typename: "CustomerOrderChange",
        tshirt:  {
          __typename: "TShirt",
          id: string,
          styleNumber: string,
          brand: string,
          color: string,
          size: TShirtSize,
          type: TShirtType,
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        orderedQuantityChange: number,
        reason: string,
        id: string,
        createdAt: string,
        updatedAt: string,
        customerOrderChangeHistoryId?: string | null,
        customerOrderChangeTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    isDeleted?: boolean | null,
    type?: string | null,
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
      customerName: string,
      customerEmail?: string | null,
      customerPhoneNumber?: string | null,
      orderedItems?:  {
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
            quantityOnHand?: number | null,
            isDeleted?: boolean | null,
            createdAt: string,
            updatedAt: string,
          },
          quantity: number,
          amountReceived?: number | null,
          id: string,
          createdAt: string,
          updatedAt: string,
          purchaseOrderOrderedItemsId?: string | null,
          customerOrderOrderedItemsId?: string | null,
          tShirtOrderTshirtId: string,
        } | null >,
        nextToken?: string | null,
      } | null,
      orderNumber: string,
      orderStatus: CustomerOrderStatus,
      orderNotes?: string | null,
      dateNeededBy: string,
      changeHistory?:  {
        __typename: "ModelCustomerOrderChangeConnection",
        items:  Array< {
          __typename: "CustomerOrderChange",
          tshirt:  {
            __typename: "TShirt",
            id: string,
            styleNumber: string,
            brand: string,
            color: string,
            size: TShirtSize,
            type: TShirtType,
            quantityOnHand?: number | null,
            isDeleted?: boolean | null,
            createdAt: string,
            updatedAt: string,
          },
          orderedQuantityChange: number,
          reason: string,
          id: string,
          createdAt: string,
          updatedAt: string,
          customerOrderChangeHistoryId?: string | null,
          customerOrderChangeTshirtId: string,
        } | null >,
        nextToken?: string | null,
      } | null,
      isDeleted?: boolean | null,
      type?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CustomerOrdersByCreatedAtQueryVariables = {
  type: string,
  createdAt?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCustomerOrderFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type CustomerOrdersByCreatedAtQuery = {
  customerOrdersByCreatedAt?:  {
    __typename: "ModelCustomerOrderConnection",
    items:  Array< {
      __typename: "CustomerOrder",
      id: string,
      customerName: string,
      customerEmail?: string | null,
      customerPhoneNumber?: string | null,
      orderedItems?:  {
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
            quantityOnHand?: number | null,
            isDeleted?: boolean | null,
            createdAt: string,
            updatedAt: string,
          },
          quantity: number,
          amountReceived?: number | null,
          id: string,
          createdAt: string,
          updatedAt: string,
          purchaseOrderOrderedItemsId?: string | null,
          customerOrderOrderedItemsId?: string | null,
          tShirtOrderTshirtId: string,
        } | null >,
        nextToken?: string | null,
      } | null,
      orderNumber: string,
      orderStatus: CustomerOrderStatus,
      orderNotes?: string | null,
      dateNeededBy: string,
      changeHistory?:  {
        __typename: "ModelCustomerOrderChangeConnection",
        items:  Array< {
          __typename: "CustomerOrderChange",
          tshirt:  {
            __typename: "TShirt",
            id: string,
            styleNumber: string,
            brand: string,
            color: string,
            size: TShirtSize,
            type: TShirtType,
            quantityOnHand?: number | null,
            isDeleted?: boolean | null,
            createdAt: string,
            updatedAt: string,
          },
          orderedQuantityChange: number,
          reason: string,
          id: string,
          createdAt: string,
          updatedAt: string,
          customerOrderChangeHistoryId?: string | null,
          customerOrderChangeTshirtId: string,
        } | null >,
        nextToken?: string | null,
      } | null,
      isDeleted?: boolean | null,
      type?: string | null,
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
    quantityOnHand?: number | null,
    isDeleted?: boolean | null,
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
    quantityOnHand?: number | null,
    isDeleted?: boolean | null,
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
    quantityOnHand?: number | null,
    isDeleted?: boolean | null,
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
    orderNumber: string,
    vendor: string,
    orderedItems?:  {
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
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantity: number,
        amountReceived?: number | null,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId?: string | null,
        customerOrderOrderedItemsId?: string | null,
        tShirtOrderTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    status: POStatus,
    changeHistory?:  {
      __typename: "ModelPurchaseOrderChangeConnection",
      items:  Array< {
        __typename: "PurchaseOrderChange",
        tshirt:  {
          __typename: "TShirt",
          id: string,
          styleNumber: string,
          brand: string,
          color: string,
          size: TShirtSize,
          type: TShirtType,
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantityChange: number,
        orderedQuantityChange: number,
        reason: string,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderChangeHistoryId?: string | null,
        purchaseOrderChangeTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    isDeleted?: boolean | null,
    type?: string | null,
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
    orderNumber: string,
    vendor: string,
    orderedItems?:  {
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
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantity: number,
        amountReceived?: number | null,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId?: string | null,
        customerOrderOrderedItemsId?: string | null,
        tShirtOrderTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    status: POStatus,
    changeHistory?:  {
      __typename: "ModelPurchaseOrderChangeConnection",
      items:  Array< {
        __typename: "PurchaseOrderChange",
        tshirt:  {
          __typename: "TShirt",
          id: string,
          styleNumber: string,
          brand: string,
          color: string,
          size: TShirtSize,
          type: TShirtType,
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantityChange: number,
        orderedQuantityChange: number,
        reason: string,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderChangeHistoryId?: string | null,
        purchaseOrderChangeTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    isDeleted?: boolean | null,
    type?: string | null,
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
    orderNumber: string,
    vendor: string,
    orderedItems?:  {
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
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantity: number,
        amountReceived?: number | null,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId?: string | null,
        customerOrderOrderedItemsId?: string | null,
        tShirtOrderTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    status: POStatus,
    changeHistory?:  {
      __typename: "ModelPurchaseOrderChangeConnection",
      items:  Array< {
        __typename: "PurchaseOrderChange",
        tshirt:  {
          __typename: "TShirt",
          id: string,
          styleNumber: string,
          brand: string,
          color: string,
          size: TShirtSize,
          type: TShirtType,
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantityChange: number,
        orderedQuantityChange: number,
        reason: string,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderChangeHistoryId?: string | null,
        purchaseOrderChangeTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    isDeleted?: boolean | null,
    type?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreatePurchaseOrderChangeSubscriptionVariables = {
  filter?: ModelSubscriptionPurchaseOrderChangeFilterInput | null,
};

export type OnCreatePurchaseOrderChangeSubscription = {
  onCreatePurchaseOrderChange?:  {
    __typename: "PurchaseOrderChange",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    quantityChange: number,
    orderedQuantityChange: number,
    reason: string,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderChangeHistoryId?: string | null,
    purchaseOrderChangeTshirtId: string,
  } | null,
};

export type OnUpdatePurchaseOrderChangeSubscriptionVariables = {
  filter?: ModelSubscriptionPurchaseOrderChangeFilterInput | null,
};

export type OnUpdatePurchaseOrderChangeSubscription = {
  onUpdatePurchaseOrderChange?:  {
    __typename: "PurchaseOrderChange",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    quantityChange: number,
    orderedQuantityChange: number,
    reason: string,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderChangeHistoryId?: string | null,
    purchaseOrderChangeTshirtId: string,
  } | null,
};

export type OnDeletePurchaseOrderChangeSubscriptionVariables = {
  filter?: ModelSubscriptionPurchaseOrderChangeFilterInput | null,
};

export type OnDeletePurchaseOrderChangeSubscription = {
  onDeletePurchaseOrderChange?:  {
    __typename: "PurchaseOrderChange",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    quantityChange: number,
    orderedQuantityChange: number,
    reason: string,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderChangeHistoryId?: string | null,
    purchaseOrderChangeTshirtId: string,
  } | null,
};

export type OnCreateCustomerOrderChangeSubscriptionVariables = {
  filter?: ModelSubscriptionCustomerOrderChangeFilterInput | null,
};

export type OnCreateCustomerOrderChangeSubscription = {
  onCreateCustomerOrderChange?:  {
    __typename: "CustomerOrderChange",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    orderedQuantityChange: number,
    reason: string,
    id: string,
    createdAt: string,
    updatedAt: string,
    customerOrderChangeHistoryId?: string | null,
    customerOrderChangeTshirtId: string,
  } | null,
};

export type OnUpdateCustomerOrderChangeSubscriptionVariables = {
  filter?: ModelSubscriptionCustomerOrderChangeFilterInput | null,
};

export type OnUpdateCustomerOrderChangeSubscription = {
  onUpdateCustomerOrderChange?:  {
    __typename: "CustomerOrderChange",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    orderedQuantityChange: number,
    reason: string,
    id: string,
    createdAt: string,
    updatedAt: string,
    customerOrderChangeHistoryId?: string | null,
    customerOrderChangeTshirtId: string,
  } | null,
};

export type OnDeleteCustomerOrderChangeSubscriptionVariables = {
  filter?: ModelSubscriptionCustomerOrderChangeFilterInput | null,
};

export type OnDeleteCustomerOrderChangeSubscription = {
  onDeleteCustomerOrderChange?:  {
    __typename: "CustomerOrderChange",
    tshirt:  {
      __typename: "TShirt",
      id: string,
      styleNumber: string,
      brand: string,
      color: string,
      size: TShirtSize,
      type: TShirtType,
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    orderedQuantityChange: number,
    reason: string,
    id: string,
    createdAt: string,
    updatedAt: string,
    customerOrderChangeHistoryId?: string | null,
    customerOrderChangeTshirtId: string,
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
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    quantity: number,
    amountReceived?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderOrderedItemsId?: string | null,
    customerOrderOrderedItemsId?: string | null,
    tShirtOrderTshirtId: string,
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
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    quantity: number,
    amountReceived?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderOrderedItemsId?: string | null,
    customerOrderOrderedItemsId?: string | null,
    tShirtOrderTshirtId: string,
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
      quantityOnHand?: number | null,
      isDeleted?: boolean | null,
      createdAt: string,
      updatedAt: string,
    },
    quantity: number,
    amountReceived?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    purchaseOrderOrderedItemsId?: string | null,
    customerOrderOrderedItemsId?: string | null,
    tShirtOrderTshirtId: string,
  } | null,
};

export type OnCreateCustomerOrderSubscriptionVariables = {
  filter?: ModelSubscriptionCustomerOrderFilterInput | null,
};

export type OnCreateCustomerOrderSubscription = {
  onCreateCustomerOrder?:  {
    __typename: "CustomerOrder",
    id: string,
    customerName: string,
    customerEmail?: string | null,
    customerPhoneNumber?: string | null,
    orderedItems?:  {
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
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantity: number,
        amountReceived?: number | null,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId?: string | null,
        customerOrderOrderedItemsId?: string | null,
        tShirtOrderTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    orderNumber: string,
    orderStatus: CustomerOrderStatus,
    orderNotes?: string | null,
    dateNeededBy: string,
    changeHistory?:  {
      __typename: "ModelCustomerOrderChangeConnection",
      items:  Array< {
        __typename: "CustomerOrderChange",
        tshirt:  {
          __typename: "TShirt",
          id: string,
          styleNumber: string,
          brand: string,
          color: string,
          size: TShirtSize,
          type: TShirtType,
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        orderedQuantityChange: number,
        reason: string,
        id: string,
        createdAt: string,
        updatedAt: string,
        customerOrderChangeHistoryId?: string | null,
        customerOrderChangeTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    isDeleted?: boolean | null,
    type?: string | null,
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
    customerName: string,
    customerEmail?: string | null,
    customerPhoneNumber?: string | null,
    orderedItems?:  {
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
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantity: number,
        amountReceived?: number | null,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId?: string | null,
        customerOrderOrderedItemsId?: string | null,
        tShirtOrderTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    orderNumber: string,
    orderStatus: CustomerOrderStatus,
    orderNotes?: string | null,
    dateNeededBy: string,
    changeHistory?:  {
      __typename: "ModelCustomerOrderChangeConnection",
      items:  Array< {
        __typename: "CustomerOrderChange",
        tshirt:  {
          __typename: "TShirt",
          id: string,
          styleNumber: string,
          brand: string,
          color: string,
          size: TShirtSize,
          type: TShirtType,
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        orderedQuantityChange: number,
        reason: string,
        id: string,
        createdAt: string,
        updatedAt: string,
        customerOrderChangeHistoryId?: string | null,
        customerOrderChangeTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    isDeleted?: boolean | null,
    type?: string | null,
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
    customerName: string,
    customerEmail?: string | null,
    customerPhoneNumber?: string | null,
    orderedItems?:  {
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
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        quantity: number,
        amountReceived?: number | null,
        id: string,
        createdAt: string,
        updatedAt: string,
        purchaseOrderOrderedItemsId?: string | null,
        customerOrderOrderedItemsId?: string | null,
        tShirtOrderTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    orderNumber: string,
    orderStatus: CustomerOrderStatus,
    orderNotes?: string | null,
    dateNeededBy: string,
    changeHistory?:  {
      __typename: "ModelCustomerOrderChangeConnection",
      items:  Array< {
        __typename: "CustomerOrderChange",
        tshirt:  {
          __typename: "TShirt",
          id: string,
          styleNumber: string,
          brand: string,
          color: string,
          size: TShirtSize,
          type: TShirtType,
          quantityOnHand?: number | null,
          isDeleted?: boolean | null,
          createdAt: string,
          updatedAt: string,
        },
        orderedQuantityChange: number,
        reason: string,
        id: string,
        createdAt: string,
        updatedAt: string,
        customerOrderChangeHistoryId?: string | null,
        customerOrderChangeTshirtId: string,
      } | null >,
      nextToken?: string | null,
    } | null,
    isDeleted?: boolean | null,
    type?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};
