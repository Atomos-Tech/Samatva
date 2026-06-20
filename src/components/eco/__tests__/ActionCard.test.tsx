// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ActionCard } from "../ActionCard";
import type { EcoAction } from "@/lib/eco/types";

const mockAction: EcoAction = {
  id: "meatless",
  title: "Meatless Day",
  description: "Skip all meat & fish for a full day.",
  category: "diet",
  points: 25,
  co2SavedKg: 4.2,
  icon: "Leaf",
};

describe("ActionCard Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the action title", () => {
    render(<ActionCard action={mockAction} isDone={false} onToggle={vi.fn()} />);
    expect(screen.getByText("Meatless Day")).toBeDefined();
  });

  it("renders the action description", () => {
    render(<ActionCard action={mockAction} isDone={false} onToggle={vi.fn()} />);
    expect(screen.getByText(/Skip all meat & fish for a full day\./i)).toBeDefined();
  });

  it("shows the category badge", () => {
    render(<ActionCard action={mockAction} isDone={false} onToggle={vi.fn()} />);
    expect(screen.getByText("diet")).toBeDefined();
  });

  it("shows eco-points reward", () => {
    render(<ActionCard action={mockAction} isDone={false} onToggle={vi.fn()} />);
    expect(screen.getByText("+25 pts")).toBeDefined();
  });

  it("shows CO2e saved amount", () => {
    render(<ActionCard action={mockAction} isDone={false} onToggle={vi.fn()} />);
    expect(screen.getByText(/4.2 kg CO₂e/)).toBeDefined();
  });

  it("shows 'Log action' button when not done", () => {
    render(<ActionCard action={mockAction} isDone={false} onToggle={vi.fn()} />);
    const btn = screen.getByTestId("action-card-toggle-meatless");
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    expect(btn.textContent).toContain("Log action");
  });

  it("shows 'Remove action' button when done", () => {
    render(<ActionCard action={mockAction} isDone={true} onToggle={vi.fn()} />);
    const btn = screen.getByTestId("action-card-toggle-meatless");
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(btn.textContent).toContain("Remove action");
  });

  it("calls onToggle with the action when Log action is clicked", () => {
    const onToggle = vi.fn();
    render(<ActionCard action={mockAction} isDone={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId("action-card-toggle-meatless"));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(mockAction);
  });

  it("calls onToggle with the action when Remove action is clicked", () => {
    const onToggle = vi.fn();
    render(<ActionCard action={mockAction} isDone={true} onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId("action-card-toggle-meatless"));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(mockAction);
  });

  it("has correct aria-label for the toggle button when not done", () => {
    render(<ActionCard action={mockAction} isDone={false} onToggle={vi.fn()} />);
    const btn = screen.getByTestId("action-card-toggle-meatless");
    expect(btn.getAttribute("aria-label")).toBe("Log Meatless Day");
  });

  it("has correct aria-label for the toggle button when done", () => {
    render(<ActionCard action={mockAction} isDone={true} onToggle={vi.fn()} />);
    const btn = screen.getByTestId("action-card-toggle-meatless");
    expect(btn.getAttribute("aria-label")).toBe("Remove Meatless Day");
  });

  it("renders data-testid attribute on the article element", () => {
    render(<ActionCard action={mockAction} isDone={false} onToggle={vi.fn()} />);
    expect(screen.getByTestId("action-card-meatless")).toBeDefined();
  });

  it("gracefully falls back to Leaf icon for an unrecognised icon name", () => {
    const unknownAction: EcoAction = { ...mockAction, id: "unknown", icon: "NotAnIcon" };
    // Should render without throwing
    expect(() =>
      render(<ActionCard action={unknownAction} isDone={false} onToggle={vi.fn()} />),
    ).not.toThrow();
  });
});
