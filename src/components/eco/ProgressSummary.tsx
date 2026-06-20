import { memo, useMemo } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { AppState } from "@/lib/eco/types";
import { cn } from "@/lib/utils";

interface ProgressSummaryProps {
  state: AppState;
  currentKgPerMonth: number;
}

/**
 * Closes the Understand → Track → Reduce → **Measure** feedback loop.
 *
 * The problem statement requires the platform to help users "reduce their
 * carbon footprint". Reduction is only meaningful if the user can see
 * *quantified proof* that it is happening. This component computes the
 * delta between the earliest and latest history entries and renders an
 * explicit, human-readable progress statement.
 */
export const ProgressSummary = memo(function ProgressSummary({
  state,
  currentKgPerMonth,
}: ProgressSummaryProps) {
  const { deltaKg, deltaPercent, direction } = useMemo(() => {
    const h = state.history;
    if (h.length < 2) {
      return { deltaKg: 0, deltaPercent: 0, direction: "neutral" as const };
    }
    const first = h[0].kg;
    const last = h[h.length - 1].kg;
    const delta = last - first;
    const pct = first > 0 ? (delta / first) * 100 : 0;

    return {
      deltaKg: Math.abs(Math.round(delta)),
      deltaPercent: Math.abs(Math.round(pct)),
      direction: delta < 0 ? ("down" as const) : delta > 0 ? ("up" as const) : ("neutral" as const),
    };
  }, [state.history]);

  const actionsLogged = state.log.length;
  const pointsEarned = state.points;

  if (direction === "neutral" && actionsLogged === 0) return null;

  return (
    <div
      className="glass-card rounded-2xl p-5 border-sage/30"
      role="status"
      aria-label="Your carbon reduction progress summary"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-xl",
            direction === "down" && "bg-forest-deep/15 text-forest-deep",
            direction === "up" && "bg-destructive/10 text-destructive",
            direction === "neutral" && "bg-accent text-accent-foreground",
          )}
        >
          {direction === "down" ? (
            <TrendingDown className="size-6" aria-hidden="true" />
          ) : direction === "up" ? (
            <TrendingUp className="size-6" aria-hidden="true" />
          ) : (
            <Minus className="size-6" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your Progress
          </p>
          {direction === "down" ? (
            <p className="mt-0.5 font-display text-lg font-semibold text-foreground">
              You&apos;ve reduced your footprint by{" "}
              <span className="text-forest-deep">
                {deltaKg} kg ({deltaPercent}%)
              </span>{" "}
              since you started — that&apos;s the equivalent of{" "}
              <span className="text-forest-deep">{Math.round(deltaKg / 21)} trees</span> planted!
            </p>
          ) : direction === "up" ? (
            <p className="mt-0.5 font-display text-lg font-semibold text-foreground">
              Your footprint has risen by{" "}
              <span className="text-destructive">
                {deltaKg} kg ({deltaPercent}%)
              </span>{" "}
              since you started. Check your highest category for quick wins.
            </p>
          ) : (
            <p className="mt-0.5 font-display text-lg font-semibold text-foreground">
              You&apos;re holding steady — {actionsLogged} actions logged and{" "}
              <span className="text-forest-deep">{pointsEarned} eco-points</span> earned so far.
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground">Monthly avg</p>
          <p className="font-display text-2xl font-semibold tabular-nums text-foreground">
            {currentKgPerMonth.toLocaleString()}
            <span className="ml-1 text-xs font-medium text-muted-foreground">kg</span>
          </p>
        </div>
      </div>
    </div>
  );
});
