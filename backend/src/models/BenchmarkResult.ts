import mongoose, { Schema, Document } from "mongoose";

export interface IBenchmarkResultDocument extends Document {
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
  status: string;
  completedAt?: Date;
}

const BenchmarkResultSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    targetEventsPerMin: { type: Number, required: true },
    durationSeconds: { type: Number, required: true },
    totalEventsIngested: { type: Number, required: true },
    throughput: { type: Number, required: true },
    queueDepthPeak: { type: Number, required: true },
    criticalLatencyAvg: { type: Number, required: true },
    highLatencyAvg: { type: Number, required: true },
    lowLatencyAvg: { type: Number, required: true },
    streamedCount: { type: Number, required: true },
    batchedCount: { type: Number, required: true },
    deferredCount: { type: Number, required: true },
    shedCount: { type: Number, required: true },
    criticalEventsLost: { type: Number, default: 0 },
    status: { type: String, default: "COMPLETED" },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const BenchmarkResultModel =
  mongoose.models.BenchmarkResult ||
  mongoose.model<IBenchmarkResultDocument>("BenchmarkResult", BenchmarkResultSchema);
