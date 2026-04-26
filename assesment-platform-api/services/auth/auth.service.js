import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import { USER_JWT_SECRET } from "../../../config/config.js";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

const signToken = (payload) => jwt.sign(payload, USER_JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

export const register = async ({ name, email, password, skillLevel }) => {
  if (!name || !email || !password) {
    const err = new Error("name, email and password are required");
    err.status = 400;
    throw err;
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    const err = new Error("Email already registered");
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const user = await User.create({
    userId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    skillLevel: skillLevel || "medium",
    assessmentId: "default",
  });

  const token = signToken({ id: user._id, userId: user.userId, email: user.email, role: user.role });

  return { token, user: sanitize(user) };
};

export const login = async ({ email, password }) => {
  if (!email || !password) {
    const err = new Error("email and password are required");
    err.status = 400;
    throw err;
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.password) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const token = signToken({ id: user._id, userId: user.userId, email: user.email, role: user.role });

  return { token, user: sanitize(user) };
};

export const me = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return sanitize(user);
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, USER_JWT_SECRET);
  } catch {
    return null;
  }
};

const sanitize = (user) => ({
  _id: user._id,
  userId: user.userId,
  name: user.name,
  email: user.email,
  role: user.role,
  skillLevel: user.skillLevel,
  assessmentStatus: user.assessmentStatus,
  createdAt: user.createdAt,
});
