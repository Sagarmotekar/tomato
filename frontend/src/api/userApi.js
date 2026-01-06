// src/api/userApi.js
import api from "./axios";

// LOGIN
export const loginUser = async (email, password) => {
  const res = await api.post("/api/user/login", { email, password });
  return res.data;
};

// REGISTER
export const registerUser = async (name, email, password) => {
  const res = await api.post("/api/user/register", { name, email, password });
  return res.data;
};

// LOGOUT
export const logoutUser = async () => {
  const res = await api.post("/api/user/logout");
  return res.data;
};

// GET PROFILE
export const getProfile = async () => {
  const res = await api.get("/api/user/profile");
  return res.data;
};
