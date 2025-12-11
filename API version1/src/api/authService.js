// src/api/authService.js
import client from "./client";

export const register = (payload) => client.post("/api/auth/register", payload);

// export const login = (payload) => client.post("/api/auth/login", payload);
// export const me = () => client.get("/api/auth/me");
// export const logout = () => client.post("/api/auth/logout");
