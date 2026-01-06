// src/api/cartApi.js
import api from "../api/axios";

// Add item to cart
export const addToCart = async (itemId) => {
  const res = await api.post("/api/cart/add", { itemId });
  return res.data;
};

// Remove item from cart
export const removeFromCart = async (itemId) => {
  const res = await api.post("/api/cart/remove", { itemId });
  return res.data;
};

// Get cart
export const getCart = async () => {
  const res = await api.get("/api/cart");
  return res.data;
};
