import { Router } from "express";
import express from "express";
import {
  getPresignedUrl,
  logEvents,
  completeRecording,
  getSession,
  getProctoringData,
  relayChunk,
} from "../controllers/proctoringController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAllowed }       from "../middlewares/isAllowed.js";

const proctoringRouter = Router();

// ── Relay (sendBeacon on unload — auth via ?t=token, raw binary body) ──────────
// Must be registered before express.json() would otherwise consume the body.
// express.raw() parses video/webm and application/octet-stream into req.body Buffer.
proctoringRouter.post(
  "/relay-chunk",
  express.raw({ type: ["video/webm", "application/octet-stream"], limit: "50mb" }),
  relayChunk,
);

// ── Candidate ──────────────────────────────────────────────────────────────────
proctoringRouter.post("/presigned-url", isAuthenticated, getPresignedUrl);
proctoringRouter.post("/log",           isAuthenticated, logEvents);
proctoringRouter.post("/complete",      isAuthenticated, completeRecording);
proctoringRouter.get ("/session/:solutionId", isAuthenticated, getSession);

// ── Admin ──────────────────────────────────────────────────────────────────────
proctoringRouter.get("/:solutionId", isAuthenticated, isAllowed, getProctoringData);

export default proctoringRouter;
