import express from "express";
import { loginUser, registerUser, logoutUser, getProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js"; // Ensure path is correct

const userRouter = express.Router();

// Public routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Private/Protected routes
userRouter.post("/logout", logoutUser);
userRouter.get("/profile", authMiddleware, getProfile);

export default userRouter;