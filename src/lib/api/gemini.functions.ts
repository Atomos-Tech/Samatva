import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type { CategoryBreakdown, UserFootprint } from "@/lib/eco/types";
import { footprintSchema } from "@/lib/eco/schemas";

// Strict schema for the per-category CO₂ breakdown (kg integers).
const breakdownSchema = z.object({
  travel: z.number().int().nonnegative(),
  home: z.number().int().nonnegative(),
  diet: z.number().int().nonnegative(),
  consumption: z.number().int().nonnegative(),
});

/**
 * Sanitize free-text user query before embedding it in an LLM prompt.
 * Strips characters commonly used in prompt injection attacks while
 * preserving natural English questions.
 */
function sanitizeQuery(raw: string): string {
  return raw
    .replace(/[<>{}[\]\\`]/g, "") // strip markup/code characters
    .replace(/\n{3,}/g, "\n\n") // collapse excessive newlines
    .trim()
    .slice(0, 500); // hard length cap
}

function getGeminiClient(): InstanceType<typeof GoogleGenerativeAI> {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error("VITE_GEMINI_API_KEY is not set — AI features are disabled.");
  }
  return new GoogleGenerativeAI(key);
}

/**
 * Sends a user question to Gemini with the user's live footprint breakdown as context.
 *
 * Runs entirely client-side (Firebase Static Hosting has no Node.js server).
 * The API key is a client-accessible VITE_ variable — scope it to your domain
 * in the Google Cloud Console to prevent misuse.
 */
export async function askGemini({
  data,
}: {
  data: {
    query: string;
    footprint: UserFootprint;
    breakdown: CategoryBreakdown;
  };
}): Promise<{ answer: string }> {
  const parsedBreakdown = breakdownSchema.safeParse(data.breakdown);
  const parsedFootprint = footprintSchema.safeParse(data.footprint);
  if (!parsedBreakdown.success || !parsedFootprint.success) {
    return { answer: "Invalid footprint data — please recalculate your footprint." };
  }

  const safeQuery = sanitizeQuery(data.query);

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `You are the Eco Assistant for the Samatva carbon-footprint app.
You have the user's live annual CO2e data (kg):
- Travel: ${data.breakdown.travel}
- Home Energy: ${data.breakdown.home}
- Diet: ${data.breakdown.diet}
- Goods & Shopping: ${data.breakdown.consumption}

User question: "${safeQuery}"

Respond in 1-3 encouraging, specific sentences. Reference the user's exact kg figures where relevant.`;

    const result = await model.generateContent(systemPrompt);
    return { answer: result.response.text() };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Eco Assistant] Gemini error:", msg);
    return {
      answer:
        "I'm having trouble connecting to my AI brain right now. Try focusing on your highest emission category!",
    };
  }
}

/**
 * Generates 3 personalised daily eco-actions based on the user's footprint breakdown.
 * Runs client-side — see note on askGemini above.
 */
export async function generatePersonalizedActions({
  data,
}: {
  data: { breakdown: CategoryBreakdown };
}): Promise<
  {
    id: string;
    title: string;
    description: string;
    category: "travel" | "home" | "diet" | "consumption";
    points: number;
    co2SavedKg: number;
    icon: string;
  }[]
> {
  const parsedBreakdown = breakdownSchema.safeParse(data.breakdown);
  if (!parsedBreakdown.success) return [];

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `You are an AI that generates personalized, daily carbon-reduction actions.
User's annual CO2e breakdown (kg):
- Travel: ${data.breakdown.travel}
- Home Energy: ${data.breakdown.home}
- Diet: ${data.breakdown.diet}
- Goods & Shopping: ${data.breakdown.consumption}

Focus on their highest emission categories. Generate exactly 3 highly specific, creative, and trackable daily actions the user can do TODAY.
Return ONLY a raw JSON array (no markdown, no code fences), where each object has:
- id: string (unique, e.g. "ai-action-1")
- title: string (max 60 chars)
- description: string (max 140 chars)
- category: "travel" | "home" | "diet" | "consumption"
- points: number (integer, 10-50)
- co2SavedKg: number (0.5-10.0)
- icon: string (a valid Lucide icon name, e.g. "Car", "Zap", "Beef", "ShoppingCart")`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });
    return JSON.parse(result.response.text());
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Eco Assistant] Action generation error:", msg);
    return [];
  }
}
