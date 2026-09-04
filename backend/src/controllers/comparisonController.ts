import { Request, Response } from "express";
import { naivePipelineService } from "../services/naivePipelineService.js";

export function getComparison(req: Request, res: Response): void {
  const comparison = naivePipelineService.getComparison();
  res.json({
    success: true,
    comparison,
  });
}

export function resetComparison(req: Request, res: Response): void {
  naivePipelineService.resetNaive();
  res.json({
    success: true,
    message: "Naive pipeline state reset.",
  });
}
