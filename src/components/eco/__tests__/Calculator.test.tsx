// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Calculator } from "../Calculator";
import { DEFAULT_STATE } from "@/lib/eco/store";

// Mock the Recharts wrapper or inner components if needed, though Calculator doesn't use Recharts.
vi.mock("lucide-react", () => ({
  ArrowLeft: () => <div data-testid="arrow-left" />,
  ArrowRight: () => <div data-testid="arrow-right" />,
  Check: () => <div data-testid="check" />,
  Car: () => <div data-testid="car" />,
  Home: () => <div data-testid="home" />,
  Utensils: () => <div data-testid="utensils" />,
  ShoppingBag: () => <div data-testid="shopping-bag" />,
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("Calculator Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the first step of the form", () => {
    const state = DEFAULT_STATE;
    render(<Calculator state={state} onSave={vi.fn()} onDone={vi.fn()} />);
    expect(screen.getByText(/Travel footprint/i)).toBeDefined();
  });

  it("navigates through steps and validates on submit", async () => {
    const onSave = vi.fn();
    const onDone = vi.fn();
    const state = DEFAULT_STATE;

    render(<Calculator state={state} onSave={onSave} onDone={onDone} />);

    // Click next 3 times to get to the final step
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]); // To Home Energy
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]); // To Diet
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]); // To Consumption

    // Click submit
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]);

    // It should call onSave with the validated data
    expect(onSave).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalled();
  });
});
