import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from cookies
    const { token } = req.cookies || {};

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, please login again",
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
        return res.status(401).json({
            success: false,
            message: "Invalid token payload"
        });
    }

    // 3. Attach userId to request object
    req.userId = decoded.id;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Session expired, please login again",
    });
  }
};

export default authMiddleware;