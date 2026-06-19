import { memo } from "react";
import {
  Leaf,
  Bike,
  PlugZap,
  ShoppingBag,
  ShowerHead,
  TramFront,
  Salad,
  Wind,
  Car,
  Zap,
  Beef,
  ShoppingCart,
  Bus,
  MonitorOff,
  Sprout,
  Recycle,
  Thermometer,
  type LucideProps,
} from "lucide-react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EcoAction } from "@/lib/eco/types";

/**
 * Explicit allowlist of Lucide icons that are valid for EcoActions.
 *
 * Using a wildcard `import * as Lucide` with an `any` cast is unsafe because:
 *   1. It bypasses TypeScript's type system entirely.
 *   2. It ships the entire icon library to the client bundle.
 *   3. An AI-generated action could reference a non-component Lucide export.
 *
 * This map is the single source of truth for which icons are permitted.
 */
const ICON_ALLOWLIST: Record<string, React.FC<LucideProps>> = {
  Leaf,
  Bike,
  PlugZap,
  ShoppingBag,
  ShowerHead,
  TramFront,
  Salad,
  Wind,
  Car,
  Zap,
  Beef,
  ShoppingCart,
  Bus,
  MonitorOff,
  Sprout,
  Recycle,
  Thermometer,
};

function getIcon(name: string): React.FC<LucideProps> {
  return ICON_ALLOWLIST[name] ?? Leaf;
}

interface ActionCardProps {
  action: EcoAction;
  isDone: boolean;
  onToggle: (action: EcoAction) => void;
}

export const ActionCard = memo(function ActionCard({ action, isDone, onToggle }: ActionCardProps) {
  const Icon = getIcon(action.icon);

  return (
    <article
      data-testid={`action-card-${action.id}`}
      className={cn(
        "glass-card group flex flex-col gap-3 rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glass)]",
        isDone && "border-forest/40 bg-sage-soft/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <span className="rounded-full bg-sage-soft/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-forest-deep">
          {action.category}
        </span>
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground">{action.title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{action.description}</p>
      </div>
      <dl className="flex items-center gap-4 text-xs text-muted-foreground">
        <div>
          <dt className="sr-only">Eco-points reward</dt>
          <dd className="font-semibold text-forest-deep">+{action.points} pts</dd>
        </div>
        <div>
          <dt className="sr-only">CO₂e saved</dt>
          <dd>−{action.co2SavedKg} kg CO₂e</dd>
        </div>
      </dl>
      <button
        type="button"
        data-testid={`action-card-toggle-${action.id}`}
        onClick={() => onToggle(action)}
        aria-pressed={isDone}
        aria-label={isDone ? `Remove ${action.title}` : `Log ${action.title}`}
        className={cn(
          "mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ring",
          isDone
            ? "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            : "bg-primary text-primary-foreground hover:bg-forest-deep",
        )}
      >
        {isDone ? (
          <>
            <Check className="size-4" aria-hidden="true" /> Remove action
          </>
        ) : (
          <>
            <Plus className="size-4" aria-hidden="true" /> Log action
          </>
        )}
      </button>
    </article>
  );
});
