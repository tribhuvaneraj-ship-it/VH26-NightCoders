import { PipelineEvent, Priority } from "../types/index.js";

export class PriorityQueueManager {
  // Discrete queues for priority lanes
  private criticalQueue: PipelineEvent[] = [];
  private highQueue: PipelineEvent[] = [];
  private lowQueue: PipelineEvent[] = [];
  private deferQueue: PipelineEvent[] = [];

  // Capacity limits (total pipeline capacity)
  private readonly maxTotalCapacity: number = 5000;
  private readonly maxCriticalCapacity: number = 2000;
  private readonly maxHighCapacity: number = 1500;
  private readonly maxLowCapacity: number = 1500;

  // Trackers
  private totalEnqueued: number = 0;
  private totalDequeued: number = 0;

  public enqueue(event: PipelineEvent): boolean {
    this.totalEnqueued++;

    switch (event.priority) {
      case "CRITICAL":
        // Critical events are NEVER dropped - queue will dynamically expand if needed
        this.criticalQueue.push(event);
        return true;

      case "HIGH":
        if (this.highQueue.length < this.maxHighCapacity) {
          this.highQueue.push(event);
          return true;
        }
        // Micro-batch will drain quickly, push anyway under backpressure
        this.highQueue.push(event);
        return true;

      case "LOW":
        if (this.lowQueue.length < this.maxLowCapacity) {
          this.lowQueue.push(event);
          return true;
        }
        // If low queue is saturated, return false to trigger immediate shedding
        return false;

      default:
        this.lowQueue.push(event);
        return true;
    }
  }

  public enqueueDefer(event: PipelineEvent): void {
    if (this.deferQueue.length < 3000) {
      this.deferQueue.push(event);
    }
    // Capped to prevent memory leak
  }

  public drainCritical(maxCount: number = 50): PipelineEvent[] {
    const count = Math.min(maxCount, this.criticalQueue.length);
    if (count === 0) return [];
    this.totalDequeued += count;
    return this.criticalQueue.splice(0, count);
  }

  /** Queue-safe worker API: inspect first, remove only after a slot/decision. */
  public peek(priority: Priority): PipelineEvent | undefined {
    return priority === "CRITICAL" ? this.criticalQueue[0] : priority === "HIGH" ? this.highQueue[0] : this.lowQueue[0];
  }

  public dequeue(priority: Priority): PipelineEvent | undefined {
    const queue = priority === "CRITICAL" ? this.criticalQueue : priority === "HIGH" ? this.highQueue : this.lowQueue;
    const event = queue.shift();
    if (event) this.totalDequeued++;
    return event;
  }

  public drainHigh(maxCount: number = 40): PipelineEvent[] {
    const count = Math.min(maxCount, this.highQueue.length);
    if (count === 0) return [];
    this.totalDequeued += count;
    return this.highQueue.splice(0, count);
  }

  public drainLow(maxCount: number = 30): PipelineEvent[] {
    const count = Math.min(maxCount, this.lowQueue.length);
    if (count === 0) return [];
    this.totalDequeued += count;
    return this.lowQueue.splice(0, count);
  }

  public drainDefer(maxCount: number = 10): PipelineEvent[] {
    const count = Math.min(maxCount, this.deferQueue.length);
    if (count === 0) return [];
    return this.deferQueue.splice(0, count);
  }

  public getQueueDepths() {
    return {
      critical: this.criticalQueue.length,
      high: this.highQueue.length,
      low: this.lowQueue.length,
      deferred: this.deferQueue.length,
      total: this.criticalQueue.length + this.highQueue.length + this.lowQueue.length,
    };
  }

  public getQueueUtilization(): number {
    const total = this.criticalQueue.length + this.highQueue.length + this.lowQueue.length;
    const utilization = (total / this.maxTotalCapacity) * 100;
    return Math.min(100, Math.max(0, parseFloat(utilization.toFixed(1))));
  }

  public clearAll() {
    this.criticalQueue = [];
    this.highQueue = [];
    this.lowQueue = [];
    this.deferQueue = [];
  }
}

export const queueManager = new PriorityQueueManager();
