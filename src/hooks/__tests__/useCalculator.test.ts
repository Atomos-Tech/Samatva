// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCalculator, STEPS } from "../useCalculator";
import type { UserFootprint } from "@/lib/eco/types";

const initialFootprint: UserFootprint = {
  travel: { carKmPerWeek: 120, flightsPerYear: 2, publicTransitKmPerWeek: 30 },
  home: { electricityKwhPerMonth: 280, gasKwhPerMonth: 220, renewablePercent: 20 },
  diet: { type: "omnivore", foodWasteLevel: 3 },
  consumption: { shoppingLevel: 3, recyclesPercent: 55 },
};

describe("useCalculator", () => {
  it("starts on step 0 (Travel)", () => {
    const { result } = renderHook(() => useCalculator(initialFootprint, vi.fn(), vi.fn()));
    expect(result.current.step).toBe(0);
  });

  it("STEPS constant has exactly 4 entries", () => {
    expect(STEPS.length).toBe(4);
    expect(STEPS[0]).toBe("Travel");
    expect(STEPS[1]).toBe("Home Energy");
    expect(STEPS[2]).toBe("Diet");
    expect(STEPS[3]).toBe("Consumption");
  });

  it("draft is seeded from initialFootprint", () => {
    const { result } = renderHook(() => useCalculator(initialFootprint, vi.fn(), vi.fn()));
    expect(result.current.draft.travel.carKmPerWeek).toBe(120);
    expect(result.current.draft.diet.type).toBe("omnivore");
  });

  it("next() increments the step", () => {
    const { result } = renderHook(() => useCalculator(initialFootprint, vi.fn(), vi.fn()));
    act(() => {
      result.current.next();
    });
    expect(result.current.step).toBe(1);
  });

  it("back() decrements the step but not below 0", () => {
    const { result } = renderHook(() => useCalculator(initialFootprint, vi.fn(), vi.fn()));
    act(() => {
      result.current.back();
    });
    expect(result.current.step).toBe(0); // cannot go below 0
  });

  it("back() from step 2 returns to step 1", () => {
    const { result } = renderHook(() => useCalculator(initialFootprint, vi.fn(), vi.fn()));
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.step).toBe(2);
    act(() => result.current.back());
    expect(result.current.step).toBe(1);
  });

  it("jumpToStep() navigates directly to a step", () => {
    const { result } = renderHook(() => useCalculator(initialFootprint, vi.fn(), vi.fn()));
    act(() => {
      result.current.jumpToStep(3);
    });
    expect(result.current.step).toBe(3);
  });

  it("update() patches the draft correctly", () => {
    const { result } = renderHook(() => useCalculator(initialFootprint, vi.fn(), vi.fn()));
    act(() => {
      result.current.update("travel", { carKmPerWeek: 50 });
    });
    expect(result.current.draft.travel.carKmPerWeek).toBe(50);
    // Other travel fields remain unchanged
    expect(result.current.draft.travel.flightsPerYear).toBe(2);
  });

  it("totalTonnes reflects the live draft footprint", () => {
    const { result } = renderHook(() => useCalculator(initialFootprint, vi.fn(), vi.fn()));
    // The live total should be a positive finite number
    expect(result.current.totalTonnes).toBeGreaterThan(0);
    expect(Number.isFinite(result.current.totalTonnes)).toBe(true);
  });

  it("errors is empty on initial mount", () => {
    const { result } = renderHook(() => useCalculator(initialFootprint, vi.fn(), vi.fn()));
    expect(result.current.errors).toHaveLength(0);
  });

  it("calls onSave and onDone when next() is called on the final step", () => {
    const onSave = vi.fn();
    const onDone = vi.fn();
    const { result } = renderHook(() => useCalculator(initialFootprint, onSave, onDone));
    // Advance to the final step (index 3)
    act(() => result.current.next()); // step 1
    act(() => result.current.next()); // step 2
    act(() => result.current.next()); // step 3
    act(() => result.current.next()); // submit
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("onSave receives a footprint with all required keys", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useCalculator(initialFootprint, onSave, vi.fn()));
    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.next());
    const saved = onSave.mock.calls[0][0];
    expect(saved).toHaveProperty("travel");
    expect(saved).toHaveProperty("home");
    expect(saved).toHaveProperty("diet");
    expect(saved).toHaveProperty("consumption");
  });
});
