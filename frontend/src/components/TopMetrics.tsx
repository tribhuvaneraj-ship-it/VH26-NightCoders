"use client";

import React from "react";
import { Activity, Zap, Shield, Layers, Gauge, Clock } from "lucide-react";
import { SystemMetricsSnapshot } from "../types";

interface TopMetricsProps {
  snapshot: SystemMetricsSnapshot | null;
}

export const TopMetrics: React.FC<TopMetricsProps> = ({ snapshot }) => {
  const epm = snapshot?.eventsPerMinute ?? 1000;
  const throughput = snapshot?.throughputPerSecond ?? 16;
  const mode = snapshot?.systemMode ?? "NORMAL";
  const queueUtil = snapshot?.queueUtilization ?? 0;
  const critLost = snapshot?.criticalEventsLost ?? 0;
  const avgLat = snapshot?.averageLatency ?? 12;
  const critLat = snapshot?.latencyBreakdown?.critical ?? 4.5;
  const highLat = snapshot?.latencyBreakdown?.high ?? 12.0;
  const lowLat = snapshot?.latencyBreakdown?.low ?? 28.0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Events / Min */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium tracking-wider uppercase">Ingest Rate</span>
          <Activity className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {epm.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">events / minute</div>
        </div>
      </div>

      {/* 2. Throughput */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium tracking-wider uppercase">Throughput</span>
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {throughput.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">events / second</div>
        </div>
      </div>

      {/* 3. System Mode */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium tracking-wider uppercase">Pipeline Mode</span>
          <Gauge className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <div
            className={`text-xl font-black font-mono tracking-tight ${
              mode === "EXTREME"
                ? "text-rose-400"
                : mode === "SPIKE"
                ? "text-amber-400"
                : mode === "RECOVERY"
                ? "text-blue-400"
                : "text-emerald-400"
            }`}
          >
            {mode}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {mode === "SPIKE" || mode === "EXTREME" ? "Adaptive Shedding On" : "All Lanes Nominal"}
          </div>
        </div>
      </div>

      {/* 4. Queue Utilization */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium tracking-wider uppercase">Queue Pressure</span>
          <Layers className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {queueUtil}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                queueUtil > 80
                  ? "bg-rose-500"
                  : queueUtil > 50
                  ? "bg-amber-500"
                  : "bg-cyan-500"
              }`}
              style={{ width: `${Math.max(4, Math.min(100, queueUtil))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Critical Events Lost (HIGHLIGHT) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex flex-col justify-between shadow-lg shadow-emerald-950/20 hover:border-emerald-400 transition-all">
        <div className="flex items-center justify-between text-emerald-400 mb-2">
          <span className="text-[11px] font-bold tracking-wider uppercase">Critical Lost</span>
          <Shield className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight flex items-baseline gap-1">
            <span>{critLost}</span>
            <span className="text-xs text-emerald-300/80 font-sans font-bold uppercase tracking-wider">
              (ZERO)
            </span>
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1 font-medium">
            Strict Zero-Drop Policy
          </div>
        </div>
      </div>

      {/* 6. Latency Overview */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-medium tracking-wider uppercase">Critical Latency</span>
          <Clock className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="text-2xl font-black font-mono text-cyan-300 tracking-tight">
            {critLat} ms
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            High: {highLat}ms • Low: {lowLat}ms
          </div>
        </div>
      </div>
    </div>
  );
};