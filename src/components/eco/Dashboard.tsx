import { Flame, Leaf, TrendingDown } from "lucide-react";
import type { AppState } from "@/lib/eco/types";
import { MetricCard } from "./MetricCard";
import { ImpactGauge } from "./ImpactGauge";
import { WelcomeInsight } from "./WelcomeInsight";
import { ProgressSummary } from "./ProgressSummary";
import ChartsPanel from "./charts/ChartsPanel";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

/**
 * Main dashboard view.
 *
 * All derived metrics (breakdown, totals, streak, etc.) are computed exactly
 * once via `useDashboardMetrics` and then passed down as props to child
 * components — ensuring no duplicate computation occurs in the component tree.
 */
export function Dashboard({ state }: { state: AppState }) {
  const {
    breakdown,
    totalTonnes,
    impactScore,
    totalSavings,
    adjusted,
    compareData,
    trend,
    trendHistory,
    streak,
  } = useDashboardMetrics(state);

  const monthlyKg = Math.round(adjusted / 12);

  return (
    <section aria-labelledby="dashboard-heading" className="space-y-6">
      {/* Hero — live footprint score */}
      <article className="glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div
          className="absolute -right-24 -top-24 size-72 rounded-full bg-sage-soft/60 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Live impact score
            </p>
            <h1
              id="dashboard-heading"
              className="mt-2 font-display text-4xl font-semibold text-foreground sm:text-5xl"
            >
              Your annual footprint is{" "}
              <span className="text-primary tabular-nums">{totalTonnes.toFixed(2)} t CO₂e</span>.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Samatva continuously scores your lifestyle against the Paris 2030 target and updates
              instantly as you log new eco-actions.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-xs text-foreground/80">
              <span className="size-2 rounded-full bg-sage animate-pulse" aria-hidden="true" />
              {totalSavings} actions logged · {streak}-day streak
            </div>
          </div>
          <div className="justify-self-center" data-testid="impact-gauge">
            <ImpactGauge score={impactScore} tonnes={totalTonnes} />
          </div>
        </div>
      </article>

      {/* Proactive AI analysis — breakdown passed as prop to avoid re-computation */}
      <WelcomeInsight footprint={state.footprint} breakdown={breakdown} />

      {/* Explicit progress measurement — closes the Understand→Track→Reduce→Measure loop */}
      <ProgressSummary state={state} currentKgPerMonth={monthlyKg} />

      {/* Metric cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          testId="daily-tip-display"
          label="Daily Tip"
          value="Go Meatless"
          unit="today to save 2kg CO₂e"
          icon={<Leaf className="size-4" aria-hidden="true" />}
        />
        <MetricCard
          label="Monthly Trend"
          value={`${trend > 0 ? "+" : ""}${trend.toFixed(1)}%`}
          unit="vs last month"
          icon={<TrendingDown className="size-4" aria-hidden="true" />}
          trend={{ value: trend, positiveIsGood: false }}
        />
        <MetricCard
          label="Eco-Points Earned"
          value={state.points.toLocaleString()}
          unit="pts"
          icon={<Flame className="size-4" aria-hidden="true" />}
        />
      </div>

      {/* Charts grid */}
      <div className="grid gap-4 lg:grid-cols-5">
        <ChartsPanel breakdown={breakdown} comparison={compareData} history={trendHistory} />
      </div>
    </section>
  );
}
