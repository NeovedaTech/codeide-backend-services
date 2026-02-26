import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  maxSessions: Number(process.env.MAX_SESSIONS) || 200,
  sessionTimeout: Number(process.env.SESSION_TIMEOUT) || 1800000,
  dockerImage: process.env.DOCKER_IMAGE || "ubuntu",
  memoryLimit: process.env.MEMORY_LIMIT || "256m",
  cpuLimit: process.env.CPU_LIMIT || "0.5"
};