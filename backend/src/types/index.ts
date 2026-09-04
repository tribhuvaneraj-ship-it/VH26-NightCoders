export type EventType = "PAYMENT" | "ORDER" | "INVENTORY" | "CLICK" | "LOG";

export type Priority = "CRITICAL" | "HIGH" | "LOW";

export type ProcessingMode = "STREAM" | "BATCH" | "DEFER" | "SHED";

export type EventStatus = "QUEUED" | "PROCESSING" | "PROCESSED" | "DEFERRED" | "SHED" | "FAILED";

export type SystemMode = "NORMAL" | "SPIKE" | "EXTREME" | "RECOVERY";

export interface PipelineEvent {
  eventId: string;
  eventType: EventType;
  priority: Priority;
  timestamp: Date;
  payload: Record<string, any>;
  status: EventStatus;
  processingMode: ProcessingMode;
  processingLatency: number; // in milliseconds
  createdAt: Date;
  processedAt?: Date;
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
  timestamp: Date;
}

export interface SystemMetricsSnapshot {
  timestamp: Date;
  eventsPerMinute: number;
  throughputPerSecond: number;
  systemMode: SystemMode;
  queueUtilization: number;
  criticalEventsLost: number; // strictly 0 in FlashGuard
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
}

export interface ComparisonMetrics {
  timestamp: Date;
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
    criticalEventsLost: number; // 0
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
  criticalEventsLost: number; // 0
  status: "PENDING" | "RUNNING" | "COMPLETED";
  completedAt?: Date;
}
