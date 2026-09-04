import { Request, Response } from "express";
import { simulatorEngine } from "../simulator/simulatorEngine.js";
import { EventType } from "../types/index.js";

export function startNormalLoad(req: Request, res: Response): void {
  simulatorEngine.startNormalLoad();
  res.json({
    success: true,
    message: "Started normal load (~1,000 events/minute)",
    status: simulatorEngine.getStatus(),
  });
}

export function stopSimulator(req: Request, res: Response): void {
  simulatorEngine.stopTraffic();
  res.json({
    success: true,
    message: "Traffic stopped",
    status: simulatorEngine.getStatus(),
  });
}

export function startFlashSale(req: Request, res: Response): void {
  const rate = parseInt(req.body.rate as string || "22500", 10);
  simulatorEngine.startFlashSale(rate);
  res.json({
    success: true,
    message: `🔥 Flash sale activated at ~${rate.toLocaleString()} events/minute!`,
    status: simulatorEngine.getStatus(),
  });
}

export function setCustomRate(req: Request, res: Response): void {
  const rate = parseInt(req.body.rate as string || "5000", 10);
  simulatorEngine.setCustomRate(rate);
  res.json({
    success: true,
    message: `Custom traffic rate set to ${rate.toLocaleString()} events/minute`,
    status: simulatorEngine.getStatus(),
  });
}

export function injectBurst(req: Request, res: Response): void {
  const count = parseInt(req.body.count as string || "200", 10);
  const type = req.body.eventType as EventType | undefined;
  simulatorEngine.injectBurst(count, type);
  res.json({
    success: true,
    message: `Injected burst of ${count} events`,
  });
}

export function getSimulatorStatus(req: Request, res: Response): void {
  res.json({
    success: true,
    status: simulatorEngine.getStatus(),
  });
}
