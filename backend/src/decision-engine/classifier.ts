import { EventType, Priority } from "../types/index.js";

export interface EventClassification {
  priority: Priority;
  tierDescription: string;
  isGuaranteedZeroDrop: boolean;
}

export function classifyEvent(eventType: EventType): EventClassification {
  switch (eventType) {
    case "PAYMENT":
      return {
        priority: "CRITICAL",
        tierDescription: "Financial transaction - requires immediate non-blocking settlement",
        isGuaranteedZeroDrop: true,
      };
    case "ORDER":
      return {
        priority: "CRITICAL",
        tierDescription: "Customer purchase commitment - strict zero-loss policy",
        isGuaranteedZeroDrop: true,
      };
    case "INVENTORY":
      return {
        priority: "HIGH",
        tierDescription: "Stock allocation & reservation - micro-batchable under load",
        isGuaranteedZeroDrop: true,
      };
    case "CLICK":
      return {
        priority: "LOW",
        tierDescription: "User telemetry & clickstream - deferrable/sheddable under pressure",
        isGuaranteedZeroDrop: false,
      };
    case "LOG":
      return {
        priority: "LOW",
        tierDescription: "Application diagnostics - deferrable/sheddable under pressure",
        isGuaranteedZeroDrop: false,
      };
    default:
      return {
        priority: "LOW",
        tierDescription: "Unclassified event - defaulted to low priority",
        isGuaranteedZeroDrop: false,
      };
  }
}
