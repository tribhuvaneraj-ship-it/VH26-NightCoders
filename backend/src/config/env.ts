import dotenv from "dotenv";
dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/flashguard",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  SIMULATOR_TICK_RATE_MS: parseInt(process.env.SIMULATOR_TICK_RATE_MS || "100", 10),
  MAX_QUEUE_CAPACITY: parseInt(process.env.MAX_QUEUE_CAPACITY || "5000", 10),
};
