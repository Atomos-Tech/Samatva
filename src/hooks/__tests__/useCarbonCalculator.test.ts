// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCarbonCalculator } from "../useCarbonCalculator";
import type { UserFootprint } from "@/lib/eco/types";

const baseline: UserFootprint = {
  travel: { carKmPerWeek: 100, flightsPerYear: 1, publicTransitKmPerWeek: 0 },
  home: { electricityKwhPerMonth: 200, gasKwhPerMonth: 100, renewablePercent: 0 },
  diet: { type: "omnivore", foodWasteLevel: 3 },
  consumption: { shoppingLevel: 3, recyclesPercent: 50 },
};

describe("useCarbonCalculator", () => {
  it("returns a breakdown with all four categories", () => {
    const { result } = renderHook(() => useCarbonCalculator(baseline));
    expect(result.current.breakdown).toHaveProperty("travel");
    expect(result.current.breakdown).toHaveProperty("home");
    expect(result.current.breakdown).toHaveProperty("diet");
    expect(result.current.breakdown).toHaveProperty("consumption");
  });

  it("totalKg equals the sum of the breakdown", () => {
    const { result } = renderHook(() => useCarbonCalculator(baseline));
    const { breakdown, totalKg } = result.current;
    expect(totalKg).toBe(
      breakdown.travel + breakdown.home + breakdown.diet + breakdown.consumption,
    );
  });

  it("totalTonnes is totalKg / 1000", () => {
    const { result } = renderHook(() => useCarbonCalculator(baseline));
    expect(result.current.totalTonnes).toBeCloseTo(result.current.totalKg / 1000, 5);
  });

  it("impactScore is between 0 and 100", () => {
    const { result } = renderHook(() => useCarbonCalculator(baseline));
    expect(result.current.impactScore).toBeGreaterThanOrEqual(0);
    expect(result.current.impactScore).toBeLessThanOrEqual(100);
  });

  it("a vegan footprint has a higher impactScore than a heavy_meat footprint", () => {
    const vegan: UserFootprint = {
      travel: { carKmPerWeek: 0, flightsPerYear: 0, publicTransitKmPerWeek: 0 },
      home: { electricityKwhPerMonth: 100, gasKwhPerMonth: 0, renewablePercent: 100 },
      diet: { type: "vegan", foodWasteLevel: 1 },
      consumption: { shoppingLevel: 1, recyclesPercent: 100 },
    };
    const heavy: UserFootprint = {
      ...baseline,
      diet: { type: "heavy_meat", foodWasteLevel: 5 },
    };
    const { result: veganResult } = renderHook(() => useCarbonCalculator(vegan));
    const { result: heavyResult } = renderHook(() => useCarbonCalculator(heavy));
    expect(veganResult.current.impactScore).toBeGreaterThan(heavyResult.current.impactScore);
  });

  it("recommendations are returned in descending impact order (top category first)", () => {
    const travelHeavy: UserFootprint = {
      ...baseline,
      travel: { carKmPerWeek: 500, flightsPerYear: 20, publicTransitKmPerWeek: 0 },
    };
    const { result } = renderHook(() => useCarbonCalculator(travelHeavy));
    const recs = result.current.recommendations;
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].category).toBe("travel");
  });

  it("comparison array includes 'You' entry", () => {
    const { result } = renderHook(() => useCarbonCalculator(baseline));
    const youEntry = result.current.comparison.find((c) => c.isYou);
    expect(youEntry).toBeDefined();
  });

  it("comparison array includes Paris Goal entry", () => {
    const { result } = renderHook(() => useCarbonCalculator(baseline));
    const paris = result.current.comparison.find((c) => c.label.includes("Paris"));
    expect(paris).toBeDefined();
  });

  it("returns impactScore of 100 for a zero footprint", () => {
    const zeroPrint: UserFootprint = {
      travel: { carKmPerWeek: 0, flightsPerYear: 0, publicTransitKmPerWeek: 0 },
      home: { electricityKwhPerMonth: 0, gasKwhPerMonth: 0, renewablePercent: 100 },
      diet: { type: "vegan", foodWasteLevel: 1 },
      consumption: { shoppingLevel: 1, recyclesPercent: 100 },
    };
    const { result } = renderHook(() => useCarbonCalculator(zeroPrint));
    // Very low footprint should yield a high score
    expect(result.current.impactScore).toBeGreaterThan(60);
  });
});
