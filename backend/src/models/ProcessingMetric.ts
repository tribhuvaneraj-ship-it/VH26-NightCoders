import mongoose, { Schema, Document } from "mongoose";
import { SystemMode } from "../types/index.js";

export interface IProcessingMetricDocument extends Document {
  timestamp: Date;
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

const ProcessingMetricSchema: Schema = new Schema(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    eventsPerMinute: { type: Number, required: true },
    throughputPerSecond: { type: Number, required: true },
    systemMode: { type: String, required: true },
    queueUtilization: { type: Number, required: true },
    criticalEventsLost: { type: Number, default: 0 },
    averageLatency: { type: Number, required: true },
    latencyBreakdown: {
      critical: { type: Number, required: true },
      high: { type: Number, required: true },
      low: { type: Number, required: true },
    },
    queueDepths: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    processingBreakdown: {
      streamed: { type: Number, default: 0 },
      batched: { type: Number, default: 0 },
      deferred: { type: Number, default: 0 },
      shed: { type: Number, default: 0 },
    },
    activeWorkers: { type: Number, default: 0 },
    workerUtilization: { type: Number, default: 0 },
  },
  {
    timestamps: false,
    capped: { size: 5242880, max: 2000 },
  }
);

export const ProcessingMetricModel =
  mongoose.models.ProcessingMetric ||
  mongoose.model<IProcessingMetricDocument>("ProcessingMetric", ProcessingMetricSchema);
