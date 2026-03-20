import { Router } from "express";
import { register, login, logout, me } from "../../controllers/auth/auth.controller.js";
import { isAuthenticated } from "../../middlewares/isAuthenticated.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", isAuthenticated, me);

export default authRouter;
