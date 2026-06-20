import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

export const askGemini = createServerFn({ method: "POST" })
  .validator(
    z.object({
      query: z.string().min(1).max(500),
      footprint: footprintSchema,
      breakdown: breakdownSchema,
    }),
  )
  .handler(async ({ data }) => {
    try {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        throw new Error(
          "SERVER MISCONFIGURATION: GEMINI_API_KEY is missing from environment variables.",
        );
      }
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Sanitize user input before embedding it in the prompt.
      const safeQuery = sanitizeQuery(data.query);

      const systemPrompt = `You are the Eco Assistant for the Samatva carbon-footprint app.
You have the user's live annual CO₂e data (kg):
- Travel: ${data.breakdown.travel}
- Home Energy: ${data.breakdown.home}
- Diet: ${data.breakdown.diet}
- Goods & Shopping: ${data.breakdown.consumption}

User question: "${safeQuery}"

Respond in 1–3 encouraging, specific sentences. Reference the user's exact kg figures where relevant.`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      return { answer: response.text() };
    } catch (error) {
      console.error("Gemini Error:", error);
      return {
        answer:
          "I'm having trouble connecting to my AI brain right now. Try focusing on your highest emission category!",
      };
    }
  });

export const generatePersonalizedActions = createServerFn({ method: "POST" })
  .validator(
    z.object({
      breakdown: breakdownSchema,
    }),
  )
  .handler(async ({ data }) => {
    try {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        throw new Error(
          "SERVER MISCONFIGURATION: GEMINI_API_KEY is missing from environment variables.",
        );
      }
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const systemPrompt = `You are an AI that generates personalized, daily carbon-reduction actions.
User's annual CO₂e breakdown (kg):
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
- points: number (integer, 10–50)
- co2SavedKg: number (0.5–10.0)
- icon: string (a valid Lucide icon name, e.g. "Car", "Zap", "Beef", "ShoppingCart")`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      });
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error("Gemini Generate Actions Error:", error);
      return [];
    }
  });
