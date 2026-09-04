import mongoose from "mongoose";
import { config } from "./env.js";

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${config.MONGODB_URI}`);
    mongoose.set("strictQuery", false);

    // Short timeout for hackathon/demo resiliency: fallback seamlessly if no local daemon is running
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    });

    isConnected = true;
    console.log("[Database] Connected successfully to MongoDB instance.");
    return true;
  } catch (error: any) {
    isConnected = false;
    console.warn(`[Database] Live MongoDB connection unavailable (${error.message}).`);
    console.log("[Database] Activating High-Performance Resilient In-Memory Storage Engine for FlashGuard.");
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

export default mongoose;
