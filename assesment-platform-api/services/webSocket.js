// websocket.js
import { WebSocketServer } from "ws";
import { createTerminal } from "./terminal.js";

let wss; // global reference

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    const shell = createTerminal();

    shell.on("data", (data) => {
      ws.send(data);
    });

    ws.on("message", (msg) => {
      shell.write(msg);
    });

    ws.on("close", () => {
      shell.kill();
      console.log("Client disconnected");
    });
  });
};

// Optional: access wss globally if needed
export const getWSS = () => wss;