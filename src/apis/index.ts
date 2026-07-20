import axios from "axios";
import axiosRetry from "axios-retry";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  timeout: 35000,
  headers: {
    "Content-Type": "application/json",
    "x-api-secret": "da-truyen-tu-ke-secret-key-9988",
  },
});

axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === "ECONNABORTED" ||
      error.response?.status === 502 ||
      error.response?.status === 503 ||
      error.response?.status === 504
    );
  },
});

export const BASE_URL = apiClient;
