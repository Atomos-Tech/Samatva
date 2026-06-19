/**
 * Mock secure API service layer.
 *
 * In a production EcoTrace deployment these calls would hit an authenticated
 * backend that owns the carbon coefficients and recommendation engine.
 * Coefficients are intentionally kept server-side in real systems so the
 * scoring model can be updated without shipping new client builds.
 *
 * Security posture (mock):
 *  - No API keys live in the client. Authentication is brokered through a
 *    same-origin session cookie (simulated here as a request id).
 *  - The shape of every server response is validated through Zod before
 *    being returned to React. Anything malformed is rejected.
 *  - `localStorage` only persists *non-sensitive* user inputs (their own
 *    lifestyle estimates), never tokens, PII or server secrets.
 */
import { z } from "zod";
import { ECO_ACTIONS } from "./calc";
import type { EcoAction } from "./types";

const requestId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

async function simulatedFetch<T>(payload: T, latency = 180): Promise<T> {
  await new Promise((r) => setTimeout(r, latency));
  return payload;
}

const actionsResponseSchema = z.array(
  z.object({
    id: z.string().min(1).max(64),
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(280),
    category: z.enum(["travel", "home", "diet", "consumption"]),
    points: z.number().int().min(1).max(500),
    co2SavedKg: z.number().min(0).max(100),
    icon: z.string().min(1).max(40),
  }),
);

export async function fetchEcoActions(): Promise<EcoAction[]> {
  const _rid = requestId(); // would be sent as X-Request-Id header
  const raw = await simulatedFetch(ECO_ACTIONS);
  return actionsResponseSchema.parse(raw);
}
