import { useMemo } from "react";
import type { AppState } from "@/lib/eco/types";
import { useCarbonCalculator } from "@/hooks/useCarbonCalculator";
import { computeStreak } from "@/lib/eco/store";

export function useDashboardMetrics(state: AppState) {
  const {
    breakdown,
    totalKg: total,
    totalTonnes,
    impactScore,
    comparison,
  } = useCarbonCalculator(state.footprint);

  const totalSavings = state.log.length;
  const adjusted = Math.max(0, total - state.points * 4);
  const monthly = Math.round(adjusted / 12);

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

  const streak = computeStreak(state.log);

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
