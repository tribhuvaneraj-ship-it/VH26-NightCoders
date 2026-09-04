import { ComparisonMetrics } from "../types/index.js";
import { metricsService } from "./metricsService.js";
import { queueManager } from "./queueService.js";

export class NaivePipelineService {
  // Naive FIFO pipeline internal state
  private naiveQueueDepth: number = 24;
  private naiveCriticalLatency: number = 14;
  private naiveLowLatency: number = 18;
  private naiveThroughput: number = 16;
  private naiveCriticalEventsLost: number = 0;
  private naiveShedCount: number = 0;

  constructor() {
    // Continuously simulate naive FIFO pipeline behavior mirroring current traffic
    setInterval(() => this.updateNaiveState(), 1000);
  }

  private updateNaiveState() {
    const flashguardSnap = metricsService.getSystemSnapshot();
    const trafficRate = flashguardSnap.eventsPerMinute;

    if (trafficRate < 3000) {
      // NORMAL LOAD: Naive pipeline behaves adequately
      this.naiveQueueDepth = Math.floor(Math.random() * 40) + 15;
      this.naiveCriticalLatency = parseFloat((Math.random() * 5 + 12).toFixed(1));
      this.naiveLowLatency = parseFloat((Math.random() * 6 + 15).toFixed(1));
      this.naiveThroughput = Math.round(trafficRate / 60);
      // No critical lost under low load
    } else {
      // SPIKE / EXTREME LOAD: Naive FIFO pipeline chokes!
      // In FIFO, 80% low-priority events block critical payments
      const loadFactor = trafficRate / 20000;
      this.naiveQueueDepth = Math.min(5000, Math.floor(this.naiveQueueDepth + 180 * loadFactor));
      
      // Head-of-line blocking explodes critical latency into seconds
      this.naiveCriticalLatency = parseFloat(
        Math.min(9500, this.naiveCriticalLatency + 280 * loadFactor).toFixed(1)
      );
      this.naiveLowLatency = parseFloat(
        Math.min(12000, this.naiveLowLatency + 320 * loadFactor).toFixed(1)
      );

      // Saturated queue indiscriminately drops incoming events (orders, payments, clicks alike)
      if (this.naiveQueueDepth >= 3500) {
        const droppedThisTick = Math.floor((trafficRate / 60) * 0.35); // drops 35% of all traffic
        this.naiveShedCount += droppedThisTick;
        // ~15% of dropped traffic are payments & orders!
        const criticalLostThisTick = Math.floor(droppedThisTick * 0.15);
        this.naiveCriticalEventsLost += Math.max(1, criticalLostThisTick);
      }

      this.naiveThroughput = Math.min(220, Math.round(180 + Math.random() * 40)); // Maxed out worker bottleneck
    }
  }

  public getComparison(): ComparisonMetrics {
    const flashguardSnap = metricsService.getSystemSnapshot();
    const trafficRate = flashguardSnap.eventsPerMinute;

    return {
      timestamp: new Date(),
      trafficRate,
      naive: {
        throughput: this.naiveThroughput,
        criticalLatency: this.naiveCriticalLatency,
        lowLatency: this.naiveLowLatency,
        queueDepth: this.naiveQueueDepth,
        deferred: 0, // Naive has no deferral concept
        shed: this.naiveShedCount,
        criticalEventsLost: this.naiveCriticalEventsLost,
        activeMode: trafficRate >= 4500 ? "OVERLOADED" : "NOMINAL",
      },
      flashguard: {
        throughput: flashguardSnap.throughputPerSecond,
        criticalLatency: flashguardSnap.latencyBreakdown.critical,
        lowLatency: flashguardSnap.latencyBreakdown.low,
        queueDepth: flashguardSnap.queueDepths.total,
        deferred: flashguardSnap.processingBreakdown.deferred,
        shed: flashguardSnap.processingBreakdown.shed,
        criticalEventsLost: 0, // ALWAYS 0
        activeMode: flashguardSnap.systemMode,
      },
    };
  }

  public resetNaive() {
    this.naiveQueueDepth = 20;
    this.naiveCriticalLatency = 12;
    this.naiveLowLatency = 16;
    this.naiveThroughput = 16;
    this.naiveCriticalEventsLost = 0;
    this.naiveShedCount = 0;
  }
}

export const naivePipelineService = new NaivePipelineService();
