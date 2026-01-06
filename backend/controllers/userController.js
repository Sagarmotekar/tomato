import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Helper to create JWT
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Cookie options for local + production
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // false for localhost
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ================= LOGIN USER =================
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Incorrect password" });

    const token = createToken(user._id);
    res.cookie("token", token, cookieOptions);

    res.json({
      success: true,
      message: "Login successful",
      user: { name: user.name, email: user.email },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// ================= REGISTER USER =================
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await userModel.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "User already exists" });

    if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: "Invalid email" });
    if (password.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();

    const token = createToken(user._id);
    res.cookie("token", token, cookieOptions);

    res.json({
      success: true,
      message: "Registration successful",
      user: { name: user.name, email: user.email },
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

// ================= LOGOUT USER =================
export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    ...cookieOptions,
    maxAge: 0
  });

  res.json({ success: true, message: "Logged out successfully" });
};

// ================= GET USER PROFILE =================
export const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};
