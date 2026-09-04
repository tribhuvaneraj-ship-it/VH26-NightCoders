"use client";

import React, { useState } from "react";
import { Terminal, Search, HelpCircle, ArrowUpRight } from "lucide-react";
import { PipelineEvent } from "../types";

interface EventFeedProps {
  events: PipelineEvent[];
  onSelectEvent: (event: PipelineEvent) => void;
}

export const EventFeed: React.FC<EventFeedProps> = ({ events, onSelectEvent }) => {
  const [filter, setFilter] = useState<string>("ALL");

  const filteredEvents = events.filter((e) => {
    if (filter === "ALL") return true;
    if (filter === "CRITICAL") return e.priority === "CRITICAL";
    if (filter === "HIGH") return e.priority === "HIGH";
    if (filter === "LOW") return e.priority === "LOW";
    return true;
  });

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Live Ingestion Stream
          </h2>
          <p className="text-xs text-slate-400">
            Real-time event decisions • Click any row for "Why This Decision?"
          </p>
        </div>

        {/* Priority Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
          {["ALL", "CRITICAL", "HIGH", "LOW"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                filter === tab
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table / Stream */}
      <div className="overflow-y-auto max-h-80 space-y-2 pr-1 font-mono text-xs">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            Waiting for pipeline events...
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.eventId}
              onClick={() => onSelectEvent(evt)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900/80 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    evt.priority === "CRITICAL"
                      ? "bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse"
                      : evt.priority === "HIGH"
                      ? "bg-amber-400 shadow-sm shadow-amber-400"
                      : "bg-purple-400"
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{evt.eventId}</span>
                    <span className="text-slate-400 text-[11px] font-sans">({evt.eventType})</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(evt.timestamp).toLocaleTimeString()} • Latency:{" "}
                    <span className="text-cyan-400 font-bold">{evt.processingLatency || "<5"}ms</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    evt.processingMode === "STREAM"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : evt.processingMode === "BATCH"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : evt.processingMode === "DEFER"
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {evt.processingMode}
                </span>

                <button className="flex items-center gap-1 text-[10px] text-slate-400 group-hover:text-cyan-400 px-2 py-1 rounded bg-slate-900 border border-slate-800 transition-colors">
                  <HelpCircle className="w-3 h-3" />
                  <span>Why?</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};