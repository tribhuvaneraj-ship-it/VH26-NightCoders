import assert from "node:assert/strict";
import test from "node:test";
import { WorkerSlotManager } from "./workerSlotManager.js";

test("continuous critical demand cannot consume HIGH or LOW reservations", () => {
  const slots = new WorkerSlotManager(100, { critical: 60, high: 25, low: 15 });
  // This models sustained PAYMENT/ORDER traffic while inventory and telemetry
  // have queued work. The scheduler must retain both protected reservations.
  slots.setWaiting({ CRITICAL: 1000, HIGH: 1000, LOW: 1000 });

  const critical = Array.from({ length: 60 }, () => slots.acquire("CRITICAL"));
  assert.equal(critical.filter(Boolean).length, 60);
  assert.equal(slots.acquire("CRITICAL"), undefined);

  const high = Array.from({ length: 25 }, () => slots.acquire("HIGH"));
  const low = Array.from({ length: 15 }, () => slots.acquire("LOW"));
  assert.equal(high.filter(Boolean).length, 25);
  assert.equal(low.filter(Boolean).length, 15);

  const metrics = slots.getMetrics();
  assert.equal(metrics.criticalActiveSlots, 60);
  assert.equal(metrics.highActiveSlots, 25);
  assert.equal(metrics.lowActiveSlots, 15);
  assert.equal(metrics.availableSlots, 0);
});

test("idle reserved capacity is borrowable and accounted for", () => {
  const slots = new WorkerSlotManager(10, { critical: 60, high: 20, low: 20 });
  slots.setWaiting({ CRITICAL: 100, HIGH: 0, LOW: 0 });
  const acquired = Array.from({ length: 10 }, () => slots.acquire("CRITICAL"));
  assert.equal(acquired.filter(Boolean).length, 10);
  assert.equal(slots.getMetrics().borrowedSlots, 4);
});
