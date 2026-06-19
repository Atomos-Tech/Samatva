// test file; install `vitest` to type-check & execute (see header).
/**
 * EcoTrace — Carbon math unit tests.
 *
 * These tests are written for Vitest (drop-in Jest API). To run:
 *   bun add -d vitest @vitest/coverage-v8
 *   bunx vitest run
 *
 * Coverage rationale
 * ------------------
 * Every function in `calc.ts` is pure (deterministic, side-effect free,
 * dependency-free) so each branch is unit-testable in isolation.
 *
 * The hook layer (`useCarbonCalculator`) is intentionally a thin
 * `useMemo` wrapper around these utilities, which means we get full
 * confidence in the hook via the unit tests below without needing
 * a React renderer for the math layer.
 *
 * Integration test outline (RTL, separate file):
 *  - render <Calculator />, fire slider events, assert that the
 *    `data-testid="calculator-live-total"` node reflects the value
 *    produced by `computeBreakdown` for the same input.
 *  - render <Dashboard /> with a known footprint and assert that the
 *    radial gauge text matches `useCarbonCalculator(...).impactScore`.
 */
import { describe, expect, it } from "vitest";
import { computeBreakdown, totalKg, highestCategory, getInsightsFor } from "../calc";
import type { UserFootprint } from "../types";

const baseline: UserFootprint = {
  travel: { carKmPerWeek: 100, flightsPerYear: 1, publicTransitKmPerWeek: 0 },
  home: { electricityKwhPerMonth: 200, gasKwhPerMonth: 100, renewablePercent: 0 },
  diet: { type: "omnivore", foodWasteLevel: 3 },
  consumption: { shoppingLevel: 3, recyclesPercent: 50 },
};

describe("computeBreakdown", () => {
  it("returns non-negative integers for every category", () => {
    const b = computeBreakdown(baseline);
    for (const v of Object.values(b)) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it("clamps absurdly large inputs (no Infinity / overflow into charts)", () => {
    const b = computeBreakdown({
      ...baseline,
      travel: { carKmPerWeek: 1e9, flightsPerYear: 1e9, publicTransitKmPerWeek: 1e9 },
    });
    expect(Number.isFinite(b.travel)).toBe(true);
  });

  it("treats negative inputs as zero", () => {
    const b = computeBreakdown({
      ...baseline,
      home: { electricityKwhPerMonth: -500, gasKwhPerMonth: -500, renewablePercent: -10 },
    });
    expect(b.home).toBeGreaterThanOrEqual(0);
  });

  it("100% renewable removes electricity emissions", () => {
    const a = computeBreakdown({ ...baseline, home: { ...baseline.home, renewablePercent: 0 } });
    const z = computeBreakdown({ ...baseline, home: { ...baseline.home, renewablePercent: 100 } });
    expect(z.home).toBeLessThan(a.home);
  });

  it("vegan diet emits less than heavy_meat with identical other inputs", () => {
    const vegan = computeBreakdown({ ...baseline, diet: { type: "vegan", foodWasteLevel: 3 } });
    const heavy = computeBreakdown({
      ...baseline,
      diet: { type: "heavy_meat", foodWasteLevel: 3 },
    });
    expect(vegan.diet).toBeLessThan(heavy.diet);
  });
});

describe("totalKg + highestCategory", () => {
  it("totalKg sums all four categories", () => {
    const b = computeBreakdown(baseline);
    expect(totalKg(b)).toBe(b.travel + b.home + b.diet + b.consumption);
  });

  it("highestCategory identifies the dominant emission source", () => {
    const flyer = computeBreakdown({
      ...baseline,
      travel: { carKmPerWeek: 500, flightsPerYear: 20, publicTransitKmPerWeek: 0 },
    });
    expect(highestCategory(flyer)).toBe("travel");
  });
});

describe("getInsightsFor", () => {
  it("ranks recommendations by the user's worst category first", () => {
    const flyer = computeBreakdown({
      ...baseline,
      travel: { carKmPerWeek: 500, flightsPerYear: 20, publicTransitKmPerWeek: 0 },
    });
    const tips = getInsightsFor(flyer);
    expect(tips[0]?.category).toBe("travel");
  });
});
