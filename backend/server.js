import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import CartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Trusting the Render proxy for secure cookies
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://tomato.vercel.app" // Ensure this exactly matches your Vercel URL (no trailing slash)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// DB Connection
connectDB();

// API Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", CartRouter);
app.use("/api/order", orderRouter);

// Static files (Make sure 'uploads' folder exists in your repo or is created on build)
app.use("/images", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});