import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function MetricCardBase({
  label,
  value,
  unit,
  trend,
  icon,
  tone = "default",
  testId,
}: {
  label: string;
  value: string;
  unit?: string;
  trend?: { value: number; positiveIsGood?: boolean };
  icon: ReactNode;
  tone?: "default" | "primary";
  testId?: string;
}) {
  const good = trend ? (trend.positiveIsGood ? trend.value > 0 : trend.value < 0) : false;
  return (
    <article
      data-testid={testId}
      className={cn(
        "glass-card relative overflow-hidden rounded-2xl p-5",
        tone === "primary" && "bg-primary text-primary-foreground border-transparent",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "text-xs font-medium uppercase tracking-wider",
            tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
        <span
          className={cn(
            "grid size-9 place-items-center rounded-lg",
            tone === "primary"
              ? "bg-white/15 text-primary-foreground"
              : "bg-accent text-accent-foreground",
          )}
          aria-hidden
        >
          {icon}
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="font-display text-4xl font-semibold tabular-nums">{value}</span>
        {unit && (
          <span
            className={cn(
              "text-sm font-medium",
              tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground",
            )}
          >
            {unit}
          </span>
        )}
      </div>
      {trend && (
        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            good ? "bg-forest-deep/15 text-forest-deep" : "bg-destructive/10 text-destructive",
            tone === "primary" && "bg-white/15 text-primary-foreground",
          )}
        >
          <span aria-hidden="true">{trend.value > 0 ? "▲" : "▼"}</span>
          <span className="sr-only">{trend.value > 0 ? "Increased by" : "Decreased by"}</span>{" "}
          {Math.abs(trend.value).toFixed(1)}%
        </p>
      )}
    </article>
  );
}

export const MetricCard = memo(MetricCardBase);
