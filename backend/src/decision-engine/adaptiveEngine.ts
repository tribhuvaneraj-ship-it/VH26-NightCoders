import { EventType, Priority, ProcessingMode, SystemMode } from "../types/index.js";
import { classifyEvent } from "./classifier.js";
import { backpressureController, SystemLoadState } from "./backpressure.js";

export interface DecisionResult {
  decision: ProcessingMode;
  reason: string;
  priority: Priority;
  isGuaranteedZeroDrop: boolean;
  systemMode: SystemMode;
}

export function evaluateDecision(
  eventType: EventType,
  loadState: SystemLoadState
): DecisionResult {
  const { priority, isGuaranteedZeroDrop } = classifyEvent(eventType);
  const { queueUtilization, trafficRate, systemMode, workerSlotsAvailable, highSlotUtilization, lowSlotUtilization } = loadState;

  // RULE 1: CRITICAL EVENTS NEVER DROP & ALWAYS STREAM
  if (priority === "CRITICAL") {
    let reason = "Critical financial event. Dedicated Fast-Lane Worker allocated. Zero-shed policy enforced.";
    if (systemMode === "SPIKE" || systemMode === "EXTREME") {
      reason = `Critical transaction protected. System in ${systemMode} mode (${trafficRate.toLocaleString()} events/min), Fast-Lane maintains zero-drop processing.`;
    }
    return {
      decision: "STREAM",
      reason,
      priority,
      isGuaranteedZeroDrop: true,
      systemMode,
    };
  }

  // RULE 2: HIGH PRIORITY (INVENTORY) - MICRO-BATCH UNDER LOAD, NEVER SHED
  if (priority === "HIGH") {
    if (systemMode === "NORMAL" && queueUtilization < 55 && highSlotUtilization < 85) {
      return {
        decision: "STREAM",
        reason: "Inventory update routed via immediate STREAM (nominal load and low queue depth).",
        priority,
        isGuaranteedZeroDrop: true,
        systemMode,
      };
    } else {
      return {
        decision: "BATCH",
        reason: `Inventory event grouped into micro-batch (reserved HIGH capacity; queue ${queueUtilization.toFixed(1)}%, slot load ${highSlotUtilization.toFixed(1)}%) to prevent DB lockups.`,
        priority,
        isGuaranteedZeroDrop: true,
        systemMode,
      };
    }
  }

  // RULE 3: LOW PRIORITY (CLICK, LOG) - ADAPTIVE DEGRADATION (BATCH -> DEFER -> SHED)
  if (eventType === "CLICK") {
    if (systemMode === "NORMAL" && queueUtilization < 50) {
      return {
        decision: "BATCH",
        reason: "User clickstream batched for efficient bulk ingest under normal traffic.",
        priority,
        isGuaranteedZeroDrop: false,
        systemMode,
      };
    } else if (systemMode === "SPIKE" || workerSlotsAvailable === 0 || lowSlotUtilization >= 100 || (queueUtilization >= 50 && queueUtilization < 82)) {
      return {
        decision: "DEFER",
        reason: `Click telemetry explicitly deferred (queue ${queueUtilization.toFixed(1)}%, low slot load ${lowSlotUtilization.toFixed(1)}%) to safeguard payment processing.`,
        priority,
        isGuaranteedZeroDrop: false,
        systemMode,
      };
    } else {
      // EXTREME or queueUtilization >= 82%
      return {
        decision: "SHED",
        reason: `Click telemetry shed due to extreme queue saturation (${queueUtilization.toFixed(1)}%). Zero impact on checkout reliability.`,
        priority,
        isGuaranteedZeroDrop: false,
        systemMode,
      };
    }
  }

  // LOG events (lowest tier)
  if (systemMode === "NORMAL") {
    return {
      decision: "BATCH",
      reason: "Diagnostic logs aggregated into asynchronous micro-batches.",
      priority,
      isGuaranteedZeroDrop: false,
      systemMode,
    };
  } else if (systemMode === "SPIKE" && queueUtilization < 75) {
    return {
      decision: "DEFER",
      reason: `Diagnostic logs held in low-priority defer queue while flash-sale traffic (${trafficRate.toLocaleString()} eps) is active.`,
      priority,
      isGuaranteedZeroDrop: false,
      systemMode,
    };
  } else {
    // Extreme or high queue utilization
    return {
      decision: "SHED",
      reason: `Diagnostic logs shed to protect critical payment bandwidth under heavy load (${queueUtilization.toFixed(1)}% queue capacity).`,
      priority,
      isGuaranteedZeroDrop: false,
      systemMode,
    };
  }
}
