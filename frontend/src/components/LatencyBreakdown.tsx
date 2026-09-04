"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Clock } from "lucide-react";
import { LatencyHistoryPoint } from "../hooks/usePipelineStream";

interface LatencyBreakdownProps {
  history: LatencyHistoryPoint[];
  currentCritical: number;
  currentHigh: number;
  currentLow: number;
}

export const LatencyBreakdown: React.FC<LatencyBreakdownProps> = ({
  history,
  currentCritical,
  currentHigh,
  currentLow,
}) => {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Multi-Tier Latency Breakdown
          </h2>
          <p className="text-xs text-slate-400">
            Critical events maintain sub-8ms latency during 20× traffic surge
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="text-cyan-300 font-bold">Crit: {currentCritical}ms</div>
          <div className="text-amber-400 font-medium">High: {currentHigh}ms</div>
          <div className="text-purple-400 font-medium">Low: {currentLow}ms</div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="ms" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            <Line
              type="monotone"
              dataKey="critical"
              name="Critical (Payment/Order)"
              stroke="#06b6d4"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="high"
              name="High (Inventory)"
              stroke="#f59e0b"
              strokeWidth={1.8}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="low"
              name="Low (Click/Log)"
              stroke="#8b5cf6"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="border-t border-slate-800/80 pt-2.5 mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>Fast-Lane Priority Worker: <strong className="text-cyan-400">Active</strong></span>
        <span className="text-emerald-400 font-bold">Zero Cross-Queue Contention</span>
      </div>
    </div>
  );
};