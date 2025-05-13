import { TShirtSize, TShirtType } from "@/API";

export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export interface Pagination {
  doCompletePagination?: boolean;
  sortDirection?: SortDirection;
  nextToken?: string | null;
  limit?: number;
}

export interface ListAPIResponse<T> {
  data: Page<T>;
}

export interface CreateAPIResponse<T> {
    data: T;
}

export interface Page<T> {
  items: T[];
  nextToken: string | null | undefined | unknown;
}

export type CreateTShirtAPIInput = {
  styleNumber: string;
  brand: string;
  color: string;
  size: TShirtSize;
  type: TShirtType;
  quantityOnHand?: number;
};

export type CreateTShirtAPIResponse = {
  id: string;
  styleNumber: string;
  color: string;
  size: TShirtSize;
  brand: string;
  type: TShirtType;
  quantityOnHand: number;
  isDeleted: boolean;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
};
