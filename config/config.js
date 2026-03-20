import { configDotenv } from "dotenv";
import mongoose from "mongoose";
configDotenv();

export const USER_JWT_SECRET = "FDSHHSDJDS";
export const ADMIN_JWT_SECRET = "shgdsjdsjds";
export const CALLBACK = ""
export const EXECUTION_API = process.env.EXECUTION_API
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || "http://localhost:3030";

export const corsConfig = {
    origin:ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    // allow headers

    allowedHeaders: ["Content-Type", "Authorization", "x-auth-user", "x-auth-token"],
    credentials: true,
};

export const db = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(process.env.MONGODB_URI, {})
            .then(() => {
                console.log("Connected to MongoDB");
                resolve();
            })
            .catch((err) => {
                console.log("Error connecting to MongoDB");
                reject(err);
            });
    })
}

const isProd = process.env.NODE_ENV === "PROD";

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',//'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    // db: process.env.NODE_ENV == 'DEV' ? 0 : 1
};


export const config = {
  port: process.env.PORT || 3000,
  maxSessions: Number(process.env.MAX_SESSIONS) || 200,
  sessionTimeout: Number(process.env.SESSION_TIMEOUT) || 1800000,
  dockerImage: process.env.DOCKER_IMAGE || "ubuntu",
  memoryLimit: process.env.MEMORY_LIMIT || "256m",
  cpuLimit: process.env.CPU_LIMIT || "0.5"
};