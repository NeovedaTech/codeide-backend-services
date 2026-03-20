import * as authService from "../../services/auth/auth.service.js";
import { COOKIE_OPTIONS } from "../../../config/config.js";

export const register = async (req, res, next) => {
  try {
    const { token, user } = await authService.register(req.body);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { token, user } = await authService.login(req.body);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ success: true, message: "Logged out" });
};

export const me = async (req, res, next) => {
  try {
    const user = await authService.me(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
