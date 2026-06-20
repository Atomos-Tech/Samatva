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

// Mock lucide icons that Dashboard directly references.
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
    adjusted: 4400,
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

  it("renders the hero heading with total tonnes", () => {
    render(<Dashboard state={DEFAULT_STATE} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("4.50 t CO₂e");
  });

  it("renders actions logged count and streak", () => {
    render(<Dashboard state={DEFAULT_STATE} />);
    expect(screen.getByText(/12 actions logged/i)).toBeDefined();
    expect(screen.getByText(/3-day streak/i)).toBeDefined();
  });

  it("renders the impact gauge", () => {
    render(<Dashboard state={DEFAULT_STATE} />);
    expect(screen.getByTestId("impact-gauge")).toBeDefined();
  });

  it("renders the charts panel placeholder", () => {
    render(<Dashboard state={DEFAULT_STATE} />);
    expect(screen.getByTestId("charts-panel-mock")).toBeDefined();
  });

  it("renders the progress summary section", () => {
    render(<Dashboard state={DEFAULT_STATE} />);
    expect(screen.getByTestId("progress-summary-mock")).toBeDefined();
  });

  it("renders metric cards (Daily Tip, Monthly Trend, Eco-Points)", () => {
    render(<Dashboard state={DEFAULT_STATE} />);
    expect(screen.getByText(/Daily Tip/i)).toBeDefined();
    expect(screen.getByText(/Monthly Trend/i)).toBeDefined();
    expect(screen.getByText(/Eco-Points Earned/i)).toBeDefined();
  });

  it("shows the 'Live impact score' label", () => {
    render(<Dashboard state={DEFAULT_STATE} />);
    expect(screen.getByText(/Live impact score/i)).toBeDefined();
  });

  it("renders the Samatva description text in the hero", () => {
    render(<Dashboard state={DEFAULT_STATE} />);
    expect(screen.getByText(/Samatva continuously scores your lifestyle/i)).toBeDefined();
  });
});
