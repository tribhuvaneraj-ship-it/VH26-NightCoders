"use client";

import React from "react";
import { Zap, ShieldCheck, ArrowRight, Compass } from "lucide-react";
import { SystemMode } from "../types";

interface EventStrategyMatrixProps {
  systemMode: SystemMode;
}

export const EventStrategyMatrix: React.FC<EventStrategyMatrixProps> = ({ systemMode }) => {
  const isSpike = systemMode === "SPIKE" || systemMode === "EXTREME";

  const matrix = [
    {
      type: "PAYMENT",
      priority: "CRITICAL",
      nominal: "STREAM",
      spike: "STREAM (Protected Fast-Lane)",
      policy: "Zero Drop Guaranteed",
      sla: "< 8ms",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    },
    {
      type: "ORDER",
      priority: "CRITICAL",
      nominal: "STREAM",
      spike: "STREAM (Protected Fast-Lane)",
      policy: "Zero Drop Guaranteed",
      sla: "< 8ms",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    },
    {
      type: "INVENTORY",
      priority: "HIGH",
      nominal: "STREAM",
      spike: "BATCH (50ms Aggregation)",
      policy: "Never Shed",
      sla: "< 35ms",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      type: "CLICK",
      priority: "LOW",
      nominal: "BATCH",
      spike: isSpike ? (systemMode === "EXTREME" ? "SHED (Controlled)" : "DEFER (Buffered)") : "BATCH",
      policy: "Adaptive Degradation",
      sla: "Best Effort",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      type: "LOG",
      priority: "LOW",
      nominal: "BATCH",
      spike: isSpike ? "SHED (Shed to protect CPU)" : "BATCH",
      policy: "Safe Shedding",
      sla: "Best Effort",
      badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    },
  ];

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            Adaptive Routing Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Dynamic routing rules f(priority, queuePressure, trafficRate, systemMode)
          </p>
        </div>
        <div className="text-[11px] bg-slate-800/80 px-2.5 py-1 rounded-lg text-slate-300 font-mono">
          State: <span className="text-cyan-400 font-bold">{systemMode}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="pb-2 font-semibold">Event Type</th>
              <th className="pb-2 font-semibold">Priority</th>
              <th className="pb-2 font-semibold">Active Decision</th>
              <th className="pb-2 font-semibold">Protection SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {matrix.map((row) => (
              <tr key={row.type} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {row.type}
                </td>
                <td className="py-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${row.badgeColor}`}>
                    {row.priority}
                  </span>
                </td>
                <td className="py-2.5 text-xs font-semibold">
                  <span
                    className={
                      row.spike.startsWith("STREAM")
                        ? "text-emerald-400 font-bold"
                        : row.spike.startsWith("BATCH")
                        ? "text-amber-400"
                        : row.spike.startsWith("DEFER")
                        ? "text-purple-400"
                        : "text-rose-400"
                    }
                  >
                    {isSpike ? row.spike : row.nominal}
                  </span>
                </td>
                <td className="py-2.5 text-slate-300 text-[11px]">
                  <span className="text-slate-400">{row.policy}</span>
                  <span className="text-cyan-400 font-bold ml-2">({row.sla})</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};