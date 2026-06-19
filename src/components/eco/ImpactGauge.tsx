import { memo } from "react";

/**
 * Pure presentational radial gauge. SVG only — no chart lib required, so
 * the hero metric renders synchronously while heavier Recharts panels are
 * lazy-loaded below the fold.
 */
function ImpactGaugeBase({
  score,
  tonnes,
  label = "Impact Score",
}: {
  score: number; // 0-100
  tonnes: number;
  label?: string;
}) {
  const safe = Math.max(0, Math.min(100, score));
  const radius = 88;
  const circumference = Math.PI * radius; // semi-circle
  const offset = circumference * (1 - safe / 100);
  const status =
    safe >= 75 ? "Excellent" : safe >= 50 ? "On track" : safe >= 30 ? "Needs work" : "High impact";
  const stroke =
    safe >= 75
      ? "var(--forest)"
      : safe >= 50
        ? "var(--sage)"
        : safe >= 30
          ? "var(--chart-4)"
          : "var(--destructive)";
  return (
    <div
      role="img"
      aria-label={`${label}: ${safe} out of 100 — ${status}. Estimated ${tonnes.toFixed(2)} tonnes CO2e per year.`}
      className="relative"
    >
      <svg viewBox="0 0 220 130" className="h-auto w-full max-w-[260px]" aria-hidden>
        <defs>
          <linearGradient id="gaugeGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--sage)" />
            <stop offset="100%" stopColor={stroke} />
          </linearGradient>
        </defs>
        <path
          d={`M 22 110 A ${radius} ${radius} 0 0 1 198 110`}
          fill="none"
          stroke="color-mix(in oklab, var(--forest) 12%, transparent)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M 22 110 A ${radius} ${radius} 0 0 1 198 110`}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center pb-1 text-center">
        <span className="font-display text-5xl font-semibold tabular-nums text-foreground">
          {safe}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {status}
        </span>
      </div>
    </div>
  );
}

export const ImpactGauge = memo(ImpactGaugeBase);
