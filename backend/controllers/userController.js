import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Helper to create JWT
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Common cookie options for cross-site production (Vercel + Render)
const cookieOptions = {
  httpOnly: true,
  secure: true,   // Required for SameSite: 'none'
  sameSite: "none", // Required for cross-domain (Vercel -> Render)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ================= LOGIN USER =================
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    const token = createToken(user._id);

    // Set the cookie
    res.cookie("token", token, cookieOptions);

    res.json({ 
      success: true, 
      message: "Login successful", 
      user: { name: user.name, email: user.email } 
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
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();

    const token = createToken(user._id);
    res.cookie("token", token, cookieOptions);

    res.json({ success: true, message: "Registration successful" });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

// ================= LOGOUT USER =================
export const logoutUser = (req, res) => {
  // Clearing the cookie with same options it was set with
  res.clearCookie("token", {
    ...cookieOptions,
    maxAge: 0 // expire immediately
  });

  res.json({ success: true, message: "Logged out successfully" });
};

// ================= GET USER PROFILE =================
export const getProfile = async (req, res) => {
  try {
    // req.userId is attached by your authMiddleware
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};