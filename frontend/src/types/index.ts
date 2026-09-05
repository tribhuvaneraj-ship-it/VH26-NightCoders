export type EventType = "PAYMENT" | "ORDER" | "INVENTORY" | "CLICK" | "LOG";

export type Priority = "CRITICAL" | "HIGH" | "LOW";

export type ProcessingMode = "STREAM" | "BATCH" | "DEFER" | "SHED";

export type EventStatus = "QUEUED" | "PROCESSING" | "PROCESSED" | "DEFERRED" | "SHED" | "FAILED";

export type SystemMode = "NORMAL" | "SPIKE" | "EXTREME" | "RECOVERY";

export interface PipelineEvent {
  eventId: string;
  eventType: EventType;
  priority: Priority;
  timestamp: string;
  payload: Record<string, any>;
  status: EventStatus;
  processingMode: ProcessingMode;
  processingLatency: number;
  createdAt: string;
  processedAt?: string;
  batchId?: string;
  decisionReason?: string;
}

export interface DecisionLogEntry {
  id?: string;
  eventId: string;
  eventType: EventType;
  priority: Priority;
  decision: ProcessingMode;
  reason: string;
  queueUtilization: number;
  trafficRate: number;
  workerLoad: number;
  systemMode: SystemMode;
  timestamp: string;
}

export interface SystemMetricsSnapshot {
  timestamp: string;
  eventsPerMinute: number;
  throughputPerSecond: number;
  systemMode: SystemMode;
  queueUtilization: number;
  criticalEventsLost: number;
  averageLatency: number;
  latencyBreakdown: {
    critical: number;
    high: number;
    low: number;
  };
  queueDepths: {
    critical: number;
    high: number;
    low: number;
    deferred: number;
    total: number;
  };
  processingBreakdown: {
    streamed: number;
    batched: number;
    deferred: number;
    shed: number;
  };
  activeWorkers: number;
  workerUtilization: number;
  workerSlots: WorkerSlotMetrics;
}

export interface WorkerSlotMetrics {
  totalSlots: number; criticalReservedSlots: number; highReservedSlots: number; lowReservedSlots: number;
  criticalActiveSlots: number; highActiveSlots: number; lowActiveSlots: number;
  criticalWaiting: number; highWaiting: number; lowWaiting: number;
  borrowedSlots: number; availableSlots: number;
}

export interface ComparisonMetrics {
  timestamp: string;
  trafficRate: number;
  naive: {
    throughput: number;
    criticalLatency: number;
    lowLatency: number;
    queueDepth: number;
    deferred: number;
    shed: number;
    criticalEventsLost: number;
    activeMode: string;
  };
  flashguard: {
    throughput: number;
    criticalLatency: number;
    lowLatency: number;
    queueDepth: number;
    deferred: number;
    shed: number;
    criticalEventsLost: number;
    activeMode: SystemMode;
  };
}

export interface BenchmarkSuiteResult {
  id: string;
  name: string;
  targetEventsPerMin: number;
  durationSeconds: number;
  totalEventsIngested: number;
  throughput: number;
  queueDepthPeak: number;
  criticalLatencyAvg: number;
  highLatencyAvg: number;
  lowLatencyAvg: number;
  streamedCount: number;
  batchedCount: number;
  deferredCount: number;
  shedCount: number;
  criticalEventsLost: number;
  status: "PENDING" | "RUNNING" | "COMPLETED";
  completedAt?: string;
}

export interface SimulatorStatus {
  state: "IDLE" | "NORMAL" | "FLASH_SALE" | "CUSTOM";
  targetEventsPerMinute: number;
  trafficMultiplier: number;
  isFlashSaleActive: boolean;
}
