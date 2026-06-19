import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AppState, EcoAction } from "@/lib/eco/types";
import { ECO_ACTIONS } from "@/lib/eco/calc";
import { fetchEcoActions } from "@/lib/eco/api";
import { computeStreak, todayKey } from "@/lib/eco/store";
import { cn } from "@/lib/utils";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { generatePersonalizedActions } from "@/lib/api/gemini.functions";
import { ActionCard } from "./ActionCard";
import { ActionMetrics } from "./ActionMetrics";

export function ActionHub({
  state,
  onLog,
}: {
  state: AppState;
  onLog: (action: EcoAction) => void;
}) {
  const [actions, setActions] = useState<EcoAction[]>(ECO_ACTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const { breakdown } = useDashboardMetrics(state);

  useEffect(() => {
    let cancelled = false;
    fetchEcoActions()
      .then((data) => {
        if (!cancelled) setActions(data);
      })
      .catch(() => {
        /* falls back to seed data */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const streak = useMemo(() => computeStreak(state.log), [state.log]);
  const today = todayKey();
  const loggedToday = useMemo(
    () => new Set(state.log.filter((l) => l.date === today).map((l) => l.actionId)),
    [state.log, today],
  );

  const totalCo2Saved = useMemo(
    () =>
      state.log.reduce((sum, l) => {
        const a = actions.find((x) => x.id === l.actionId);
        return sum + (a?.co2SavedKg ?? 0);
      }, 0),
    [state.log, actions],
  );

  const handleLog = useCallback(
    (action: EcoAction) => {
      onLog(action);
      if (loggedToday.has(action.id)) {
        toast.success(`Action removed`, {
          description: `${action.title} was removed. −${action.points} eco-points`,
        });
      } else {
        toast.success(`+${action.points} eco-points`, {
          description: `${action.title} · −${action.co2SavedKg} kg CO₂e`,
        });
      }
    },
    [loggedToday, onLog],
  );

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    toast.info("Generating personalized actions...", {
      description: "AI is analyzing your footprint breakdown.",
    });
    try {
      const newActions = await generatePersonalizedActions({ data: { breakdown } });
      if (newActions && newActions.length > 0) {
        setActions((prev) => [...newActions, ...prev]);
        toast.success("New actions ready!", {
          description: "Added personalized actions to your dashboard.",
        });
      } else {
        toast.error("Failed to generate", { description: "Received empty response from AI." });
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error("Generation failed", { description: "Could not connect to AI assistant." });
    } finally {
      setIsGenerating(false);
    }
  }, [breakdown]);

  return (
    <section aria-labelledby="actions-heading" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Daily challenges
          </p>
          <h1
            id="actions-heading"
            className="font-display text-3xl font-semibold text-foreground sm:text-4xl"
          >
            Build your green streak.
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Small daily wins add up. Log actions to earn eco-points and lower your live footprint.
          </p>
        </div>
        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-deep px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-forest focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <span aria-hidden="true">✨</span>
          )}{" "}
          Generate Personalized Actions
        </button>
      </header>

      <ActionMetrics streak={streak} points={state.points} totalCo2Saved={totalCo2Saved} />

      <div className="flex items-center gap-1.5" role="list" aria-label="Last 7 days streak">
        {Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const key = d.toISOString().slice(0, 10);
          const active = state.log.some((l) => l.date === key);
          return (
            <div
              key={key}
              role="listitem"
              title={d.toLocaleDateString()}
              className={cn("h-2.5 flex-1 rounded-full", active ? "bg-forest" : "bg-border")}
            />
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((a) => (
          <ActionCard key={a.id} action={a} isDone={loggedToday.has(a.id)} onToggle={handleLog} />
        ))}
      </div>
    </section>
  );
}
