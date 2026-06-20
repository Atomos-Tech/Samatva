import { describe, it, expect } from "vitest";
import { computeStreak, todayKey } from "../store";
import type { ActionLog } from "../types";

/**
 * Unit tests for `computeStreak` and `todayKey`.
 *
 * The streak algorithm has subtle branching logic:
 *  - Today can be un-logged without breaking the streak (it's still in progress).
 *  - A single gap in the log ends the streak immediately.
 *  - Empty logs should return 0.
 *
 * These tests cover every branch to prevent regressions.
 */

/** Helper: returns an ISO date string for `offset` days from today. */
function dateOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function makeLog(offsets: number[]): ActionLog[] {
  return offsets.map((offset) => ({ actionId: `action-${offset}`, date: dateOffset(offset) }));
}

describe("computeStreak", () => {
  it("returns 0 for an empty log", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("returns 0 when the log has no recent entries", () => {
    // Last entry was 5 days ago with no subsequent days logged.
    const log = makeLog([-5]);
    expect(computeStreak(log)).toBe(0);
  });

  it("returns 1 when only yesterday was logged", () => {
    const log = makeLog([-1]);
    expect(computeStreak(log)).toBe(1);
  });

  it("counts a consecutive streak correctly", () => {
    // Logged yesterday, 2 days ago, 3 days ago = 3-day streak.
    const log = makeLog([-1, -2, -3]);
    expect(computeStreak(log)).toBe(3);
  });

  it("does not break streak if today is not yet logged (today allowed to be missing)", () => {
    // The streak includes yesterday and two days before — today is simply not logged yet.
    const log = makeLog([-1, -2, -3]);
    expect(computeStreak(log)).toBe(3);
  });

  it("includes today when it is logged", () => {
    // Today + yesterday + 2 days ago = 3-day streak.
    const log = makeLog([0, -1, -2]);
    expect(computeStreak(log)).toBe(3);
  });

  it("stops at a gap — does not count days before the break", () => {
    // Logged today + yesterday, then a gap on day -2, then logged day -3.
    const log = makeLog([0, -1, -3]);
    expect(computeStreak(log)).toBe(2);
  });

  it("handles duplicate entries for the same day (multi-action days)", () => {
    // Three entries all on the same day counts as 1 streak day.
    const log = [
      { actionId: "meatless", date: dateOffset(-1) },
      { actionId: "bike", date: dateOffset(-1) },
      { actionId: "unplug", date: dateOffset(-1) },
    ];
    expect(computeStreak(log)).toBe(1);
  });

  it("returns 0 for future-dated log entries", () => {
    // Future logs should not count toward a streak.
    const log = makeLog([2, 3]);
    expect(computeStreak(log)).toBe(0);
  });

  it("handles a very long streak correctly", () => {
    const offsets = Array.from({ length: 30 }, (_, i) => -(i + 1));
    const log = makeLog(offsets);
    expect(computeStreak(log)).toBe(30);
  });
});

describe("todayKey", () => {
  it("returns a string in yyyy-mm-dd format", () => {
    const key = todayKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("matches today's date", () => {
    const key = todayKey();
    const expected = new Date().toISOString().slice(0, 10);
    expect(key).toBe(expected);
  });
});
