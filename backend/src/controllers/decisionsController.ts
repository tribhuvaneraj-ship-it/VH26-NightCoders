import { Request, Response } from "express";
import { metricsService } from "../services/metricsService.js";

export function getDecisions(req: Request, res: Response): void {
  try {
    const limit = parseInt(req.query.limit as string || "25", 10);
    const priority = req.query.priority as string | undefined;
    const decision = req.query.decision as string | undefined;

    let decisions = metricsService.getRecentDecisions(100);

    if (priority) {
      decisions = decisions.filter((d) => d.priority === priority);
    }
    if (decision) {
      decisions = decisions.filter((d) => d.decision === decision);
    }

    res.json({
      success: true,
      count: Math.min(limit, decisions.length),
      decisions: decisions.slice(0, limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export function getDecisionByEventId(req: Request, res: Response): void {
  try {
    const { eventId } = req.params;
    const decision = metricsService.findDecisionByEventId(eventId);

    if (!decision) {
      res.status(404).json({
        success: false,
        message: `Decision log for event ${eventId} not found in recent memory cache.`,
      });
      return;
    }

    res.json({
      success: true,
      decision,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
