import React, { Suspense, lazy } from "react";
import type { CategoryBreakdown } from "@/lib/eco/types";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the heavy Recharts component implementation
const ChartsPanelImpl = lazy(() => import("./_ChartsPanelImpl"));

function ChartsFallback() {
  return (
    <>
      <div
        className="glass-card rounded-2xl p-5 lg:col-span-2 flex flex-col gap-4"
        style={{ height: 360 }}
      >
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="flex-1 w-full rounded-xl" />
      </div>
      <div
        className="glass-card rounded-2xl p-5 lg:col-span-3 flex flex-col gap-4"
        style={{ height: 360 }}
      >
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="flex-1 w-full rounded-xl" />
      </div>
      <div
        className="glass-card rounded-2xl p-5 lg:col-span-5 flex flex-col gap-4"
        style={{ height: 280 }}
      >
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="flex-1 w-full rounded-xl" />
      </div>
    </>
  );
}

export default function ChartsPanel(props: {
  breakdown: CategoryBreakdown;
  comparison: { name: string; kg: number; isYou: boolean; label: string }[];
  history: { month: string; kg: number }[];
}) {
  return (
    <Suspense fallback={<ChartsFallback />}>
      <ChartsPanelImpl {...props} />
    </Suspense>
  );
}
