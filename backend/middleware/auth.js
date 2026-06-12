import jwt from "jsonwebtoken";
import User from "../models/User.js";

// require a valid JWT; attaches req.user
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User no longer exists" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
}

// require req.user.isAdmin (use after protect)
export function adminOnly(req, res, next) {
  if (req.user?.isAdmin) return next();
  res.status(403).json({ message: "Admin access required" });
}

export function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "7d" });
}
