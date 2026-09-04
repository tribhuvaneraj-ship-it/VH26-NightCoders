import { v4 as uuidv4 } from "uuid";
import { EventType, PipelineEvent, Priority, ProcessingMode } from "../types/index.js";
import { classifyEvent } from "../decision-engine/classifier.js";

const SKUS = ["SKU-AIRMAX-90", "SKU-IPHONE-16", "SKU-RTX-5090", "SKU-OLED-TV", "SKU-SONY-WH1000", "SKU-MACBOOK-PRO"];
const PAGES = ["/flash-deals", "/checkout", "/cart", "/product/rtx-5090", "/product/iphone-16", "/search?q=sale"];
const PAYMENT_METHODS = ["stripe_card", "apple_pay", "google_pay", "upi_instant", "paypal"];
const SERVICES = ["checkout-gateway", "inventory-service", "cart-service", "auth-service", "telemetry-collector"];

export function generateEvent(typeOverride?: EventType): PipelineEvent {
  let eventType: EventType;

  if (typeOverride) {
    eventType = typeOverride;
  } else {
    // Realistic flash sale traffic distribution
    const rand = Math.random();
    if (rand < 0.05) {
      eventType = "PAYMENT";
    } else if (rand < 0.15) {
      eventType = "ORDER";
    } else if (rand < 0.28) {
      eventType = "INVENTORY";
    } else if (rand < 0.65) {
      eventType = "CLICK";
    } else {
      eventType = "LOG";
    }
  }

  const { priority } = classifyEvent(eventType);
  const now = new Date();
  const eventId = `EVT-${eventType.substring(0, 3)}-${uuidv4().substring(0, 8).toUpperCase()}`;

  let payload: Record<string, any> = {};

  switch (eventType) {
    case "PAYMENT":
      payload = {
        transactionId: `TX-${uuidv4().substring(0, 10).toUpperCase()}`,
        amount: parseFloat((Math.random() * 450 + 25).toFixed(2)),
        currency: "USD",
        method: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
        status: "AUTHORIZED",
        securityScore: 99.4,
      };
      break;

    case "ORDER":
      payload = {
        orderId: `ORD-${uuidv4().substring(0, 8).toUpperCase()}`,
        sku: SKUS[Math.floor(Math.random() * SKUS.length)],
        quantity: Math.floor(Math.random() * 3) + 1,
        totalPrice: parseFloat((Math.random() * 600 + 49).toFixed(2)),
        discountApplied: "FLASHSALE_20",
      };
      break;

    case "INVENTORY":
      payload = {
        sku: SKUS[Math.floor(Math.random() * SKUS.length)],
        warehouse: "US-EAST-01",
        delta: -(Math.floor(Math.random() * 2) + 1),
        currentStock: Math.floor(Math.random() * 150) + 10,
      };
      break;

    case "CLICK":
      payload = {
        page: PAGES[Math.floor(Math.random() * PAGES.length)],
        sessionId: `SESS-${uuidv4().substring(0, 6)}`,
        dwellTimeMs: Math.floor(Math.random() * 4000) + 120,
        element: "BUY_NOW_BUTTON",
      };
      break;

    case "LOG":
      payload = {
        service: SERVICES[Math.floor(Math.random() * SERVICES.length)],
        level: Math.random() > 0.85 ? "WARN" : "INFO",
        traceId: `TRC-${uuidv4().substring(0, 8)}`,
        durationMs: Math.floor(Math.random() * 45) + 2,
      };
      break;
  }

  return {
    eventId,
    eventType,
    priority,
    timestamp: now,
    payload,
    status: "QUEUED",
    processingMode: "STREAM",
    processingLatency: 0,
    createdAt: now,
  };
}
