import { TShirtOrder } from "@/API";

export interface Order {
  __typename: string;
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  taxRate: number;
  orderedItems: TShirtOrder[];
  isDeleted?: boolean | null;
}

export interface DetailedReportOrder {
  __typename: string;
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  orderedItems: TShirtOrder[];
  isDeleted?: boolean | null;
}
