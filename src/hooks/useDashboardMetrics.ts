import { useMemo } from "react";
import type { AppState } from "@/lib/eco/types";
import { useCarbonCalculator } from "@/hooks/useCarbonCalculator";
import { computeStreak } from "@/lib/eco/store";

/**
 * Derives all metrics required by the Dashboard from raw AppState.
 *
 * All heavy computation is memoised — comparison and trend arrays are only
 * rebuilt when their specific dependencies change, not on every render.
 */
export function useDashboardMetrics(state: AppState) {
  const {
    breakdown,
    totalKg: total,
    totalTonnes,
    impactScore,
    comparison,
  } = useCarbonCalculator(state.footprint);

  // Scalar derivations — all depend on total and state.points only.
  const { adjusted, monthly, totalSavings, streak } = useMemo(() => {
    const adj = Math.max(0, total - state.points * 4);
    return {
      adjusted: adj,
      monthly: Math.round(adj / 12),
      totalSavings: state.log.length,
      streak: computeStreak(state.log),
    };
  }, [total, state.points, state.log]);

  const compareData = useMemo(
    () =>
      comparison.map((c) => ({
        name: c.short,
        label: c.label,
        kg: c.isYou ? adjusted : c.kg,
        isYou: c.isYou,
      })),
    [comparison, adjusted],
  );

  const trend = useMemo(() => {
    const h = state.history;
    if (h.length < 2) return 0;
    const last = h[h.length - 1].kg;
    const prev = h[h.length - 2].kg;
    return ((last - prev) / prev) * 100;
  }, [state.history]);

  const trendHistory = useMemo(
    () => state.history.map((h) => ({ ...h, kg: Math.max(monthly, h.kg - state.points) })),
    [state.history, state.points, monthly],
  );

  return {
    breakdown,
    totalTonnes,
    impactScore,
    totalSavings,
    adjusted,
    compareData,
    trend,
    trendHistory,
    streak,
  };
}
