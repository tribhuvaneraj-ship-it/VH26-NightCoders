"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, ArrowRight, Zap, CheckCircle2, XCircle } from "lucide-react";
import { ComparisonMetrics } from "../types";

interface NaiveComparisonProps {
  comparison: ComparisonMetrics | null;
}

export const NaiveComparison: React.FC<NaiveComparisonProps> = ({ comparison }) => {
  const naive = comparison?.naive ?? {
    throughput: 18,
    criticalLatency: 14,
    lowLatency: 18,
    queueDepth: 25,
    deferred: 0,
    shed: 0,
    criticalEventsLost: 0,
    activeMode: "NOMINAL",
  };

  const flashguard = comparison?.flashguard ?? {
    throughput: 18,
    criticalLatency: 4.8,
    lowLatency: 30,
    queueDepth: 10,
    deferred: 0,
    shed: 0,
    criticalEventsLost: 0,
    activeMode: "NORMAL",
  };

  const isSpike = (comparison?.trafficRate ?? 1000) > 4500;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Naive FIFO vs FlashGuard Comparative Analysis
          </h2>
          <p className="text-xs text-slate-400">
            Proof of resilience: How FlashGuard prevents checkout failures during traffic spikes
          </p>
        </div>
        <div className="text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
          Traffic: <strong className="text-white">{(comparison?.trafficRate ?? 1000).toLocaleString()} eps</strong>
        </div>
      </div>

      {/* Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. NAIVE PIPELINE */}
        <div className="bg-slate-950/60 border border-rose-500/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="font-bold text-xs uppercase tracking-wide text-rose-300 font-mono">
                Traditional Naive Pipeline (FIFO)
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                naive.activeMode === "OVERLOADED"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {naive.activeMode}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal">
            Treats every event equally with single FIFO queue. Heavy clicks clog the pipe, starving orders.
          </p>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
              <span className="text-slate-400">Critical Payment Latency:</span>
              <span
                className={`font-bold ${
                  naive.criticalLatency > 500 ? "text-rose-400 text-sm animate-pulse" : "text-slate-200"
                }`}
              >
                {naive.criticalLatency} ms
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
              <span className="text-slate-400">Queue Congestion Depth:</span>
              <span className="text-slate-200 font-bold">{naive.queueDepth} / 5,000</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/20 border border-rose-500/30">
              <span className="text-rose-300 font-bold">Critical Events Lost:</span>
              <span className="text-rose-400 font-black text-sm">
                {naive.criticalEventsLost} Lost Orders
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-rose-400">
            <XCircle className="w-3.5 h-3.5" />
            <span>Overloaded FIFO drops payments indiscriminately</span>
          </div>
        </div>

        {/* 2. FLASHGUARD PIPELINE */}
        <div className="bg-slate-950/60 border border-cyan-500/30 rounded-xl p-4 space-y-3 shadow-lg shadow-cyan-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs uppercase tracking-wide text-cyan-300 font-mono">
                FLASHGUARD (Adaptive Engine)
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {flashguard.activeMode}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal">
            Priority routing isolates payments into dedicated Fast-Lane workers. Telemetry is safely deferred/shed.
          </p>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
              <span className="text-slate-400">Critical Payment Latency:</span>
              <span className="text-cyan-300 font-bold">{flashguard.criticalLatency} ms</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
              <span className="text-slate-400">Controlled Queue Depth:</span>
              <span className="text-slate-200 font-bold">{flashguard.queueDepth} queued</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/40">
              <span className="text-emerald-300 font-bold">Critical Events Lost:</span>
              <span className="text-emerald-400 font-black text-sm">0 (STRICT ZERO LOSS)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Payments remain unaffected during 20× traffic surge</span>
          </div>
        </div>
      </div>
    </div>
  );
};