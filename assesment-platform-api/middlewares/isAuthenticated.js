import { verifyToken } from "../services/auth/auth.service.js";

export const isAuthenticated = (req, res, next) => {
  const tokenFromCookie = req.cookies?.token;
  const authHeader = req.headers["authorization"];
  const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  req.user = payload;
  next();
};
