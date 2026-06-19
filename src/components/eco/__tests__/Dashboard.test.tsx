// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Dashboard } from "../Dashboard";
import { DEFAULT_STATE } from "@/lib/eco/store";

// Prevent real Gemini API calls from the WelcomeInsight component.
vi.mock("@/lib/api/gemini.functions", () => ({
  askGemini: vi.fn().mockResolvedValue({ answer: "Mock AI insight for testing." }),
}));

// Stub ProgressSummary to keep the Dashboard test focused on its own assertions.
vi.mock("../ProgressSummary", () => ({
  ProgressSummary: () => <div data-testid="progress-summary-mock">Progress Mock</div>,
}));

// Mock lucide icons that Dashboard.test.tsx directly references.
// Use importOriginal to preserve all other icons (e.g. Loader2, Sparkles used
// by WelcomeInsight, and ProgressSummary's TrendingDown/TrendingUp/Minus).
vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("lucide-react")>();
  return {
    ...actual,
    Flame: () => <div data-testid="icon-flame" />,
    Leaf: () => <div data-testid="icon-leaf" />,
    TrendingDown: () => <div data-testid="icon-trending" />,
  };
});

// Mock the heavy ChartsPanel which is lazily loaded
vi.mock("../charts/ChartsPanel", () => ({
  default: () => <div data-testid="charts-panel-mock">Charts Panel Mock</div>,
}));

// Mock useDashboardMetrics to return deterministic values
vi.mock("@/hooks/useDashboardMetrics", () => ({
  useDashboardMetrics: () => ({
    breakdown: { travel: 100, home: 100, diet: 100, consumption: 100 },
    totalTonnes: 4.5,
    impactScore: 85,
    totalSavings: 12,
    compareData: [],
    trend: -5.2,
    trendHistory: [],
    streak: 3,
  }),
}));

describe("Dashboard Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders correctly with mocked live impact score", () => {
    const state = DEFAULT_STATE;
    render(<Dashboard state={state} />);

    // Verify the heading and total tonnes from our mock
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("4.50 t CO₂e");

    // Verify streak and savings are rendered
    expect(screen.getByText(/12 actions logged/i)).toBeDefined();
    expect(screen.getByText(/3-day streak/i)).toBeDefined();

    // Verify impact gauge and charts mock
    expect(screen.getByTestId("impact-gauge")).toBeDefined();
    expect(screen.getByTestId("charts-panel-mock")).toBeDefined();
  });
});
