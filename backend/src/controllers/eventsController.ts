import { Request, Response } from "express";
import { z } from "zod";
import { queueManager } from "../services/queueService.js";
import { metricsService } from "../services/metricsService.js";
import { classifyEvent } from "../decision-engine/classifier.js";
import { PipelineEvent, EventType } from "../types/index.js";
import { v4 as uuidv4 } from "uuid";

const IngestEventSchema = z.object({
  eventType: z.enum(["PAYMENT", "ORDER", "INVENTORY", "CLICK", "LOG"]),
  payload: z.record(z.any()).optional(),
});

export async function ingestEvent(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = IngestEventSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid event structure", details: parseResult.error.format() });
      return;
    }

    const { eventType, payload = {} } = parseResult.data;
    const { priority } = classifyEvent(eventType as EventType);
    const now = new Date();

    const event: PipelineEvent = {
      eventId: `EVT-${eventType.substring(0, 3)}-${uuidv4().substring(0, 8).toUpperCase()}`,
      eventType: eventType as EventType,
      priority,
      timestamp: now,
      payload,
      status: "QUEUED",
      processingMode: "STREAM",
      processingLatency: 0,
      createdAt: now,
    };

    metricsService.recordIngest(1);
    const enqueued = queueManager.enqueue(event);

    res.status(202).json({
      success: true,
      message: "Event accepted into pipeline",
      eventId: event.eventId,
      priority: event.priority,
      enqueued,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Ingestion failed", message: error.message });
  }
}

export async function getEvents(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string || "25", 10);
    const priority = req.query.priority as string | undefined;
    const eventType = req.query.eventType as string | undefined;

    let events = metricsService.getRecentEvents(100);

    if (priority) {
      events = events.filter((e) => e.priority === priority);
    }
    if (eventType) {
      events = events.filter((e) => e.eventType === eventType);
    }

    res.json({
      success: true,
      count: Math.min(limit, events.length),
      events: events.slice(0, limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getEventStats(req: Request, res: Response): Promise<void> {
  try {
    const snap = metricsService.getSystemSnapshot();
    res.json({
      success: true,
      breakdown: snap.processingBreakdown,
      criticalEventsLost: snap.criticalEventsLost,
      averageLatency: snap.averageLatency,
      queueDepths: snap.queueDepths,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
