import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Lazy wrapper for GlobalMap.
 *
 * Leaflet requires `window` and `document` at module-evaluation time, which
 * causes an immediate crash when the module is imported in an SSR (Node.js)
 * context.  By hiding the real import behind `React.lazy`, the module is only
 * loaded in the browser after hydration — preventing the server-side crash.
 */
const GlobalMapImpl = lazy(() =>
  import("./GlobalMap").then((m) => ({ default: m.GlobalMap })),
);

function GlobalMapSkeleton() {
  return (
    <div className="glass-card relative overflow-hidden rounded-3xl flex-1 border border-border/60 p-6 space-y-4 min-h-[60vh] flex flex-col">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="flex-1 w-full rounded-2xl" />
    </div>
  );
}

/** Client-only GlobalMap — SSR-safe lazy boundary around Leaflet. */
export function GlobalMapLazy() {
  return (
    <Suspense fallback={<GlobalMapSkeleton />}>
      <GlobalMapImpl />
    </Suspense>
  );
}
