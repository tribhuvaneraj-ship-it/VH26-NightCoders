import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/api.js";
import { workerPoolService } from "./services/workerService.js";
import { simulatorEngine } from "./simulator/simulatorEngine.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // allow all origins for dev/hackathon demo
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "FLASHGUARD Core Pipeline",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api", apiRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[ServerError]", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred in FlashGuard.",
  });
});

async function bootstrap() {
  console.log("==================================================");
  console.log("⚡ FLASHGUARD: Intelligent Adaptive Data Processing");
  console.log("==================================================");

  // Connect in the background so an unavailable remote database never blocks
  // the API's in-memory fallback from becoming available.
  void connectDB();

  // Start background worker execution pools
  workerPoolService.start();

  // Start simulator in NORMAL load mode (~1,000 eps)
  simulatorEngine.startNormalLoad();

  // Start HTTP Server binding to 0.0.0.0 to prevent IPv6/IPv4 collision on Windows
  const server = app.listen(config.PORT, "0.0.0.0", () => {
    console.log(`[FlashGuard API] Running on http://localhost:${config.PORT}`);
    console.log(`[FlashGuard SSE] Live stream available at http://localhost:${config.PORT}/api/stream`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌ [FlashGuard Error] Port ${config.PORT} is already in use by another process.`);
      console.error(`👉 Run this in PowerShell to free port ${config.PORT}:`);
      console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${config.PORT}).OwningProcess -Force\n`);
      process.exit(1);
    } else {
      console.error("[Server Error]", err);
    }
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("\n[FlashGuard] Shutting down gracefully...");
    simulatorEngine.stopTraffic();
    workerPoolService.stop();
    server.close(() => {
      console.log("[FlashGuard] Server terminated.");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
