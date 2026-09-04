import mongoose, { Schema, Document } from "mongoose";
import { EventType, Priority, ProcessingMode, EventStatus } from "../types/index.js";

export interface IEventDocument extends Document {
  eventId: string;
  eventType: EventType;
  priority: Priority;
  timestamp: Date;
  payload: Record<string, any>;
  status: EventStatus;
  processingMode: ProcessingMode;
  processingLatency: number;
  createdAt: Date;
  processedAt?: Date;
  batchId?: string;
  decisionReason?: string;
}

const EventSchema: Schema = new Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: {
      type: String,
      required: true,
      enum: ["PAYMENT", "ORDER", "INVENTORY", "CLICK", "LOG"],
      index: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ["CRITICAL", "HIGH", "LOW"],
      index: true,
    },
    timestamp: { type: Date, required: true, index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      required: true,
      enum: ["QUEUED", "PROCESSING", "PROCESSED", "DEFERRED", "SHED", "FAILED"],
      default: "QUEUED",
      index: true,
    },
    processingMode: {
      type: String,
      required: true,
      enum: ["STREAM", "BATCH", "DEFER", "SHED"],
    },
    processingLatency: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    batchId: { type: String },
    decisionReason: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal pipeline query performance
EventSchema.index({ priority: 1, status: 1, createdAt: -1 });
EventSchema.index({ eventType: 1, createdAt: -1 });

export const EventModel = mongoose.models.Event || mongoose.model<IEventDocument>("Event", EventSchema);
