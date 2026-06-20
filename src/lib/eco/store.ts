import { useEffect, useState } from "react";
import type { AppState, UserFootprint, ActionLog } from "./types";
import { appStateSchema } from "./schemas";

const KEY = "verdant.state.v1";

const DEFAULT_FOOTPRINT: UserFootprint = {
  travel: { carKmPerWeek: 120, flightsPerYear: 2, publicTransitKmPerWeek: 30 },
  home: { electricityKwhPerMonth: 280, gasKwhPerMonth: 220, renewablePercent: 20 },
  diet: { type: "omnivore", foodWasteLevel: 3 },
  consumption: { shoppingLevel: 3, recyclesPercent: 55 },
};

function seedHistory(): { month: string; kg: number }[] {
  const now = new Date();
  const out: { month: string; kg: number }[] = [];

  // A realistic, gradually decreasing carbon footprint trend
  // demonstrating the user's progress over the last 6 months
  const trendData = [850, 810, 760, 720, 680, 640];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      month: d.toLocaleString("en", { month: "short" }),
      kg: trendData[5 - i],
    });
  }
  return out;
}

export const DEFAULT_STATE: AppState = {
  footprint: DEFAULT_FOOTPRINT,
  onboarded: false, // MUST BE FALSE to force mandatory calculator onboarding
  points: 0,
  log: [],
  history: seedHistory(), // Keep 6-month seed data as requested by user previously
};

function load(): AppState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    const merged = {
      ...DEFAULT_STATE,
      ...parsed,
      footprint: { ...DEFAULT_FOOTPRINT, ...(parsed?.footprint ?? {}) },
    };
    const result = appStateSchema.safeParse(merged);
    if (!result.success) {
      console.warn("Corrupt local storage data, reverting to safe defaults:", result.error);
      return DEFAULT_STATE;
    }
    return result.data as AppState;
  } catch {
    return DEFAULT_STATE;
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota */
    }
  }, [state, hydrated]);

  return { state, setState, hydrated };
}

/**
 * Computes the current consecutive eco-action streak in days.
 *
 * Rules:
 *  - Today may be un-logged without breaking the streak (it's still in progress).
 *  - A single gap in the log ends the streak immediately.
 *  - Returns 0 for an empty log.
 */
export function computeStreak(log: ActionLog[]): number {
  const days = new Set(log.map((l) => l.date));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // allow today to not be logged yet
      if (streak === 0 && key === new Date().toISOString().slice(0, 10)) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return streak;
}

/** Returns today's date in ISO yyyy-mm-dd format. */
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export { DEFAULT_FOOTPRINT };
