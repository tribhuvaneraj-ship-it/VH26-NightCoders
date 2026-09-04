const API_BASE = "http://localhost:5000/api";

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error (${res.status}): ${errorText}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Simulator
  startNormal: () => apiFetch("/simulator/start", { method: "POST" }),
  startFlashSale: (rate: number = 22500) =>
    apiFetch("/simulator/flash-sale", {
      method: "POST",
      body: JSON.stringify({ rate }),
    }),
  stopTraffic: () => apiFetch("/simulator/stop", { method: "POST" }),
  setCustomRate: (rate: number) =>
    apiFetch("/simulator/custom", {
      method: "POST",
      body: JSON.stringify({ rate }),
    }),
  injectBurst: (count: number = 200, eventType?: string) =>
    apiFetch("/simulator/burst", {
      method: "POST",
      body: JSON.stringify({ count, eventType }),
    }),

  // Metrics
  getMetrics: () => apiFetch<{ success: boolean; snapshot: any }>("/metrics"),
  resetMetrics: () => apiFetch("/metrics/reset", { method: "POST" }),

  // Explainability / Decisions
  getDecisions: (limit: number = 50) => apiFetch<{ success: boolean; decisions: any[] }>(`/decisions?limit=${limit}`),
  getDecisionByEventId: (eventId: string) => apiFetch<{ success: boolean; decision: any }>(`/decisions/${eventId}`),

  // Comparison
  getComparison: () => apiFetch<{ success: boolean; comparison: any }>("/comparison"),
  resetComparison: () => apiFetch("/comparison/reset", { method: "POST" }),

  // Benchmarks
  runBenchmarkSuite: (mode: string = "full") =>
    apiFetch("/benchmark/run", {
      method: "POST",
      body: JSON.stringify({ mode }),
    }),
  getBenchmarkResults: () =>
    apiFetch<{ success: boolean; history: any[]; status: any }>("/benchmark/results"),
};
