import { spawn } from "child_process";

const DOCKER_PATH = "/usr/local/bin/docker"; // verify with `which docker`

export const createTerminal = (containerId) => {
  const shell = spawn(
    DOCKER_PATH,
    [
      "exec",
      "-i",
      containerId,
      "script",       // allocate pseudo terminal
      "-q",
      "-c",
      "/bin/bash",
      "/dev/null"
    ],
    {
      stdio: ["pipe", "pipe", "pipe"],
    }
  );

  shell.stdin.setDefaultEncoding("utf-8");

  return shell;
};