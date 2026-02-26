import { WebSocketServer } from "ws";
import { randomUUID } from "crypto";
import { logger } from "./logger.js";
import { createContainer, destroyContainer } from "./dockerManager.js";
import { createTerminal } from "./terminal.js";
import {
  addSession,
  getSession,
  removeSession,
  getSessionCount
} from "./sessionManager.js";
import { config } from "../config/env.js";

let wss;

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", async (ws) => {
    if (getSessionCount() >= config.maxSessions) {
      ws.close();
      return;
    }

    const sessionId = randomUUID();

    try {
      const containerId = await createContainer();
      const shell = createTerminal(containerId);

      const timeout = setTimeout(
        () => cleanup(sessionId),
        config.sessionTimeout
      );

      addSession(sessionId, { ws, shell, containerId, timeout });

      // stdout → websocket
      shell.stdout.on("data", (data) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(data.toString());
        }
      });

      // stderr → websocket
      shell.stderr.on("data", (data) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(data.toString());
        }
      });

      shell.on("exit", () => {
        cleanup(sessionId);
      });

      shell.on("error", (err) => {
        logger.error("Shell error:", err);
        cleanup(sessionId);
      });

      // websocket input → stdin
      ws.on("message", (msg) => {
        try {
          const parsed = JSON.parse(msg.toString());

          if (parsed.type === "input") {
            shell.stdin.write(parsed.data);
          }
        } catch {
          shell.stdin.write(msg.toString());
        }
      });

      ws.on("close", () => cleanup(sessionId));

      logger.info("Session started:", sessionId);

    } catch (err) {
      logger.error("Session error:", err);
      ws.close();
    }
  });
};

const cleanup = (sessionId) => {
  const session = getSession(sessionId);
  if (!session) return;

  clearTimeout(session.timeout);

  try {
    session.shell.kill();
  } catch {}

  destroyContainer(session.containerId);
  removeSession(sessionId);

  logger.info("Session cleaned:", sessionId);
};