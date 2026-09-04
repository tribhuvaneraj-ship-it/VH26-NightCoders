import { PipelineEvent, ProcessingMode } from "../types/index.js";
import { queueManager } from "./queueService.js";
import { metricsService } from "./metricsService.js";
import { evaluateDecision } from "../decision-engine/adaptiveEngine.js";
import { v4 as uuidv4 } from "uuid";

export class WorkerPoolService {
  private isRunning: boolean = false;
  private criticalWorkerInterval?: NodeJS.Timeout;
  private highWorkerInterval?: NodeJS.Timeout;
  private lowWorkerInterval?: NodeJS.Timeout;
  private deferRecoveryInterval?: NodeJS.Timeout;

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("[Workers] Starting multi-tier processing worker pools...");

    // 1. FAST-LANE CRITICAL WORKER: Ticks rapidly (every 10ms) to guarantee 0 latency & 0 drops
    this.criticalWorkerInterval = setInterval(() => this.processCriticalFastLane(), 10);

    // 2. HIGH-PRIORITY MICRO-BATCH WORKER: Ticks every 40ms to aggregate batches
    this.highWorkerInterval = setInterval(() => this.processHighMicroBatches(), 40);

    // 3. LOW-PRIORITY ADAPTIVE WORKER: Ticks every 30ms with dynamic routing/shedding
    this.lowWorkerInterval = setInterval(() => this.processLowLane(), 30);

    // 4. DEFERRED RECOVERY WORKER: Drains deferred queue when traffic subsides
    this.deferRecoveryInterval = setInterval(() => this.processDeferredRecovery(), 200);
  }

  public stop() {
    this.isRunning = false;
    if (this.criticalWorkerInterval) clearInterval(this.criticalWorkerInterval);
    if (this.highWorkerInterval) clearInterval(this.highWorkerInterval);
    if (this.lowWorkerInterval) clearInterval(this.lowWorkerInterval);
    if (this.deferRecoveryInterval) clearInterval(this.deferRecoveryInterval);
    console.log("[Workers] Worker pools stopped.");
  }

  // --- FAST-LANE STREAM WORKER ---
  private processCriticalFastLane() {
    const events = queueManager.drainCritical(60);
    if (events.length === 0) return;

    for (const event of events) {
      // Simulate sub-millisecond to low millisecond fast-lane execution
      const latency = parseFloat((Math.random() * 4 + 2.5).toFixed(1));
      event.status = "PROCESSED";
      event.processingMode = "STREAM";
      event.processingLatency = latency;
      event.processedAt = new Date();
      event.decisionReason = "Critical financial transaction. Dedicated fast-lane active. 0-shed policy enforced.";

      metricsService.recordProcessed(event, "STREAM", latency, event.decisionReason);
    }
  }

  // --- MICRO-BATCH WORKER ---
  private processHighMicroBatches() {
    const events = queueManager.drainHigh(40);
    if (events.length === 0) return;

    const snap = metricsService.getSystemSnapshot();
    const batchId = `BATCH-${uuidv4().substring(0, 8).toUpperCase()}`;

    for (const event of events) {
      const decisionResult = evaluateDecision(event.eventType, {
        queueUtilization: snap.queueUtilization,
        trafficRate: snap.eventsPerMinute,
        workerLoad: snap.workerUtilization,
        criticalQueueDepth: snap.queueDepths.critical,
        totalQueued: snap.queueDepths.total,
        systemMode: snap.systemMode,
      });

      const mode: ProcessingMode = decisionResult.decision;
      const latency =
        mode === "STREAM"
          ? parseFloat((Math.random() * 6 + 6).toFixed(1))
          : parseFloat((Math.random() * 12 + 10).toFixed(1));

      event.status = "PROCESSED";
      event.processingMode = mode;
      event.processingLatency = latency;
      event.processedAt = new Date();
      event.batchId = mode === "BATCH" ? batchId : undefined;
      event.decisionReason = decisionResult.reason;

      metricsService.recordProcessed(event, mode, latency, decisionResult.reason);
    }
  }

  // --- LOW-PRIORITY ADAPTIVE WORKER ---
  private processLowLane() {
    const events = queueManager.drainLow(50);
    if (events.length === 0) return;

    const snap = metricsService.getSystemSnapshot();

    for (const event of events) {
      const decisionResult = evaluateDecision(event.eventType, {
        queueUtilization: snap.queueUtilization,
        trafficRate: snap.eventsPerMinute,
        workerLoad: snap.workerUtilization,
        criticalQueueDepth: snap.queueDepths.critical,
        totalQueued: snap.queueDepths.total,
        systemMode: snap.systemMode,
      });

      const mode: ProcessingMode = decisionResult.decision;

      if (mode === "DEFER") {
        event.status = "DEFERRED";
        event.processingMode = "DEFER";
        event.decisionReason = decisionResult.reason;
        queueManager.enqueueDefer(event);
        metricsService.recordProcessed(event, "DEFER", 0, decisionResult.reason);
      } else if (mode === "SHED") {
        event.status = "SHED";
        event.processingMode = "SHED";
        event.decisionReason = decisionResult.reason;
        metricsService.recordProcessed(event, "SHED", 0, decisionResult.reason);
      } else {
        // STREAM or BATCH
        const latency = parseFloat((Math.random() * 20 + 20).toFixed(1));
        event.status = "PROCESSED";
        event.processingMode = mode;
        event.processingLatency = latency;
        event.processedAt = new Date();
        event.decisionReason = decisionResult.reason;
        metricsService.recordProcessed(event, mode, latency, decisionResult.reason);
      }
    }
  }

  // --- RECOVERY DRAIN OF DEFERRED EVENTS ---
  private processDeferredRecovery() {
    const snap = metricsService.getSystemSnapshot();
    // Only drain deferred events if system is NORMAL or RECOVERY with queue headroom
    if (snap.queueUtilization > 40) return;

    const events = queueManager.drainDefer(15);
    if (events.length === 0) return;

    for (const event of events) {
      const latency = parseFloat((Math.random() * 15 + 15).toFixed(1));
      event.status = "PROCESSED";
      event.processingMode = "BATCH";
      event.processingLatency = latency;
      event.processedAt = new Date();
      event.decisionReason = "Recovered from deferred buffer and processed in background micro-batch.";

      metricsService.recordProcessed(event, "BATCH", latency, event.decisionReason);
    }
  }
}

export const workerPoolService = new WorkerPoolService();
