import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Render automatically sets some env vars, but it's best to set NODE_ENV to "production" in Render Dashboard
const isProduction = process.env.NODE_ENV === "production";

// CREATE TOKEN
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ================= LOGIN USER =================
const loginUser = async (req, res) => {
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

    // Cookie configuration for Cross-Domain (Vercel -> Render)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Always true for HTTPS (Render provides SSL)
      sameSite: "none", // Required for cross-site cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: "Login successful", user: { name: user.name, email: user.email } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= REGISTER USER =================
const registerUser = async (req, res) => {
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
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: "Registration successful" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= LOGOUT USER =================
const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({ success: true, message: "Logged out successfully" });
};

// ================= GET USER PROFILE =================
const getProfile = async (req, res) => {
  try {
    // req.userId comes from your authMiddleware
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

export { loginUser, registerUser, logoutUser, getProfile };