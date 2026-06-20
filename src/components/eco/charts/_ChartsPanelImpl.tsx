import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryBreakdown } from "@/lib/eco/types";

const CHART_COLORS = ["var(--forest)", "var(--chart-2)", "var(--sage)", "var(--chart-4)"];

const TOOLTIP_STYLE = {
  background: "var(--offwhite)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--charcoal)",
} as const;

export default function ChartsPanelImpl({
  breakdown,
  comparison,
  history,
}: {
  breakdown: CategoryBreakdown;
  comparison: { name: string; kg: number; isYou: boolean; label: string }[];
  history: { month: string; kg: number }[];
}) {
  const pieData = [
    { name: "Travel", value: breakdown.travel },
    { name: "Home", value: breakdown.home },
    { name: "Diet", value: breakdown.diet },
    { name: "Goods", value: breakdown.consumption },
  ];

  return (
    <>
      <article className="glass-card rounded-2xl p-5 lg:col-span-2">
        <header className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Emissions by category</h2>
          <span className="text-xs text-muted-foreground">kg CO₂e / yr</span>
        </header>
        <p className="text-xs text-muted-foreground">Donut chart — annual share by source.</p>
        <div className="mt-2 h-72" role="img" aria-label="Donut chart of emissions by category">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                stroke="var(--offwhite)"
                strokeWidth={3}
              >
                {pieData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={CHART_COLORS[pieData.indexOf(entry) % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [`${v.toLocaleString()} kg`, "CO₂e"]}
                contentStyle={TOOLTIP_STYLE}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass-card rounded-2xl p-5 lg:col-span-3">
        <header className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">How you compare</h2>
          <span className="text-xs text-muted-foreground">kg CO₂e / yr · lower is better</span>
        </header>
        <div
          className="mt-2 h-72"
          role="img"
          aria-label="Bar chart comparing your footprint to averages"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparison} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "var(--charcoal)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--accent)", opacity: 0.4 }}
                formatter={(v: number) => [`${v.toLocaleString()} kg`, "CO₂e"]}
                contentStyle={TOOLTIP_STYLE}
              />
              <Bar dataKey="kg" radius={[10, 10, 0, 0]}>
                {comparison.map((d) => (
                  <Cell key={d.name} fill={d.isYou ? "var(--forest)" : "var(--sage)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="glass-card rounded-2xl p-5 lg:col-span-5">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">6-month trend</h2>
          <span className="text-xs text-muted-foreground">kg CO₂e per month</span>
        </header>
        <div className="h-56" role="img" aria-label="Bar chart of last six months of emissions">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "var(--charcoal)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--accent)", opacity: 0.4 }}
                formatter={(v: number) => [`${v.toLocaleString()} kg`, "CO₂e"]}
                contentStyle={TOOLTIP_STYLE}
              />
              <Bar dataKey="kg" fill="var(--forest)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </>
  );
}
