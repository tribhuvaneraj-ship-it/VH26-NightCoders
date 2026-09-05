import dotenv from "dotenv";
dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/flashguard",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  SIMULATOR_TICK_RATE_MS: parseInt(process.env.SIMULATOR_TICK_RATE_MS || "100", 10),
  MAX_QUEUE_CAPACITY: parseInt(process.env.MAX_QUEUE_CAPACITY || "5000", 10),
  WORKER_TOTAL_SLOTS: parseInt(process.env.WORKER_TOTAL_SLOTS || "100", 10),
  CRITICAL_RESERVED_SLOTS: parseInt(process.env.CRITICAL_RESERVED_SLOTS || "60", 10),
  HIGH_RESERVED_SLOTS: parseInt(process.env.HIGH_RESERVED_SLOTS || "25", 10),
  LOW_RESERVED_SLOTS: parseInt(process.env.LOW_RESERVED_SLOTS || "15", 10),
};
