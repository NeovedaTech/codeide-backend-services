import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { corsConfig, db } from "../config/config.js";
import { generalRateLimiter } from "../config/rateLimiter.js";
import { setupMorgan } from "../config/morgan.js";
import { initWebSocket } from "./services/webSocket.js";
import "../config/redisconn.js";

import assesmentRouter    from "./routes/assesmentRouter.js";
import codeExecutionRouter from "./routes/codeExecutionRoutes.js";
import userRouter          from "./routes/userRouter.js";
import testRouter          from "./routes/testRouter.js";
import roleSkillRouter     from "./routes/role-skill/role-skill.routes.js";
import authRouter          from "./routes/auth/auth.routes.js";
import adminRouter         from "./routes/adminRoutes.js";
import proctoringRouter    from "./routes/proctoringRoutes.js";

dotenv.config();

const app    = express();
const server = http.createServer(app);

app.set("trust proxy", true);

// ── Logging ──────────────────────────────────────────────────────────────────
setupMorgan(app);

morgan.token("remote-ip", (req) => req.headers["x-forwarded-for"] || req.socket.remoteAddress);
const logFormat = ':date[iso] | :remote-ip | :method :url | :status | :res[content-length] bytes | :response-time ms';
app.use(process.env.NODE_ENV === "PROD"
  ? morgan(logFormat, { skip: (_, res) => res.statusCode < 400 })
  : morgan(logFormat)
);

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: process.env.NODE_ENV === "PROD" ? undefined : false,
}));

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());

// ── DB ────────────────────────────────────────────────────────────────────────
await db();

// ── WebSocket ─────────────────────────────────────────────────────────────────
initWebSocket(server);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/auth",           authRouter);
app.use("/api/v1/assesments",     assesmentRouter);
app.use("/api/v1/code-execution", codeExecutionRouter);
app.use("/api/v1/user",           userRouter);
app.use("/api/v1/test",           testRouter);
app.use("/api/v1/role-skill",     roleSkillRouter);
app.use("/api/v1/admin",          adminRouter);
app.use("/api/v1/proctoring",     proctoringRouter);

// ── Rate limiter (after routes so health check is unthrottled) ────────────────
app.use(generalRateLimiter);

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => res.json({ message: "OK" }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error({ message: err.message, url: req.originalUrl, method: req.method });
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});
