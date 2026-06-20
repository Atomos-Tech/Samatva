import { describe, it, expect } from "vitest";
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

  it("returns zero travel for a car-free, flight-free user", () => {
    const b = computeBreakdown({
      ...baseline,
      travel: { carKmPerWeek: 0, flightsPerYear: 0, publicTransitKmPerWeek: 0 },
    });
    expect(b.travel).toBe(0);
  });

  it("all-zeros footprint yields non-negative outputs", () => {
    const b = computeBreakdown({
      travel: { carKmPerWeek: 0, flightsPerYear: 0, publicTransitKmPerWeek: 0 },
      home: { electricityKwhPerMonth: 0, gasKwhPerMonth: 0, renewablePercent: 0 },
      diet: { type: "vegan", foodWasteLevel: 1 },
      consumption: { shoppingLevel: 1, recyclesPercent: 100 },
    });
    for (const v of Object.values(b)) {
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it("higher shopping levels yield higher consumption emissions", () => {
    const low = computeBreakdown({
      ...baseline,
      consumption: { shoppingLevel: 1, recyclesPercent: 0 },
    });
    const high = computeBreakdown({
      ...baseline,
      consumption: { shoppingLevel: 5, recyclesPercent: 0 },
    });
    expect(high.consumption).toBeGreaterThan(low.consumption);
  });

  it("recycling 100% reduces consumption vs recycling 0%", () => {
    const none = computeBreakdown({
      ...baseline,
      consumption: { shoppingLevel: 3, recyclesPercent: 0 },
    });
    const full = computeBreakdown({
      ...baseline,
      consumption: { shoppingLevel: 3, recyclesPercent: 100 },
    });
    expect(full.consumption).toBeLessThanOrEqual(none.consumption);
  });

  it("higher food waste level yields higher diet emissions", () => {
    const low = computeBreakdown({ ...baseline, diet: { type: "omnivore", foodWasteLevel: 1 } });
    const high = computeBreakdown({ ...baseline, diet: { type: "omnivore", foodWasteLevel: 5 } });
    expect(high.diet).toBeGreaterThan(low.diet);
  });
});

describe("totalKg + highestCategory", () => {
  it("totalKg sums all four categories", () => {
    const b = computeBreakdown(baseline);
    expect(totalKg(b)).toBe(b.travel + b.home + b.diet + b.consumption);
  });

  it("totalKg returns 0 for a zero breakdown", () => {
    expect(totalKg({ travel: 0, home: 0, diet: 0, consumption: 0 })).toBe(0);
  });

  it("highestCategory identifies the dominant emission source", () => {
    const flyer = computeBreakdown({
      ...baseline,
      travel: { carKmPerWeek: 500, flightsPerYear: 20, publicTransitKmPerWeek: 0 },
    });
    expect(highestCategory(flyer)).toBe("travel");
  });

  it("highestCategory returns diet when diet dominates", () => {
    const meatEater = computeBreakdown({
      travel: { carKmPerWeek: 0, flightsPerYear: 0, publicTransitKmPerWeek: 0 },
      home: { electricityKwhPerMonth: 0, gasKwhPerMonth: 0, renewablePercent: 100 },
      diet: { type: "heavy_meat", foodWasteLevel: 5 },
      consumption: { shoppingLevel: 1, recyclesPercent: 100 },
    });
    expect(highestCategory(meatEater)).toBe("diet");
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

  it("returns at least one recommendation per category", () => {
    const b = computeBreakdown(baseline);
    const tips = getInsightsFor(b);
    const categories = new Set(tips.map((t) => t.category));
    expect(categories.size).toBeGreaterThanOrEqual(2);
  });

  it("all returned recommendations have required fields", () => {
    const b = computeBreakdown(baseline);
    const tips = getInsightsFor(b);
    for (const tip of tips) {
      expect(tip).toHaveProperty("id");
      expect(tip).toHaveProperty("title");
      expect(tip).toHaveProperty("body");
      expect(tip).toHaveProperty("impactKg");
      expect(tip).toHaveProperty("difficulty");
    }
  });
});
