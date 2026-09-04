import mongoose, { Schema, Document } from "mongoose";
import { EventType, Priority, ProcessingMode, SystemMode } from "../types/index.js";

export interface IDecisionLogDocument extends Document {
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

const DecisionLogSchema: Schema = new Schema(
  {
    eventId: { type: String, required: true, index: true },
    eventType: {
      type: String,
      required: true,
      enum: ["PAYMENT", "ORDER", "INVENTORY", "CLICK", "LOG"],
    },
    priority: {
      type: String,
      required: true,
      enum: ["CRITICAL", "HIGH", "LOW"],
      index: true,
    },
    decision: {
      type: String,
      required: true,
      enum: ["STREAM", "BATCH", "DEFER", "SHED"],
      index: true,
    },
    reason: { type: String, required: true },
    queueUtilization: { type: Number, required: true },
    trafficRate: { type: Number, required: true },
    workerLoad: { type: Number, required: true },
    systemMode: {
      type: String,
      required: true,
      enum: ["NORMAL", "SPIKE", "EXTREME", "RECOVERY"],
    },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    capped: { size: 10485760, max: 10000 }, // Cap collection to avoid unbounded growth during 25k spikes
  }
);

DecisionLogSchema.index({ eventId: 1, timestamp: -1 });

export const DecisionLogModel =
  mongoose.models.DecisionLog || mongoose.model<IDecisionLogDocument>("DecisionLog", DecisionLogSchema);
