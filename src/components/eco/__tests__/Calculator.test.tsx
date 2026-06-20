// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Calculator } from "../Calculator";
import { DEFAULT_STATE } from "@/lib/eco/store";

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

  it("renders step 1 of 4 heading on initial mount", () => {
    render(<Calculator state={DEFAULT_STATE} onSave={vi.fn()} onDone={vi.fn()} />);
    expect(screen.getByText(/Step 1 of 4/i)).toBeDefined();
  });

  it("renders the Travel footprint heading on step 1", () => {
    render(<Calculator state={DEFAULT_STATE} onSave={vi.fn()} onDone={vi.fn()} />);
    expect(screen.getByText(/Travel footprint/i)).toBeDefined();
  });

  it("displays the live total CO₂ counter", () => {
    render(<Calculator state={DEFAULT_STATE} onSave={vi.fn()} onDone={vi.fn()} />);
    expect(screen.getByTestId("calculator-live-total")).toBeDefined();
    expect(screen.getByText(/t CO₂e \/ yr/i)).toBeDefined();
  });

  it("navigates to Home Energy step when Next is clicked", () => {
    render(<Calculator state={DEFAULT_STATE} onSave={vi.fn()} onDone={vi.fn()} />);
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]);
    expect(screen.getByText(/Home Energy footprint/i)).toBeDefined();
    expect(screen.getByText(/Step 2 of 4/i)).toBeDefined();
  });

  it("Back button is disabled on step 1", () => {
    render(<Calculator state={DEFAULT_STATE} onSave={vi.fn()} onDone={vi.fn()} />);
    const backBtn = screen.getByRole("button", { name: /back/i });
    expect(backBtn).toHaveProperty("disabled", true);
  });

  it("navigates back from step 2 to step 1", () => {
    render(<Calculator state={DEFAULT_STATE} onSave={vi.fn()} onDone={vi.fn()} />);
    // Go to step 2
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]);
    expect(screen.getByText(/Home Energy footprint/i)).toBeDefined();
    // Go back
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText(/Travel footprint/i)).toBeDefined();
  });

  it("shows diet type selection buttons on step 3", () => {
    render(<Calculator state={DEFAULT_STATE} onSave={vi.fn()} onDone={vi.fn()} />);
    // Navigate to step 3 (diet)
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]); // to Home
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]); // to Diet
    expect(screen.getByTestId("diet-vegan")).toBeDefined();
    expect(screen.getByTestId("diet-omnivore")).toBeDefined();
    expect(screen.getByTestId("diet-heavy_meat")).toBeDefined();
  });

  it("selecting a diet type updates the radio state", () => {
    render(<Calculator state={DEFAULT_STATE} onSave={vi.fn()} onDone={vi.fn()} />);
    // Navigate to Diet step
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]);
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]);
    const veganBtn = screen.getByTestId("diet-vegan");
    fireEvent.click(veganBtn);
    expect(veganBtn.getAttribute("aria-checked")).toBe("true");
  });

  it("submit button shows 'Save & view dashboard' on the final step", () => {
    render(<Calculator state={DEFAULT_STATE} onSave={vi.fn()} onDone={vi.fn()} />);
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]); // to Home
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]); // to Diet
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]); // to Consumption
    expect(screen.getByText(/Save & view dashboard/i)).toBeDefined();
  });

  it("calls onSave and onDone when completing all steps", () => {
    const onSave = vi.fn();
    const onDone = vi.fn();
    render(<Calculator state={DEFAULT_STATE} onSave={onSave} onDone={onDone} />);
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]); // to Home
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]); // to Diet
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]); // to Consumption
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]); // submit
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("onSave receives a valid footprint object with required keys", () => {
    const onSave = vi.fn();
    render(<Calculator state={DEFAULT_STATE} onSave={onSave} onDone={vi.fn()} />);
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]);
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]);
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]);
    fireEvent.click(screen.getAllByTestId("calculator-submit")[0]);
    expect(onSave).toHaveBeenCalled();
    const footprint = onSave.mock.calls[0][0];
    expect(footprint).toHaveProperty("travel");
    expect(footprint).toHaveProperty("home");
    expect(footprint).toHaveProperty("diet");
    expect(footprint).toHaveProperty("consumption");
  });
});
