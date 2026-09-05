import { PipelineEvent, Priority, ProcessingMode } from "../types/index.js";
import { queueManager } from "./queueService.js";
import { metricsService } from "./metricsService.js";
import { workerSlotManager } from "./workerSlotManager.js";
import { evaluateDecision } from "../decision-engine/adaptiveEngine.js";
import { v4 as uuidv4 } from "uuid";

export class WorkerPoolService {
  private isRunning = false;
  private criticalWorkerInterval?: NodeJS.Timeout;
  private highWorkerInterval?: NodeJS.Timeout;
  private lowWorkerInterval?: NodeJS.Timeout;
  private deferRecoveryInterval?: NodeJS.Timeout;

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("[Workers] Starting reservation-aware multi-tier worker pools...");
    this.criticalWorkerInterval = setInterval(() => this.processCriticalFastLane(), 10);
    this.highWorkerInterval = setInterval(() => this.processHighMicroBatches(), 40);
    this.lowWorkerInterval = setInterval(() => this.processLowLane(), 30);
    this.deferRecoveryInterval = setInterval(() => this.processDeferredRecovery(), 200);
  }

  public stop() {
    this.isRunning = false;
    [this.criticalWorkerInterval, this.highWorkerInterval, this.lowWorkerInterval, this.deferRecoveryInterval]
      .forEach((interval) => interval && clearInterval(interval));
  }

  private refreshWaiting(): void {
    const depths = queueManager.getQueueDepths();
    workerSlotManager.setWaiting({ CRITICAL: depths.critical, HIGH: depths.high, LOW: depths.low + depths.deferred });
  }

  private loadState() {
    this.refreshWaiting();
    const snap = metricsService.getSystemSnapshot();
    const slots = workerSlotManager.getMetrics();
    return {
      queueUtilization: snap.queueUtilization, trafficRate: snap.eventsPerMinute, workerLoad: snap.workerUtilization,
      criticalQueueDepth: snap.queueDepths.critical, totalQueued: snap.queueDepths.total, systemMode: snap.systemMode,
      workerSlotsAvailable: slots.availableSlots,
      criticalSlotUtilization: slots.criticalReservedSlots ? slots.criticalActiveSlots / slots.criticalReservedSlots * 100 : 0,
      highSlotUtilization: slots.highReservedSlots ? slots.highActiveSlots / slots.highReservedSlots * 100 : 0,
      lowSlotUtilization: slots.lowReservedSlots ? slots.lowActiveSlots / slots.lowReservedSlots * 100 : 0,
    };
  }

  // A slot is acquired before dequeue and held for simulated service time. This
  // makes utilization observable and prevents an unavailable slot becoming loss.
  private schedule(event: PipelineEvent, priority: Priority, mode: ProcessingMode, latency: number, reason: string, batchId?: string): boolean {
    const slot = workerSlotManager.acquire(priority);
    if (!slot) return false;
    const dequeued = queueManager.dequeue(priority);
    if (!dequeued) { workerSlotManager.release(slot); return false; }
    setTimeout(() => {
      event.status = "PROCESSED"; event.processingMode = mode; event.processingLatency = latency;
      event.processedAt = new Date(); event.batchId = batchId; event.decisionReason = reason;
      metricsService.recordProcessed(event, mode, latency, reason);
      workerSlotManager.release(slot);
    }, Math.max(1, Math.round(latency)));
    return true;
  }

  private processCriticalFastLane() {
    this.refreshWaiting();
    for (let i = 0; i < 60; i++) {
      const event = queueManager.peek("CRITICAL"); if (!event) return;
      const latency = parseFloat((Math.random() * 4 + 2.5).toFixed(1));
      if (!this.schedule(event, "CRITICAL", "STREAM", latency, "Critical financial transaction. Reserved fast-lane slot; zero-shed policy enforced.")) return;
    }
  }

  private processHighMicroBatches() {
    const state = this.loadState();
    const batchId = `BATCH-${uuidv4().substring(0, 8).toUpperCase()}`;
    for (let i = 0; i < 40; i++) {
      const event = queueManager.peek("HIGH"); if (!event) return;
      const decision = evaluateDecision(event.eventType, state);
      const latency = decision.decision === "STREAM" ? parseFloat((Math.random() * 6 + 6).toFixed(1)) : parseFloat((Math.random() * 12 + 10).toFixed(1));
      if (!this.schedule(event, "HIGH", decision.decision, latency, decision.reason, decision.decision === "BATCH" ? batchId : undefined)) return;
    }
  }

  private processLowLane() {
    const state = this.loadState();
    for (let i = 0; i < 50; i++) {
      const event = queueManager.peek("LOW"); if (!event) return;
      const decision = evaluateDecision(event.eventType, state);
      if (decision.decision === "DEFER") {
        if (!queueManager.dequeue("LOW")) return;
        event.status = "DEFERRED"; event.processingMode = "DEFER"; event.decisionReason = decision.reason;
        queueManager.enqueueDefer(event); metricsService.recordProcessed(event, "DEFER", 0, decision.reason); continue;
      }
      if (decision.decision === "SHED") {
        if (!queueManager.dequeue("LOW")) return;
        event.status = "SHED"; event.processingMode = "SHED"; event.decisionReason = decision.reason;
        metricsService.recordProcessed(event, "SHED", 0, decision.reason); continue;
      }
      const latency = parseFloat((Math.random() * 20 + 20).toFixed(1));
      const batchId = decision.decision === "BATCH" ? `BATCH-${uuidv4().substring(0, 8).toUpperCase()}` : undefined;
      if (!this.schedule(event, "LOW", decision.decision, latency, decision.reason, batchId)) return;
    }
  }

  private processDeferredRecovery() {
    const state = this.loadState();
    if (state.queueUtilization > 40) return;
    for (let i = 0; i < 15; i++) {
      const slot = workerSlotManager.acquire("LOW");
      if (!slot) return;
      const event = queueManager.drainDefer(1)[0];
      if (!event) { workerSlotManager.release(slot); return; }
      const latency = parseFloat((Math.random() * 15 + 15).toFixed(1));
      setTimeout(() => {
        event.status = "PROCESSED"; event.processingMode = "BATCH"; event.processingLatency = latency; event.processedAt = new Date();
        event.decisionReason = "Recovered from deferred buffer using reserved low-priority capacity.";
        metricsService.recordProcessed(event, "BATCH", latency, event.decisionReason); workerSlotManager.release(slot);
      }, latency);
    }
  }
}

export const workerPoolService = new WorkerPoolService();
