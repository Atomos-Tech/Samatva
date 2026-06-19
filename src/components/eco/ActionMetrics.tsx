import { Flame, Coins, Sprout } from "lucide-react";

interface ActionMetricsProps {
  streak: number;
  points: number;
  totalCo2Saved: number;
}

/**
 * Summarises the user's eco-action performance across three key metrics.
 * Uses named icon imports — never `import * as Lucide` — to keep the bundle lean.
 */
export function ActionMetrics({ streak, points, totalCo2Saved }: ActionMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <article className="glass-card flex items-center gap-4 rounded-2xl p-5">
        <div className="grid size-12 place-items-center rounded-xl eco-gradient text-primary-foreground">
          <Flame className="size-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Current streak</p>
          <p
            data-testid="streak-display"
            className="font-display text-2xl font-semibold tabular-nums text-foreground"
          >
            {streak}-Day Green Streak
          </p>
        </div>
      </article>

      <article className="glass-card flex items-center gap-4 rounded-2xl p-5">
        <div className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Coins className="size-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Eco-points</p>
          <p className="font-display text-2xl font-semibold tabular-nums text-foreground">
            {points.toLocaleString()}
          </p>
        </div>
      </article>

      <article className="glass-card flex items-center gap-4 rounded-2xl p-5">
        <div className="grid size-12 place-items-center rounded-xl bg-sage-soft text-forest-deep">
          <Sprout className="size-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">CO₂e saved</p>
          <p className="font-display text-2xl font-semibold tabular-nums text-foreground">
            {totalCo2Saved.toFixed(1)} kg
          </p>
        </div>
      </article>
    </div>
  );
}
