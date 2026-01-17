import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const optionalAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we continue without user
        req.user = null;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};