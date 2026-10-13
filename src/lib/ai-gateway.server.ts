import { createOpenAI } from "@ai-sdk/openai";

/**
 * Provider configuration is supplied by the app owner. The default is the
 * OpenAI API; compatible providers can be selected with AI_API_BASE_URL.
 * Keep keys server-side only (never prefix them with VITE_).
 */
export const GATEWAY = (process.env["AI_API_BASE_URL"] || "https://api.openai.com/v1").replace(/\/+$/, "");

export function requireKey() {
  const key = process.env["AI_API_KEY"];
  if (!key) throw new Error("AI is not configured. Add AI_API_KEY to your server environment.");
  return key;
}

export function textModel(key: string) {
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey: key,
  });
  return provider.responses(process.env["AI_TEXT_MODEL"] || "gpt-4.1-mini");
}

export async function gatewayError(res: Response) {
  const body = await res.text();
  let msg = body;
  try {
    const j = JSON.parse(body);
    msg = j?.error?.message ?? j?.message ?? body;
  } catch {
    // Preserve a short provider message when the response is not JSON.
    msg = body;
  }
  if (res.status === 402) return new Error("The configured AI provider reports insufficient credits.");
  if (res.status === 429) return new Error("The AI provider is busy or rate-limited. Please try again shortly.");
  if (res.status === 401 || res.status === 403) return new Error("The configured AI provider rejected its API key or permissions.");
  return new Error(`AI request failed (${res.status}): ${String(msg).slice(0, 300)}`);
}
