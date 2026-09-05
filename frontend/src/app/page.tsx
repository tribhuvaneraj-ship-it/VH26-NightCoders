"use client";

import React, { useState } from "react";
import { usePipelineStream } from "../hooks/usePipelineStream";
import { Header } from "../components/Header";
import { FlashSaleBanner } from "../components/FlashSaleBanner";
import { TopMetrics } from "../components/TopMetrics";
import { Pipeline3D } from "../components/Pipeline3D";
import { QueueMonitor } from "../components/QueueMonitor";
import { EventStrategyMatrix } from "../components/EventStrategyMatrix";
import { LatencyBreakdown } from "../components/LatencyBreakdown";
import { EventFeed } from "../components/EventFeed";
import { DecisionInspector } from "../components/DecisionInspector";
import { NaiveComparison } from "../components/NaiveComparison";
import { SimulatorControls } from "../components/SimulatorControls";
import { BenchmarkModal } from "../components/BenchmarkModal";
import { PipelineEvent, DecisionLogEntry } from "../types";
import { Box, Layers, Cpu, CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const {
    snapshot,
    queues,
    recentEvents,
    recentDecisions,
    comparison,
    simulator,
    isConnected,
    latencyHistory,
  } = usePipelineStream();

  const [selectedEvent, setSelectedEvent] = useState<PipelineEvent | null>(null);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState<boolean>(false);

  const systemMode = snapshot?.systemMode ?? "NORMAL";
  const eventsPerMin = snapshot?.eventsPerMinute ?? 1000;

  const handleSelectEvent = (evt: PipelineEvent) => {
    setSelectedEvent(evt);
  };

  const selectedDecisionLog: DecisionLogEntry | undefined = selectedEvent
    ? recentDecisions.find((d) => d.eventId === selectedEvent.eventId)
    : undefined;

  return (
    <main className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col pb-16">
      {/* Sticky Real-Time Navigation Header */}
      <Header
        systemMode={systemMode}
        simulator={simulator}
        isConnected={isConnected}
      />

      {/* Dynamic Flash Sale Alert Banner */}
      <FlashSaleBanner
        systemMode={systemMode}
        simulator={simulator}
        eventsPerMin={eventsPerMin}
      />

      {/* Main Dashboard Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 space-y-6 flex-1">
        {/* Row 1: Top Core KPIs */}
        <TopMetrics snapshot={snapshot} />

        {/* Row 2: 3D WebGL Pipeline Visualizer */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">
                Interactive 3D Pipeline Topology
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Live WebGL • Real-Time Particle Conduits
            </span>
          </div>
          <Pipeline3D
            eventsPerMinute={eventsPerMin}
            systemMode={systemMode}
            queueDepths={queues}
          />
        </section>

        {/* Row 3: Live Simulator Controls */}
        <SimulatorControls
          simulator={simulator}
          onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        />

        {/* Row 4: Queue Monitor & Event Strategy Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QueueMonitor
            queues={queues}
            queueUtilization={snapshot?.queueUtilization ?? 0}
            systemMode={systemMode}
            workerSlots={snapshot?.workerSlots}
          />
          <EventStrategyMatrix systemMode={systemMode} />
        </div>

        {/* Row 5: Multi-Tier Latency Breakdown & Side-by-Side Naive Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LatencyBreakdown
            history={latencyHistory}
            currentCritical={snapshot?.latencyBreakdown?.critical ?? 4.5}
            currentHigh={snapshot?.latencyBreakdown?.high ?? 12.0}
            currentLow={snapshot?.latencyBreakdown?.low ?? 30.0}
          />
          <NaiveComparison comparison={comparison} />
        </div>

        {/* Row 6: Live Ingestion Feed */}
        <EventFeed
          events={recentEvents}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      {/* Decision Inspector Modal */}
      <DecisionInspector
        event={selectedEvent}
        decisionLog={selectedDecisionLog}
        systemMode={systemMode}
        onClose={() => setSelectedEvent(null)}
      />

      {/* 3-Tier Benchmark Suite Modal */}
      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />
    </main>
  );
}
