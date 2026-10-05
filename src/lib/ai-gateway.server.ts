import { createOpenAI } from "@ai-sdk/openai";

export const GATEWAY = "https://ai.gateway.lovable.dev";

export function requireKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured (missing key).");
  return key;
}

export function textModel(key: string) {
  const lovable = createOpenAI({
    baseURL: `${GATEWAY}/v1`,
    apiKey: key,
    headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  return lovable.responses("openai/gpt-6-astra");
}

export async function gatewayError(res: Response) {
  const body = await res.text();
  let msg = body;
  try {
    const j = JSON.parse(body);
    msg = j?.error?.message ?? j?.message ?? body;
  } catch {}
  if (res.status === 402) return new Error("You're out of AI credits. Add credits to keep creating.");
  if (res.status === 429) return new Error("Lots of requests right now — please try again in a moment.");
  return new Error(`AI request failed (${res.status}): ${String(msg).slice(0, 300)}`);
}
