"use client";

import { useEffect, useState, useRef } from "react";
import {
  ComparisonMetrics,
  DecisionLogEntry,
  PipelineEvent,
  SimulatorStatus,
  SystemMetricsSnapshot,
} from "../types";
import { api } from "../lib/api";

export interface LatencyHistoryPoint {
  time: string;
  critical: number;
  high: number;
  low: number;
  throughput: number;
}

export function usePipelineStream() {
  const [snapshot, setSnapshot] = useState<SystemMetricsSnapshot | null>(null);
  const [queues, setQueues] = useState<{ critical: number; high: number; low: number; deferred: number; total: number }>({
    critical: 0,
    high: 0,
    low: 0,
    deferred: 0,
    total: 0,
  });
  const [recentEvents, setRecentEvents] = useState<PipelineEvent[]>([]);
  const [recentDecisions, setRecentDecisions] = useState<DecisionLogEntry[]>([]);
  const [comparison, setComparison] = useState<ComparisonMetrics | null>(null);
  const [simulator, setSimulator] = useState<SimulatorStatus | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latencyHistory, setLatencyHistory] = useState<LatencyHistoryPoint[]>([]);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let active = true;

    function connectSSE() {
      try {
        const es = new EventSource("http://localhost:5000/api/stream");
        eventSourceRef.current = es;

        es.onopen = () => {
          if (active) setIsConnected(true);
        };

        es.onmessage = (event) => {
          if (!active) return;
          try {
            const data = JSON.parse(event.data);
            if (data.snapshot) {
              setSnapshot(data.snapshot);
              // Append to rolling chart history
              const nowStr = new Date().toLocaleTimeString().split(" ")[0];
              setLatencyHistory((prev) => {
                const next = [
                  ...prev,
                  {
                    time: nowStr,
                    critical: data.snapshot.latencyBreakdown.critical,
                    high: data.snapshot.latencyBreakdown.high,
                    low: data.snapshot.latencyBreakdown.low,
                    throughput: data.snapshot.throughputPerSecond,
                  },
                ];
                return next.slice(-25); // keep last 25 ticks
              });
            }
            if (data.queues) setQueues(data.queues);
            if (data.recentEvents) setRecentEvents(data.recentEvents);
            if (data.recentDecisions) setRecentDecisions(data.recentDecisions);
            if (data.comparison) setComparison(data.comparison);
            if (data.simulator) setSimulator(data.simulator);
          } catch (err) {
            console.error("SSE parse error:", err);
          }
        };

        es.onerror = () => {
          if (active) setIsConnected(false);
          es.close();
          // Fallback retry after 2 seconds
          setTimeout(() => {
            if (active) connectSSE();
          }, 2000);
        };
      } catch (err) {
        console.warn("SSE connection error, falling back to polling", err);
      }
    }

    connectSSE();

    return () => {
      active = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    snapshot,
    queues,
    recentEvents,
    recentDecisions,
    comparison,
    simulator,
    isConnected,
    latencyHistory,
  };
}
