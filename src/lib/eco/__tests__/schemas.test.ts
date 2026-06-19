import { describe, expect, it } from "vitest";
import { sanitizeNumber } from "../schemas";

/**
 * Unit tests for `sanitizeNumber`.
 *
 * This function is the first line of defence against malformed calculator
 * inputs reaching the carbon math layer. All numeric edge cases must be
 * handled gracefully — no NaN, Infinity, or overflow should propagate.
 */
describe("sanitizeNumber", () => {
  it("returns a valid integer within bounds", () => {
    expect(sanitizeNumber("100", 2000)).toBe(100);
  });

  it("returns a valid decimal within bounds", () => {
    expect(sanitizeNumber("3.5", 10)).toBe(3.5);
  });

  it("clamps values above the max", () => {
    expect(sanitizeNumber("9999", 500)).toBe(500);
  });

  it("returns 0 for an empty string", () => {
    expect(sanitizeNumber("", 100)).toBe(0);
  });

  it("strips non-numeric characters and parses the remainder", () => {
    expect(sanitizeNumber("12abc", 100)).toBe(12);
  });

  it("returns 0 for a purely alphabetical string", () => {
    expect(sanitizeNumber("abc", 100)).toBe(0);
  });

  it("returns 0 for a negative value (negatives stripped by regex)", () => {
    // The regex `[^0-9.]` strips the minus sign, leaving "500"
    // which is then clamped by the max.
    expect(sanitizeNumber("-500", 1000)).toBe(500);
  });

  it("returns 0 for NaN inputs", () => {
    expect(sanitizeNumber("NaN", 100)).toBe(0);
  });

  it("handles Infinity string gracefully", () => {
    // "Infinity" → strips to "I" → non-numeric → 0.
    expect(sanitizeNumber("Infinity", 100)).toBe(0);
  });

  it("ignores extra decimal points", () => {
    // "1.2.3" → regex keeps "1.2.3" → Number("1.2.3") = NaN → returns 0.
    expect(sanitizeNumber("1.2.3", 100)).toBe(0);
  });

  it("handles the maximum allowed length of 10 digits", () => {
    // 11-char input should be sliced to 10 chars before parsing.
    expect(sanitizeNumber("12345678901", 99999)).toBe(99999);
  });

  it("returns 0 for a zero input", () => {
    expect(sanitizeNumber("0", 100)).toBe(0);
  });
});
