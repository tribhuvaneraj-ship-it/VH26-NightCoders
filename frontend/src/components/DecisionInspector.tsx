"use client";

import React from "react";
import { X, HelpCircle, ShieldCheck, Zap, Activity, AlertTriangle, Layers } from "lucide-react";
import { DecisionLogEntry, PipelineEvent, SystemMode } from "../types";

interface DecisionInspectorProps {
  event: PipelineEvent | null;
  decisionLog?: DecisionLogEntry | null;
  systemMode: SystemMode;
  onClose: () => void;
}

export const DecisionInspector: React.FC<DecisionInspectorProps> = ({
  event,
  decisionLog,
  systemMode,
  onClose,
}) => {
  if (!event) return null;

  const priority = event.priority;
  const decision = event.processingMode;
  const reason =
    decisionLog?.reason ||
    event.decisionReason ||
    (priority === "CRITICAL"
      ? "Critical financial event. Fast-lane worker pool prioritized. Strict 0-shed policy enforced."
      : priority === "HIGH"
      ? "High priority inventory reservation. Grouped into 50ms micro-batch buffer to optimize throughput."
      : systemMode === "SPIKE" || systemMode === "EXTREME"
      ? "Low-priority telemetry deferred or shed due to high queue saturation to preserve database IOPS for orders."
      : "Low-priority telemetry processed in nominal background micro-batch.");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                "Why This Decision?" Inspector
              </h3>
              <p className="text-[11px] text-slate-400">Decision Engine Rationale & System State</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Attributes */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase text-slate-400">Event Type</div>
            <div className="text-white font-bold text-sm mt-1">{event.eventType}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase text-slate-400">Priority Tier</div>
            <div
              className={`font-bold text-sm mt-1 ${
                priority === "CRITICAL"
                  ? "text-cyan-400"
                  : priority === "HIGH"
                  ? "text-amber-400"
                  : "text-purple-400"
              }`}
            >
              {priority}
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase text-slate-400">Final Decision</div>
            <div
              className={`font-bold text-sm mt-1 ${
                decision === "STREAM"
                  ? "text-emerald-400"
                  : decision === "BATCH"
                  ? "text-amber-400"
                  : decision === "DEFER"
                  ? "text-purple-400"
                  : "text-rose-400"
              }`}
            >
              {decision}
            </div>
          </div>
        </div>

        {/* Explainability Block */}
        <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-4 space-y-2">
          <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Decision Engine Explanation
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            "{reason}"
          </p>
        </div>

        {/* System State Snapshot at Decision Time */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono">
          <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
            System Snapshot At Execution
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div>
              Traffic Rate:{" "}
              <strong className="text-white">
                {decisionLog?.trafficRate ? `${decisionLog.trafficRate.toLocaleString()} eps` : "Active"}
              </strong>
            </div>
            <div>
              Queue Pressure:{" "}
              <strong className="text-white">
                {decisionLog?.queueUtilization ?? 15}%
              </strong>
            </div>
            <div>
              Worker Load:{" "}
              <strong className="text-white">{decisionLog?.workerLoad ?? 35}%</strong>
            </div>
            <div>
              Pipeline Mode:{" "}
              <strong className="text-cyan-400">
                {decisionLog?.systemMode ?? systemMode}
              </strong>
            </div>
          </div>
        </div>

        {/* Naive Pipeline Contrast */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400">
          <span className="font-bold text-amber-400">Why this matters: </span>
          {priority === "CRITICAL"
            ? "A naive FIFO pipeline would have forced this transaction to queue behind thousands of telemetry clicks, risking timeouts and silent order loss."
            : "In a naive pipeline, this event would consume the same worker thread budget as a financial checkout, causing the entire cluster to bottleneck."}
        </div>

        {/* Event Payload Preview */}
        <div>
          <div className="text-[10px] uppercase text-slate-400 font-bold mb-1 font-mono">
            Payload Metadata ({event.eventId})
          </div>
          <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-300 font-mono overflow-x-auto max-h-24">
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        </div>

        {/* Close CTA */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};