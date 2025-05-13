import { apiClient } from "./api";
import axios, { AxiosResponse } from "axios";
import {
  CreateAPIResponse,
  CreateTShirtAPIInput,
  CreateTShirtAPIResponse,
} from "./types";

export const createTShirtAPI = async (
  tshirt: CreateTShirtAPIInput
): Promise<CreateTShirtAPIResponse> => {
  const response = await apiClient
    .post<
      CreateTShirtAPIInput,
      AxiosResponse<CreateAPIResponse<CreateTShirtAPIResponse>>
    >("/tshirt", tshirt)
  return response.data.data;
};
