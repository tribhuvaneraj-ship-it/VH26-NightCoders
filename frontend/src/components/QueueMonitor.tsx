"use client";

import React from "react";
import { ShieldCheck, Zap, Layers, RefreshCw, AlertCircle } from "lucide-react";
import { SystemMode } from "../types";

interface QueueMonitorProps {
  queues: {
    critical: number;
    high: number;
    low: number;
    deferred: number;
    total: number;
  };
  queueUtilization: number;
  systemMode: SystemMode;
}

export const QueueMonitor: React.FC<QueueMonitorProps> = ({
  queues,
  queueUtilization,
  systemMode,
}) => {
  const critPct = Math.min(100, Math.round((queues.critical / 2000) * 100));
  const highPct = Math.min(100, Math.round((queues.high / 1500) * 100));
  const lowPct = Math.min(100, Math.round((queues.low / 1500) * 100));

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Queue Monitor & Lane Depths
          </h2>
          <p className="text-xs text-slate-400">
            Isolated priority buffering with dedicated execution pools
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Overall Pressure</div>
          <div className="text-sm font-bold font-mono text-cyan-300">
            {queueUtilization}% ({queues.total} queued)
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Critical Queue Lane */}
        <div className="bg-slate-950/60 border border-cyan-500/20 rounded-xl p-3.5 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                Critical Fast-Lane (Payment & Order)
              </span>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.2 rounded-full border border-cyan-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> ZERO-DROP
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300">
              <span className="text-cyan-400 font-bold">{queues.critical}</span> / 2,000 cap
            </div>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${Math.max(2, critPct)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
            <span>Workers: 100% Dedicated Immediate Stream</span>
            <span className="text-cyan-400">Shedding Policy: FORBIDDEN</span>
          </div>
        </div>

        {/* High Priority Lane */}
        <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-3.5 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                High Priority Lane (Inventory)
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.2 rounded-full border border-amber-500/20">
                50ms MICRO-BATCH
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300">
              <span className="text-amber-400 font-bold">{queues.high}</span> / 1,500 cap
            </div>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${Math.max(2, highPct)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
            <span>Workers: Micro-Batch Aggregator Pool</span>
            <span className="text-amber-400">Never Shed Under Load</span>
          </div>
        </div>

        {/* Low Priority Lane */}
        <div className="bg-slate-950/60 border border-purple-500/20 rounded-xl p-3.5 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">
                Low Priority Lane (Click & Log)
              </span>
              <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.2 rounded-full border border-purple-500/20">
                ADAPTIVE DEFER/SHED
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300">
              <span className="text-purple-400 font-bold">{queues.low}</span> / 1,500 cap
            </div>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-rose-500 transition-all duration-300"
              style={{ width: `${Math.max(2, lowPct)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
            <span>Workers: Dynamic Shedding & Secondary Deferral</span>
            <span className="text-purple-400">
              Secondary Defer Queue: <strong className="text-white">{queues.deferred}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};