import { SystemMode } from "../types/index.js";

export interface SystemLoadState {
  queueUtilization: number; // 0% to 100%
  trafficRate: number;      // events per minute
  workerLoad: number;       // 0% to 100%
  criticalQueueDepth: number;
  totalQueued: number;
  systemMode: SystemMode;
}

export class BackpressureController {
  private currentMode: SystemMode = "NORMAL";
  private previousTraffic: number = 1000;

  public evaluateSystemMode(trafficRate: number, queueUtilization: number): SystemMode {
    if (trafficRate >= 22000 || queueUtilization >= 88) {
      this.currentMode = "EXTREME";
    } else if (trafficRate >= 4500 || queueUtilization >= 60) {
      this.currentMode = "SPIKE";
    } else if (this.previousTraffic > 5000 && trafficRate < 3000 && queueUtilization > 15) {
      this.currentMode = "RECOVERY";
    } else {
      this.currentMode = "NORMAL";
    }

    this.previousTraffic = trafficRate;
    return this.currentMode;
  }

  public getBackpressureRatio(queueUtilization: number): number {
    if (queueUtilization < 50) return 0;
    if (queueUtilization < 80) return (queueUtilization - 50) / 30; // 0 to 1.0
    return 1.0;
  }
}

export const backpressureController = new BackpressureController();
