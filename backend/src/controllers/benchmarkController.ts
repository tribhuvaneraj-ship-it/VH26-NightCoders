import { Request, Response } from "express";
import { benchmarkService } from "../services/benchmarkService.js";

export async function runBenchmarkSuite(req: Request, res: Response): Promise<void> {
  try {
    const status = benchmarkService.getStatus();
    if (status.isRunning) {
      res.status(409).json({
        success: false,
        message: `Benchmark currently in progress: ${status.currentTestName}`,
      });
      return;
    }

    // Run suite in background or await single test
    const mode = req.body.mode || "full"; // "full" or target rate
    if (mode === "full") {
      // Async run
      benchmarkService.runFullSuite().catch((err) => console.error("Benchmark error:", err));
      res.json({
        success: true,
        message: "Full Benchmark Suite started (Test 1: 1k, Test 2: 20k, Test 3: 25k).",
      });
    } else {
      const rate = parseInt(mode, 10) || 20000;
      const result = await benchmarkService.runSingleBenchmark(rate, `Custom Benchmark (${rate} eps)`, 6);
      res.json({
        success: true,
        result,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export function getBenchmarkResults(req: Request, res: Response): void {
  res.json({
    success: true,
    history: benchmarkService.getHistory(),
    status: benchmarkService.getStatus(),
  });
}
