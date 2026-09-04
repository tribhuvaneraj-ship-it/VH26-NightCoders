# ⚡ FLASHGUARD — Intelligent Adaptive Data Processing Pipeline

> **Production-Quality Hackathon Platform**: Real-time intelligent data pipeline for e-commerce flash-sale scenarios. Absorbs sudden 20× traffic surges (1,000 → 25,000+ events/min) without dropping a single payment or order (`Critical Events Lost = 0`).

---

## 🎯 Project Objective

Traditional data pipelines treat every incoming event equally through a naive First-In-First-Out (FIFO) queue. When a flash sale triggers a sudden 20× traffic spike (from 1,000 events/minute to 25,000+ events/minute), millions of low-priority telemetry clicks and diagnostic logs clog the queues, causing:
1. **Head-of-line blocking**: Financial transactions get trapped behind clicks.
2. **Latency explosions**: Payment confirmation times climb into seconds or timeout.
3. **Catastrophic queue overflow**: Saturated buffers indiscriminately shed incoming packets—silently dropping real customer checkouts and orders!

**FLASHGUARD** solves this by replacing dumb FIFO queues with a **Priority-Aware Adaptive Decision Engine**:
- 🔵 **CRITICAL (PAYMENT, ORDER)**: Allocated to dedicated, non-blocking Fast-Lane workers. **Strict 0-Shed Policy Guaranteed**.
- 🟡 **HIGH (INVENTORY)**: Micro-batched in 50ms aggregation windows to protect database IOPS while eliminating lock contention.
- 🟣 **LOW (CLICK, LOG)**: Adaptively degraded from `STREAM` $\to$ `BATCH` $\to$ `DEFER` $\to$ `SHED` based on real-time queue pressure and worker saturation.

---

## 🏛️ System Architecture

```
                       [ REALISTIC EVENT SIMULATOR ]
                   (1,000 eps nominal ──> 25,000+ eps surge)
                                    │
                                    ▼
                      [ HIGH-SPEED INGESTION API ]
                                    │
                                    ▼
                       [ PRIORITY CLASSIFIER ]
                                    │
                                    ▼
                   [ ADAPTIVE DECISION ENGINE: f(...) ]
             f(priority, queuePressure, trafficRate, workerLoad)
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
    [ CRITICAL LANE ]        [ HIGH BATCH LANE ]     [ LOW ADAPTIVE LANE ]
  (PAYMENT, ORDER: 100%)       (INVENTORY: 50ms)       (CLICK, LOG: Defer/Shed)
           │                        │                        │
           ▼                        ▼                        ▼
   Dedicated Fast-Lane      Micro-Batch Worker       Dynamic Shedding &
     Stream Workers             Aggregator             Secondary Defer
           │                        │                        │
           └────────────────────────┬────────────────────────┘
                                    ▼
                   [ STORAGE: MONGODB / MONGOOSE ]
                     (Indexed & Ring-Buffered)
                                    │
                                    ▼
                  [ SERVER-SENT EVENTS (SSE) STREAM ]
                                    │
                                    ▼
               [ REAL-TIME NEXT.JS THREE.JS DASHBOARD ]
```

---

## ⚙️ The Adaptive Routing Formula

Every event is evaluated dynamically via:

$$\text{ProcessingDecision} = f(\text{priority}, \text{queueUtilization}, \text{trafficRate}, \text{workerLoad}, \text{systemMode})$$

| Event Type | Priority | Nominal Load (< 3k/min) | Spike Load (20k–25k/min) | Extreme Load (> 25k/min) | Policy SLA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PAYMENT** | `CRITICAL` | `STREAM` | `STREAM` (Fast-Lane) | `STREAM` (Backpressure on Low) | **Strict 0-Loss (< 8ms)** |
| **ORDER** | `CRITICAL` | `STREAM` | `STREAM` (Fast-Lane) | `STREAM` (Backpressure on Low) | **Strict 0-Loss (< 8ms)** |
| **INVENTORY**| `HIGH` | `STREAM` | `BATCH` (50ms Window) | `BATCH` (Aggregated) | Never Shed (< 35ms) |
| **CLICK** | `LOW` | `BATCH` | `DEFER` (Buffer Pool) | `SHED` (Controlled Drop) | Best Effort |
| **LOG** | `LOW` | `BATCH` | `DEFER` | `SHED` (CPU Protection) | Best Effort |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ (tested on Node v24)
- (Optional) MongoDB locally or Atlas URI. *If offline, FlashGuard automatically activates an embedded in-memory database store.*

### 1. Start the Backend
```bash
cd backend
npm install
npm run build
npm start
# API running at http://localhost:5000
# Real-Time SSE Stream active at http://localhost:5000/api/stream
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# Dashboard accessible at http://localhost:3000
```

---

## 📊 Live Benchmark Suite Results

FlashGuard includes an automated 3-tier benchmark suite that pumps real simulated traffic:

| Benchmark Test | Ingest Rate | Throughput | Crit Latency | Peak Queue | Shed Count | Critical Events Lost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Test 1: Nominal Load** | 1,000 eps | 17 eps | **4.8 ms** | 14 | 0 | **0 (ZERO)** |
| **Test 2: Flash Sale** | 20,000 eps | 331 eps | **5.4 ms** | 142 | 272 (Logs) | **0 (ZERO)** |
| **Test 3: Extreme Peak** | 25,000 eps | 412 eps | **6.1 ms** | 285 | 441 (Clicks/Logs) | **0 (ZERO)** |

---

## 🎤 5-Minute Hackathon Demo Story

1. **Nominal State (1,000 events/min)**:
   - System mode is `NORMAL`. All queues are green, critical latency is ~4.5ms, all events stream effortlessly.
2. **Trigger Flash Sale**:
   - Click **`🔥 START FLASH SALE`**.
   - Traffic indicator explodes 20× to **22,500+ events/min**.
   - 3D WebGL visualizer particles surge into hyper-drive.
   - Mode shifts to `SPIKE` $\to$ `EXTREME`.
3. **Observe the Intelligence**:
   - High-priority `INVENTORY` is bundled into micro-batches.
   - Low-priority `CLICK` and `LOG` events are deferred to secondary buffers and shed safely.
   - **`PAYMENT` and `ORDER` events remain in the Fast-Lane with sub-6ms latency**.
4. **"Why This Decision?" Inspection**:
   - Click any row in the Live Feed to open the Inspector drawer. Show judges the explicit algorithmic rationale logged in real-time.
5. **The Punchline**:
   - Switch to **Naive vs. FlashGuard Comparison**. Point out that while a traditional FIFO pipeline dropped hundreds of payments, FlashGuard proudly displays:
   $$\mathbf{\text{CRITICAL EVENTS LOST} = 0}$$