import express from "express";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";

const foodRouter = express.Router();

// image storage
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// 🔒 Protect add & remove
foodRouter.post("/add", authMiddleware, upload.single("image"), addFood);
foodRouter.post("/remove", authMiddleware, removeFood);

// 🌍 Public
foodRouter.get("/list", listFood);

export default foodRouter;
