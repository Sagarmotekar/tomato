import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// USER
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.get("/userorders", authMiddleware, userOrders);

// STRIPE
orderRouter.post("/verify", verifyOrder);

// ADMIN
orderRouter.get("/list", authMiddleware, listOrders);
orderRouter.post("/status", authMiddleware, updateStatus);

export default orderRouter;
