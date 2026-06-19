import { useMemo } from "react";
import {
  computeBreakdown,
  totalKg,
  highestCategory,
  COMPARISON_AVERAGES,
  getInsightsFor,
} from "@/lib/eco/calc";
import type {
  CategoryBreakdown,
  FootprintCategory,
  Recommendation,
  UserFootprint,
} from "@/lib/eco/types";

export interface CarbonCalculatorResult {
  breakdown: CategoryBreakdown;
  totalKg: number;
  totalTonnes: number;
  topCategory: FootprintCategory;
  comparison: { label: string; short: string; kg: number; isYou: boolean }[];
  recommendations: Recommendation[];
  /** Overall impact score 0-100 (100 = best, well below Paris target). */
  impactScore: number;
}

/**
 * Single source of truth for derived carbon metrics.
 *
 * All math is delegated to pure functions in `lib/eco/calc.ts`, this hook
 * only handles memoisation so charts don't recompute on unrelated renders.
 */
export function useCarbonCalculator(footprint: UserFootprint): CarbonCalculatorResult {
  return useMemo<CarbonCalculatorResult>(() => {
    const breakdown = computeBreakdown(footprint);
    const total = totalKg(breakdown);
    const top = highestCategory(breakdown);

    const comparison = COMPARISON_AVERAGES.map((c) => ({
      label: c.label,
      short: c.short,
      kg: "kg" in c ? c.kg : total,
      isYou: c.label === "You",
    }));

    // 0–100 score: 2300 kg (Paris) = 90, 4700 kg (global avg) = 60,
    // 7700 kg (national avg) = 30, 12000+ kg = 0
    const score = (() => {
      if (total <= 0) return 100;
      const raw = 100 - (total - 2300) / 100;
      return Math.max(0, Math.min(100, Math.round(raw)));
    })();

    return {
      breakdown,
      totalKg: total,
      totalTonnes: total / 1000,
      topCategory: top,
      comparison,
      recommendations: getInsightsFor(breakdown).slice(0, 3),
      impactScore: score,
    };
  }, [footprint]);
}
