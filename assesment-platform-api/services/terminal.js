// terminal.js
import pty from "node-pty";

export const createTerminal = () => {
  return pty.spawn(
    "docker",
    ["exec", "-it", "my-terminal", "/bin/bash"],
    {
      name: "xterm-color",
      cols: 80,
      rows: 30,
      cwd: process.env.HOME,
      env: process.env,
    }
  );
};