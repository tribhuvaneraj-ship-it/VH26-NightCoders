import { generateEvent } from "./eventGenerator.js";
import { queueManager } from "../services/queueService.js";
import { metricsService } from "../services/metricsService.js";
import { EventType } from "../types/index.js";

export type SimulatorState = "IDLE" | "NORMAL" | "FLASH_SALE" | "CUSTOM";

export class SimulatorEngine {
  private state: SimulatorState = "IDLE";
  private targetEventsPerMinute: number = 0;
  private intervalTimer?: NodeJS.Timeout;
  private tickIntervalMs: number = 100; // 10 ticks per second
  private trafficMultiplier: number = 1.0;

  public startNormalLoad() {
    this.state = "NORMAL";
    this.targetEventsPerMinute = 1000;
    this.trafficMultiplier = 1.0;
    this.restartLoop();
    console.log("[Simulator] Started NORMAL load (~1,000 events/minute).");
  }

  public startFlashSale(targetRate: number = 22500) {
    this.state = "FLASH_SALE";
    this.targetEventsPerMinute = Math.max(20000, targetRate);
    this.trafficMultiplier = 1.0;
    this.restartLoop();
    console.log(`[Simulator] 🔥 FLASH SALE ACTIVE (~${this.targetEventsPerMinute.toLocaleString()} events/minute)!`);
  }

  public setCustomRate(eventsPerMinute: number) {
    this.state = "CUSTOM";
    this.targetEventsPerMinute = Math.max(100, eventsPerMinute);
    this.restartLoop();
    console.log(`[Simulator] Set CUSTOM rate to ${this.targetEventsPerMinute.toLocaleString()} events/minute.`);
  }

  public setMultiplier(multiplier: number) {
    this.trafficMultiplier = Math.max(0.1, Math.min(5.0, multiplier));
  }

  public stopTraffic() {
    this.state = "IDLE";
    this.targetEventsPerMinute = 0;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = undefined;
    }
    console.log("[Simulator] Traffic generation stopped.");
  }

  public injectBurst(count: number = 250, type?: EventType) {
    console.log(`[Simulator] Injecting instant burst of ${count} events...`);
    metricsService.recordIngest(count);
    for (let i = 0; i < count; i++) {
      const event = generateEvent(type);
      queueManager.enqueue(event);
    }
  }

  private restartLoop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }

    this.intervalTimer = setInterval(() => {
      this.tick();
    }, this.tickIntervalMs);
  }

  private tick() {
    if (this.targetEventsPerMinute <= 0) return;

    // Calculate events per tick (10 ticks per second = 600 ticks per minute)
    const effectiveEpm = this.targetEventsPerMinute * this.trafficMultiplier;
    const baseEventsPerTick = effectiveEpm / (60000 / this.tickIntervalMs);

    // Add slight realistic jitter (+/- 10%)
    const jitter = (Math.random() - 0.5) * 0.2;
    const eventsToGenerate = Math.round(baseEventsPerTick * (1 + jitter));

    if (eventsToGenerate <= 0) return;

    metricsService.recordIngest(eventsToGenerate);

    for (let i = 0; i < eventsToGenerate; i++) {
      const event = generateEvent();
      queueManager.enqueue(event);
    }
  }

  public getStatus() {
    return {
      state: this.state,
      targetEventsPerMinute: this.targetEventsPerMinute * this.trafficMultiplier,
      trafficMultiplier: this.trafficMultiplier,
      isFlashSaleActive: this.state === "FLASH_SALE",
    };
  }
}

export const simulatorEngine = new SimulatorEngine();
