import { z } from "zod";

/**
 * Zod schemas — single source of truth for runtime validation.
 *
 * Strict numeric bounds prevent:
 *   - NaN / Infinity propagating into chart axes
 *   - Negative values producing nonsensical totals
 *   - Unbounded inputs from causing layout overflow
 *
 * Strings entered through inputs are coerced and clamped before reaching
 * the calculation layer.
 */

const positiveNumber = (max: number) =>
  z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .finite("Must be a finite number")
    .min(0, "Cannot be negative")
    .max(max, `Cannot exceed ${max.toLocaleString()}`);

const percent = z.coerce.number().finite().min(0).max(100);
const level = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);

export const travelSchema = z.object({
  carKmPerWeek: positiveNumber(2000),
  publicTransitKmPerWeek: positiveNumber(2000),
  flightsPerYear: positiveNumber(50).int("Must be a whole number"),
});

export const homeSchema = z.object({
  electricityKwhPerMonth: positiveNumber(20_000),
  gasKwhPerMonth: positiveNumber(20_000),
  renewablePercent: percent,
});

export const dietSchema = z.object({
  type: z.enum(["vegan", "vegetarian", "pescatarian", "omnivore", "heavy_meat"]),
  foodWasteLevel: level,
});

export const consumptionSchema = z.object({
  shoppingLevel: level,
  recyclesPercent: percent,
});

export const footprintSchema = z.object({
  travel: travelSchema,
  home: homeSchema,
  diet: dietSchema,
  consumption: consumptionSchema,
});

export const actionLogSchema = z.object({
  actionId: z.string().min(1).max(64),
  // Enforce ISO yyyy-mm-dd format to prevent malformed dates from
  // corrupting `computeStreak` which slices date strings by position.
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in yyyy-mm-dd format"),
});

export const historySchema = z.object({
  month: z.string(),
  kg: z.number(),
});

export const appStateSchema = z.object({
  footprint: footprintSchema,
  onboarded: z.boolean(),
  points: z.number(),
  log: z.array(actionLogSchema),
  history: z.array(historySchema),
  planned: z.array(z.string()).optional(),
});

export type FootprintInput = z.infer<typeof footprintSchema>;

/**
 * Sanitises raw text input from the calculator (strips anything that isn't
 * digits/decimal/minus, then coerces to a clamped number).
 */
export function sanitizeNumber(raw: string, max: number): number {
  const cleaned = raw.replace(/[^0-9.]/g, "").slice(0, 10);
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, max);
}
