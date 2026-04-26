export const isAllowed = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthenticated" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};
