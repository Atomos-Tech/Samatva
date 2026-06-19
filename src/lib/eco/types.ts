/**
 * Domain models. All shapes are strictly typed and consumed by:
 *   - Zod schemas (`schemas.ts`) for runtime validation
 *   - Pure calc functions (`calc.ts`) for testable math
 *   - The `useCarbonCalculator` hook for memoised derived state
 */
export interface UserFootprint {
  travel: {
    carKmPerWeek: number;
    flightsPerYear: number;
    publicTransitKmPerWeek: number;
  };
  home: {
    electricityKwhPerMonth: number;
    gasKwhPerMonth: number;
    renewablePercent: number;
  };
  diet: {
    type: "vegan" | "vegetarian" | "pescatarian" | "omnivore" | "heavy_meat";
    foodWasteLevel: 1 | 2 | 3 | 4 | 5;
  };
  consumption: {
    shoppingLevel: 1 | 2 | 3 | 4 | 5;
    recyclesPercent: number;
  };
}

export type DietType = UserFootprint["diet"]["type"];
export type Level1to5 = 1 | 2 | 3 | 4 | 5;
export type FootprintCategory = "travel" | "home" | "diet" | "consumption";

export interface CategoryBreakdown {
  travel: number;
  home: number;
  diet: number;
  consumption: number;
}

export interface EcoAction {
  id: string;
  title: string;
  description: string;
  category: FootprintCategory;
  points: number;
  co2SavedKg: number;
  icon: string;
}

export interface ActionLog {
  actionId: string;
  date: string; // ISO yyyy-mm-dd
}

export interface Recommendation {
  id: string;
  category: FootprintCategory;
  title: string;
  body: string;
  impactKg: number;
  difficulty: "easy" | "medium" | "ambitious";
}
/** Backwards-compatible alias. */
export type InsightTip = Recommendation;

export interface AppState {
  footprint: UserFootprint;
  onboarded: boolean;
  points: number;
  log: ActionLog[];
  history: { month: string; kg: number }[];
  planned?: string[];
}
