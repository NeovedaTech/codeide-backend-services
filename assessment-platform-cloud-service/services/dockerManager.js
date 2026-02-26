import { exec } from "child_process";
import { randomUUID } from "crypto";
import { config } from "../config/env.js";

export const createContainer = () => {
  const containerId = `terminal-${randomUUID()}`;

  return new Promise((resolve, reject) => {
    exec(
      `docker run -dit --name ${containerId} \
      --memory="${config.memoryLimit}" \
      --cpus="${config.cpuLimit}" \
      ${config.dockerImage} bash`,
      (err) => {
        if (err) return reject(err);
        resolve(containerId);
      }
    );
  });
};

export const destroyContainer = (containerId) => {
  exec(`docker rm -f ${containerId}`);
};