import { Calculator, LayoutDashboard, Sparkles, Target, Leaf, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewKey = "dashboard" | "calculator" | "actions" | "insights" | "map";

const NAV: { key: ViewKey; label: string; icon: typeof Leaf }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "calculator", label: "Calculator", icon: Calculator },
  { key: "actions", label: "Action Hub", icon: Target },
  { key: "insights", label: "AI Insights", icon: Sparkles },
  { key: "map", label: "Global Map", icon: Globe },
];

export function Sidebar({ view, onChange }: { view: ViewKey; onChange: (v: ViewKey) => void }) {
  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-30 flex h-auto w-full shrink-0 flex-row items-center gap-2 border-b border-border/60 bg-card/70 px-4 py-3 backdrop-blur md:h-dvh md:w-64 md:flex-col md:items-stretch md:gap-1 md:border-b-0 md:border-r md:px-4 md:py-6"
    >
      <div className="flex items-center gap-2 md:mb-6">
        <div className="grid size-9 place-items-center rounded-xl eco-gradient text-primary-foreground shadow-[var(--shadow-soft)]">
          <Leaf className="size-5" aria-hidden />
        </div>
        <div className="hidden md:block">
          <p className="font-display text-lg font-semibold text-foreground">Samatva</p>
          <p className="text-xs text-muted-foreground">Nature-Tech carbon platform</p>
        </div>
      </div>
      <ul className="flex w-full flex-1 flex-row gap-1 md:flex-col" role="list">
        {NAV.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          return (
            <li key={key} className="flex-1 md:flex-none">
              <button
                type="button"
                data-testid={`nav-${key}`}
                aria-current={active ? "page" : undefined}
                onClick={() => onChange(key)}
                className={cn(
                  "group flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background md:justify-start",
                  active
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                    : "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
                <span className="hidden sm:inline">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="hidden rounded-xl border border-border/60 bg-gradient-to-br from-sage-soft/40 to-transparent p-3 text-xs text-foreground/80 md:block">
        <p className="font-medium text-foreground">Tip</p>
        <p className="mt-1 leading-snug text-muted-foreground">
          Your progress saves automatically to this device.
        </p>
      </div>
    </nav>
  );
}
