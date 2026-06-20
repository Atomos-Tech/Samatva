// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ProgressSummary } from "../ProgressSummary";
import type { AppState } from "@/lib/eco/types";
import { DEFAULT_STATE } from "@/lib/eco/store";

function makeState(overrides: Partial<AppState> = {}): AppState {
  return { ...DEFAULT_STATE, ...overrides };
}

describe("ProgressSummary Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders null when no actions logged and trend is neutral", () => {
    // DEFAULT_STATE has onboarded:false, log:[], no history diff
    const state = makeState({
      log: [],
      points: 0,
      history: [
        { month: "Jan", kg: 800 },
        { month: "Feb", kg: 800 }, // same = neutral
      ],
    });
    const { container } = render(<ProgressSummary state={state} currentKgPerMonth={80} />);
    // neutral + 0 actions = returns null
    expect(container.firstChild).toBeNull();
  });

  it("renders the 'reduced footprint' message when history trends down", () => {
    const state = makeState({
      log: [{ actionId: "bike", date: "2024-01-01" }],
      history: [
        { month: "Jan", kg: 800 },
        { month: "Feb", kg: 640 }, // down
      ],
    });
    render(<ProgressSummary state={state} currentKgPerMonth={80} />);
    expect(screen.getByText(/reduced your footprint/i)).toBeDefined();
  });

  it("renders the 'footprint has risen' message when history trends up", () => {
    const state = makeState({
      log: [{ actionId: "bike", date: "2024-01-01" }],
      history: [
        { month: "Jan", kg: 640 },
        { month: "Feb", kg: 800 }, // up
      ],
    });
    render(<ProgressSummary state={state} currentKgPerMonth={80} />);
    expect(screen.getByText(/footprint has risen/i)).toBeDefined();
  });

  it("renders the 'holding steady' message when trend is neutral but actions exist", () => {
    const state = makeState({
      log: [{ actionId: "bike", date: "2024-01-01" }],
      points: 30,
      history: [
        { month: "Jan", kg: 800 },
        { month: "Feb", kg: 800 },
      ],
    });
    render(<ProgressSummary state={state} currentKgPerMonth={80} />);
    expect(screen.getByText(/holding steady/i)).toBeDefined();
  });

  it("displays the correct monthly average", () => {
    const state = makeState({
      log: [{ actionId: "bike", date: "2024-01-01" }],
      history: [
        { month: "Jan", kg: 800 },
        { month: "Feb", kg: 640 },
      ],
    });
    render(<ProgressSummary state={state} currentKgPerMonth={150} />);
    // The monthly figure is displayed
    expect(screen.getByText("150")).toBeDefined();
  });

  it("renders the progress section heading", () => {
    const state = makeState({
      log: [{ actionId: "bike", date: "2024-01-01" }],
      history: [
        { month: "Jan", kg: 800 },
        { month: "Feb", kg: 640 },
      ],
    });
    render(<ProgressSummary state={state} currentKgPerMonth={80} />);
    expect(screen.getByText(/Your Progress/i)).toBeDefined();
  });
});
