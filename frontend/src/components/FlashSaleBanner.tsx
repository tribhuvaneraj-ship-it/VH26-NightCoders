"use client";

import React from "react";
import { Flame, ShieldCheck, Zap } from "lucide-react";
import { SimulatorStatus, SystemMode } from "../types";

interface FlashSaleBannerProps {
  systemMode: SystemMode;
  simulator: SimulatorStatus | null;
  eventsPerMin: number;
}

export const FlashSaleBanner: React.FC<FlashSaleBannerProps> = ({
  systemMode,
  simulator,
  eventsPerMin,
}) => {
  const isFlashSale = simulator?.isFlashSaleActive;
  if (!isFlashSale && systemMode === "NORMAL") return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-rose-950 via-slate-950 to-amber-950 border-y border-amber-500/30 px-6 py-2.5 shadow-lg">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-amber-300 uppercase tracking-wider">
              {isFlashSale ? "🔥 FLASH SALE ACTIVE" : "SYSTEM ADAPTING TO TRAFFIC SURGE"}
            </span>
            <span className="text-slate-300 ml-2 font-mono">
              ~{eventsPerMin?.toLocaleString() || "20,000+"} events/min (20× Nominal Traffic)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Payments & Orders: 100% STREAMED</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>CRITICAL EVENTS LOST: 0</span>
          </div>
        </div>
      </div>
    </div>
  );
};