"use client";

import React, { useState } from "react";
import { Flame, Play, Square, Sliders, Zap, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import { SimulatorStatus } from "../types";
interface SimulatorControlsProps {
  simulator: SimulatorStatus | null;
  onOpenBenchmark: () => void;
}
export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  simulator,
  onOpenBenchmark,
}) => {
  const [customRate, setCustomRate] = useState<number>(5000);
  const isFlashSale = simulator?.isFlashSaleActive;
  const handleStartNormal = () => api.startNormal();
  const handleStartFlashSale = () => api.startFlashSale(23000);
  const handleStop = () => api.stopTraffic();
  const handleApplyCustom = () => api.setCustomRate(customRate);
  const handleBurst = (count: number, type?: string) => {
    api.injectBurst(count, type);
  };
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Simulator & Traffic Injection Deck
          </h2>
          <p className="text-xs text-slate-400">
            Simulate realistic e-commerce traffic surges up to 25,000+ events/min
          </p>
        </div>
        {/* Benchmark Suite CTA */}
        <button
          onClick={onOpenBenchmark}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shadow-sm shadow-cyan-500/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Run 3-Tier Benchmark Suite</span>
        </button>
      </div>
      {/* Main Preset Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Normal Load */}
        <button
          onClick={handleStartNormal}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:border-slate-600"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400" />
          <span>Normal Load (~1k/min)</span>
        </button>

        {/* Flash Sale Trigger */}
        <button
          onClick={handleStartFlashSale}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black tracking-wider transition-all shadow-lg ${
            isFlashSale
              ? "bg-rose-600 text-white shadow-rose-600/30 animate-pulse"
              : "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-orange-500/20 hover:scale-[1.01]"
          }`}
        >
          <Flame className="w-4 h-4 text-white" />
          <span>{isFlashSale ? "🔥 FLASH SALE ACTIVE" : "🔥 START FLASH SALE (22.5k/min)"}</span>
        </button>
        {/* Stop Traffic */}
        <button
          onClick={handleStop}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-rose-400 text-xs font-bold border border-rose-900/30 transition-all hover:border-rose-800/50"
        >
          <Square className="w-3.5 h-3.5" />
          <span>Halt All Traffic</span>
        </button>
      </div>
      {/* Custom Slider & Instant Bursts */}
      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Custom Traffic Rate:</span>
            <span className="text-cyan-400 font-bold">{customRate.toLocaleString()} events/min</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="500"
              max="28000"
              step="500"
              value={customRate}
              onChange={(e) => setCustomRate(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <button
              onClick={handleApplyCustom}
              className="px-3 py-1 bg-slate-800 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        </div>
        {/* Instant Burst Injections */}
        <div className="space-y-1.5">
          <div className="text-xs text-slate-400 font-mono">Inject Instant Burst:</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBurst(200, "PAYMENT")}
              className="flex-1 py-1.5 px-2 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-800/50 rounded-lg text-[11px] font-bold font-mono transition-colors"
            >
              +200 Payments
            </button>
            <button
              onClick={() => handleBurst(500, "CLICK")}
              className="flex-1 py-1.5 px-2 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/50 rounded-lg text-[11px] font-bold font-mono transition-colors"
            >
              +500 Clicks
            </button>
            <button
              onClick={() => handleBurst(350)}
              className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-bold font-mono transition-colors"
            >
              +350 Mixed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};