// src/api/client.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "";

const client = axios.create({
  // baseURL: BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Add token automatically if موجود
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response handling
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("authToken");
      // اختياري: redirect للـ login لو حبيتي
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default client;
