import { useState, useRef, useEffect } from "react";
import { Sparkles, ArrowUpRight, Gauge, Send, Bot, User, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AppState } from "@/lib/eco/types";
import { useCarbonCalculator } from "@/hooks/useCarbonCalculator";
import { getInsightsFor } from "@/lib/eco/calc";
import { askGemini } from "@/lib/api/gemini.functions";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  travel: "Travel",
  home: "Home energy",
  diet: "Diet",
  consumption: "Goods & shopping",
};

export function Insights({
  state,
  onTogglePlan,
}: {
  state: AppState;
  onTogglePlan: (id: string) => void;
}) {
  const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([
    {
      role: "bot",
      content:
        "Hi! I'm your Eco Assistant. Ask me anything about your carbon footprint or ways to reduce it.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const { breakdown, topCategory: top } = useCarbonCalculator(state.footprint);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const currentInput = inputValue;
    const newMessages = [...messages, { role: "user" as const, content: currentInput }];
    setMessages(newMessages);
    setInputValue("");

    // Add a temporary loading message
    setMessages((prev) => [...prev, { role: "bot", content: "..." }]);

    try {
      const response = await askGemini({
        data: {
          query: currentInput,
          footprint: state.footprint,
          breakdown,
        },
      });

      // Replace loading message with real response
      setMessages((prev) => [...prev.slice(0, -1), { role: "bot", content: response.answer }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "bot", content: "Sorry, I had trouble connecting to my AI brain." },
      ]);
    }
  };

  const tips = getInsightsFor(breakdown);
  // Brief: surface exactly 3 actionable, personalised recommendations.
  const top3 = tips.slice(0, 3);
  const topTotal = top3.reduce((s, t) => s + t.impactKg, 0);

  return (
    <section aria-labelledby="insights-heading" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Personalised plan
          </p>
          <h1
            id="insights-heading"
            className="font-display text-3xl font-semibold text-foreground sm:text-4xl"
          >
            Your highest-impact moves.
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Recommendations ranked by what would cut your footprint the most, starting with{" "}
            <span className="font-semibold text-foreground">{CATEGORY_LABEL[top]}</span>.
          </p>
        </div>
      </header>

      <article className="glass-card relative overflow-hidden rounded-2xl p-6">
        <div
          className="absolute -right-12 -top-12 size-48 rounded-full bg-sage-soft/50 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="grid size-12 place-items-center rounded-xl eco-gradient text-primary-foreground">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Top focus area</p>
            <p className="font-display text-2xl font-semibold text-foreground">
              {CATEGORY_LABEL[top]} —{" "}
              <span className="text-primary">{breakdown[top].toLocaleString()} kg / yr</span>
            </p>
          </div>
          <div className="rounded-xl bg-sage-soft/40 px-4 py-3 text-sm text-forest-deep">
            <p className="font-semibold tabular-nums">~{topTotal.toLocaleString()} kg</p>
            <p className="text-xs">potential annual cut</p>
          </div>
        </div>
      </article>

      <ol className="grid gap-4 lg:grid-cols-3">
        {top3.map((tip, idx) => (
          <li key={tip.id}>
            <article
              data-testid={`insight-${tip.id}`}
              className={cn(
                "glass-card h-full rounded-2xl p-5",
                tip.category === top && "border-forest/40",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-sage-soft/50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-forest-deep">
                  {CATEGORY_LABEL[tip.category]}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    tip.difficulty === "easy" && "bg-forest-deep/15 text-forest-deep",
                    tip.difficulty === "medium" && "bg-chart-4/15 text-chart-4",
                    tip.difficulty === "ambitious" && "bg-destructive/10 text-destructive",
                  )}
                >
                  {tip.difficulty}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                <span className="mr-2 text-muted-foreground tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {tip.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
              <footer className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                <span className="inline-flex items-center gap-1 text-forest-deep">
                  <Gauge className="size-3.5" aria-hidden /> −{tip.impactKg.toLocaleString()} kg /
                  yr
                </span>
                <button
                  type="button"
                  onClick={() => onTogglePlan(tip.id)}
                  className={cn(
                    "inline-flex items-center gap-1 font-medium transition-colors hover:text-primary focus:outline-none",
                    state.planned?.includes(tip.id) ? "text-primary" : "text-foreground",
                  )}
                >
                  {state.planned?.includes(tip.id) ? (
                    <>
                      Added <Check className="size-3.5" aria-hidden />
                    </>
                  ) : (
                    <>
                      Add to plan <Plus className="size-3.5" aria-hidden />
                    </>
                  )}
                </button>
              </footer>
            </article>
          </li>
        ))}
      </ol>

      <div className="mt-12 space-y-4">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Bot className="size-4" />
          </div>
          <h2 id="chat-heading" className="font-display text-2xl font-semibold text-foreground">
            Ask the Eco Assistant
          </h2>
        </div>
        <div className="glass-card flex h-[400px] flex-col overflow-hidden rounded-2xl">
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex max-w-[80%] items-start gap-3 rounded-2xl p-4 text-sm",
                  msg.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted/50 text-foreground",
                )}
              >
                {msg.role === "bot" && (
                  <div className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                    <Bot className="size-3.5" />
                  </div>
                )}
                <div className="leading-relaxed">{msg.content}</div>
                {msg.role === "user" && (
                  <div className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary-foreground/20 text-primary-foreground">
                    <User className="size-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-border/60 bg-muted/20 p-4"
          >
            <Input
              id="assistant-input"
              aria-label="Ask the Eco Assistant about your footprint"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your footprint..."
              className="flex-1 rounded-xl bg-background border-border/60"
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-xl shrink-0 transition-all hover:scale-105 active:scale-95"
            >
              <Send className="size-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
