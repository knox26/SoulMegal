import jwt from "jsonwebtoken";
import User from "../model/user-model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check if token is valid
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized, Invalid token " });
    }
    // Check if user exists
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
