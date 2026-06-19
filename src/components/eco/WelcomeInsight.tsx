import { useEffect, useRef, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { askGemini } from "@/lib/api/gemini.functions";
import type { CategoryBreakdown, UserFootprint } from "@/lib/eco/types";

interface WelcomeInsightProps {
  footprint: UserFootprint;
  breakdown: CategoryBreakdown;
}

/**
 * Proactive AI analysis shown at the top of the Dashboard.
 *
 * Design decisions:
 * - Accepts `breakdown` as a prop rather than re-computing it internally,
 *   because Dashboard already derives breakdown from `useDashboardMetrics`.
 *   Duplicating that computation would waste CPU and cause stale-value bugs.
 * - Uses `aria-live="polite"` so screen readers announce the AI result
 *   when it replaces the loading state without a page navigation.
 * - A cancellation flag prevents setState calls after unmount when the
 *   component is removed before the async call resolves.
 */
export function WelcomeInsight({ footprint, breakdown }: WelcomeInsightProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Stable ref so the cleanup function in useEffect can cancel in-flight requests.
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    setLoading(true);
    setInsight(null);

    askGemini({
      data: {
        query:
          "Please summarize my footprint breakdown in exactly 2 short sentences. Start by acknowledging my biggest emission category, and suggest one high-impact area to focus on. Be encouraging.",
        footprint,
        breakdown,
      },
    })
      .then((res) => {
        if (!cancelledRef.current) {
          setInsight(res.answer);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelledRef.current) {
          setInsight(
            "Your footprint is calculated! Check out your highest emission category below to start reducing.",
          );
          setLoading(false);
        }
      });

    return () => {
      cancelledRef.current = true;
    };
  }, [breakdown, footprint]);

  return (
    <div className="glass-card flex items-start gap-4 rounded-2xl border-primary/20 bg-primary/5 p-5">
      <div
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary"
        aria-hidden="true"
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <Sparkles className="size-5" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1">
        <h2 className="text-sm font-semibold text-foreground">AI Footprint Analysis</h2>
        {/* aria-live="polite" ensures screen readers announce the AI result
            when it asynchronously replaces the loading message. */}
        <p
          className="mt-1 text-sm leading-relaxed text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {loading ? "Analyzing your live footprint data…" : insight}
        </p>
      </div>
    </div>
  );
}
