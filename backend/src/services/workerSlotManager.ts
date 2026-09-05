import { config } from "../config/env.js";
import { Priority } from "../types/index.js";

export interface WorkerSlot {
  id: number;
  priority: Priority;
  borrowed: boolean;
}

export interface WorkerSlotMetrics {
  totalSlots: number;
  criticalReservedSlots: number;
  highReservedSlots: number;
  lowReservedSlots: number;
  criticalActiveSlots: number;
  highActiveSlots: number;
  lowActiveSlots: number;
  criticalWaiting: number;
  highWaiting: number;
  lowWaiting: number;
  borrowedSlots: number;
  availableSlots: number;
}

const priorities: Priority[] = ["CRITICAL", "HIGH", "LOW"];
type PerPriority = Record<Priority, number>;

/**
 * In-process logical capacity governor.  A slot is deliberately acquired before
 * a queue item is removed.  Borrowed slots are only granted while every other
 * lane has no waiters, so their capacity is reclaimed on the next scheduling
 * cycle as soon as protected work appears.
 */
export class WorkerSlotManager {
  private readonly totalSlots: number;
  private readonly reserved: PerPriority;
  private active: PerPriority = { CRITICAL: 0, HIGH: 0, LOW: 0 };
  private waiting: PerPriority = { CRITICAL: 0, HIGH: 0, LOW: 0 };
  private borrowed = 0;
  private nextId = 1;

  constructor(totalSlots = config.WORKER_TOTAL_SLOTS, percentages = {
    critical: config.CRITICAL_RESERVED_SLOTS,
    high: config.HIGH_RESERVED_SLOTS,
    low: config.LOW_RESERVED_SLOTS,
  }) {
    this.totalSlots = Math.max(3, totalSlots);
    const requested = percentages.critical + percentages.high + percentages.low;
    const scale = requested > 100 ? 100 / requested : 1;
    const critical = Math.floor(this.totalSlots * percentages.critical * scale / 100);
    const high = Math.floor(this.totalSlots * percentages.high * scale / 100);
    const low = Math.floor(this.totalSlots * percentages.low * scale / 100);
    // Assign rounding/unallocated remainder to LOW so every logical slot is accounted for.
    this.reserved = { CRITICAL: critical, HIGH: high, LOW: low + (this.totalSlots - critical - high - low) };
  }

  public setWaiting(waiting: Partial<PerPriority>): void {
    for (const priority of priorities) this.waiting[priority] = Math.max(0, waiting[priority] ?? this.waiting[priority]);
  }

  public acquire(priority: Priority): WorkerSlot | undefined {
    const activeTotal = this.active.CRITICAL + this.active.HIGH + this.active.LOW;
    if (activeTotal >= this.totalSlots) return undefined;

    const guaranteed = this.active[priority] < this.reserved[priority];
    // A lane may borrow only when the other reserved lanes are genuinely idle.
    // This is the important guard that prevents critical traffic from taking a
    // protected lane's capacity while it has queued work.
    const otherLanesIdle = priorities
      .filter((candidate) => candidate !== priority)
      .every((candidate) => this.waiting[candidate] === 0);
    if (!guaranteed && !otherLanesIdle) return undefined;

    this.active[priority]++;
    const borrowed = !guaranteed;
    if (borrowed) this.borrowed++;
    return { id: this.nextId++, priority, borrowed };
  }

  public release(slot: WorkerSlot): void {
    if (this.active[slot.priority] <= 0) return;
    this.active[slot.priority]--;
    if (slot.borrowed) this.borrowed = Math.max(0, this.borrowed - 1);
  }

  public getMetrics(): WorkerSlotMetrics {
    const active = this.active.CRITICAL + this.active.HIGH + this.active.LOW;
    return {
      totalSlots: this.totalSlots,
      criticalReservedSlots: this.reserved.CRITICAL,
      highReservedSlots: this.reserved.HIGH,
      lowReservedSlots: this.reserved.LOW,
      criticalActiveSlots: this.active.CRITICAL,
      highActiveSlots: this.active.HIGH,
      lowActiveSlots: this.active.LOW,
      criticalWaiting: this.waiting.CRITICAL,
      highWaiting: this.waiting.HIGH,
      lowWaiting: this.waiting.LOW,
      borrowedSlots: this.borrowed,
      availableSlots: this.totalSlots - active,
    };
  }
}

export const workerSlotManager = new WorkerSlotManager();
