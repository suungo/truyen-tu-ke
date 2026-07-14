import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-secret": "da-truyen-tu-ke-secret-key-9988",
  },
});

// Backward compat alias
export const BASE_URL = apiClient;