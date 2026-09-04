import { Router, Request, Response } from "express";
import { ingestEvent, getEvents, getEventStats } from "../controllers/eventsController.js";
import {
  startNormalLoad,
  stopSimulator,
  startFlashSale,
  setCustomRate,
  injectBurst,
  getSimulatorStatus,
} from "../controllers/simulatorController.js";
import {
  getMetrics,
  getLatencyMetrics,
  getThroughputMetrics,
  getQueueStatus,
  getSystemStatus,
  resetMetrics,
} from "../controllers/metricsController.js";
import { getDecisions, getDecisionByEventId } from "../controllers/decisionsController.js";
import { getComparison, resetComparison } from "../controllers/comparisonController.js";
import { runBenchmarkSuite, getBenchmarkResults } from "../controllers/benchmarkController.js";
import { metricsService } from "../services/metricsService.js";
import { queueManager } from "../services/queueService.js";
import { naivePipelineService } from "../services/naivePipelineService.js";
import { simulatorEngine } from "../simulator/simulatorEngine.js";

const router = Router();

// Event Ingestion & Lookup
router.post("/events", ingestEvent);
router.get("/events", getEvents);
router.get("/events/stats", getEventStats);

// Simulator Controls
router.post("/simulator/start", startNormalLoad);
router.post("/simulator/stop", stopSimulator);
router.post("/simulator/flash-sale", startFlashSale);
router.post("/simulator/custom", setCustomRate);
router.post("/simulator/burst", injectBurst);
router.get("/simulator/status", getSimulatorStatus);

// Metrics & Queues
router.get("/metrics", getMetrics);
router.get("/metrics/latency", getLatencyMetrics);
router.get("/metrics/throughput", getThroughputMetrics);
router.get("/queues", getQueueStatus);
router.get("/system/status", getSystemStatus);
router.post("/metrics/reset", resetMetrics);

// Explainability / Decisions
router.get("/decisions", getDecisions);
router.get("/decisions/:eventId", getDecisionByEventId);

// Naive vs FlashGuard Comparison
router.get("/comparison", getComparison);
router.post("/comparison/reset", resetComparison);

// Benchmarks
router.post("/benchmark/run", runBenchmarkSuite);
router.get("/benchmark/results", getBenchmarkResults);

// Real-Time Server-Sent Events (SSE) Stream
router.get("/stream", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // Send initial payload immediately
  const sendTick = () => {
    const payload = {
      snapshot: metricsService.getSystemSnapshot(),
      queues: queueManager.getQueueDepths(),
      recentEvents: metricsService.getRecentEvents(12),
      recentDecisions: metricsService.getRecentDecisions(12),
      comparison: naivePipelineService.getComparison(),
      simulator: simulatorEngine.getStatus(),
    };
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  sendTick();

  // Stream updates every 300ms
  const intervalId = setInterval(sendTick, 300);

  req.on("close", () => {
    clearInterval(intervalId);
    res.end();
  });
});

export default router;
