"use client";

import React from "react";
import { Zap, Shield, Flame, Activity, RotateCcw, Radio } from "lucide-react";
import { api } from "../lib/api";
import { SimulatorStatus, SystemMode } from "../types";

interface HeaderProps {
  systemMode: SystemMode;
  simulator: SimulatorStatus | null;
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ systemMode, simulator, isConnected }) => {
  const isFlashSale = simulator?.isFlashSaleActive;

  const handleToggleFlashSale = async () => {
    if (isFlashSale) {
      await api.startNormal();
    } else {
      await api.startFlashSale(23000);
    }
  };

  const handleReset = async () => {
    await api.resetMetrics();
    await api.resetComparison();
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            <Zap className="w-5 h-5 text-white" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider text-white font-mono">FLASHGUARD</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                v2.0 ADAPTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Intelligent Adaptive Data Processing Pipeline • E-Commerce Flash Sale
            </p>
          </div>
        </div>

        {/* Status Indicators & Main Actions */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Live Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
            <span className="text-slate-400 font-mono">
              {isConnected ? "LIVE STREAM" : "CONNECTING..."}
            </span>
          </div>

          {/* Mode Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide uppercase transition-colors ${
              systemMode === "EXTREME"
                ? "bg-rose-950/50 border-rose-600/50 text-rose-400"
                : systemMode === "SPIKE"
                ? "bg-amber-950/50 border-amber-600/50 text-amber-400"
                : systemMode === "RECOVERY"
                ? "bg-blue-950/50 border-blue-600/50 text-blue-400"
                : "bg-emerald-950/50 border-emerald-600/50 text-emerald-400"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>MODE: {systemMode}</span>
          </div>

          {/* Zero Drop Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>0 CRITICAL EVENTS LOST</span>
          </div>

          {/* Flash Sale Toggle CTA */}
          <button
            onClick={handleToggleFlashSale}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-xs tracking-wider transition-all duration-300 shadow-md ${
              isFlashSale
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse"
                : "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-orange-500/25 hover:scale-[1.02]"
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>{isFlashSale ? "🛑 STOP FLASH SALE" : "🔥 START FLASH SALE (20×)"}</span>
          </button>

          {/* Reset Metrics */}
          <button
            onClick={handleReset}
            title="Reset All Counters"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};