import { Request, Response } from "express";
import { metricsService } from "../services/metricsService.js";
import { queueManager } from "../services/queueService.js";
import { isDbConnected } from "../config/db.js";

export function getMetrics(req: Request, res: Response): void {
  const snapshot = metricsService.getSystemSnapshot();
  res.json({
    success: true,
    snapshot,
  });
}

export function getLatencyMetrics(req: Request, res: Response): void {
  const snapshot = metricsService.getSystemSnapshot();
  res.json({
    success: true,
    averageLatency: snapshot.averageLatency,
    breakdown: snapshot.latencyBreakdown,
  });
}

export function getThroughputMetrics(req: Request, res: Response): void {
  const snapshot = metricsService.getSystemSnapshot();
  res.json({
    success: true,
    throughputPerSecond: snapshot.throughputPerSecond,
    eventsPerMinute: snapshot.eventsPerMinute,
    workerUtilization: snapshot.workerUtilization,
    workerSlots: snapshot.workerSlots,
  });
}

export function getQueueStatus(req: Request, res: Response): void {
  res.json({
    success: true,
    queues: queueManager.getQueueDepths(),
    utilization: queueManager.getQueueUtilization(),
  });
}

export function getSystemStatus(req: Request, res: Response): void {
  const snapshot = metricsService.getSystemSnapshot();
  res.json({
    success: true,
    systemMode: snapshot.systemMode,
    isDatabaseConnected: isDbConnected(),
    criticalEventsLost: 0,
    queueUtilization: snapshot.queueUtilization,
    activeWorkers: snapshot.activeWorkers,
    workerUtilization: snapshot.workerUtilization,
    timestamp: snapshot.timestamp,
  });
}

export function resetMetrics(req: Request, res: Response): void {
  metricsService.resetCounters();
  queueManager.clearAll();
  res.json({
    success: true,
    message: "Metrics and queues reset to zero.",
  });
}
