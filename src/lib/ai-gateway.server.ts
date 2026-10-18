import { createOpenAI } from "@ai-sdk/openai";

export const GATEWAY =
  process.env["AI_API_BASE"] ?? process.env["OPENAI_API_BASE"] ?? "https://api.openai.com/v1";
export function requireKey() {
  const key = process.env["AI_API_KEY"] ?? process.env["OPENAI_API_KEY"];
  if (!key) throw new Error("AI is not configured.");
  return key;
}
export function textModel(key: string) {
  return createOpenAI({ baseURL: GATEWAY, apiKey: key }).responses(
    process.env["AI_TEXT_MODEL"] ?? "gpt-4o-mini",
  );
}
export async function gatewayError(res: Response) {
  const body = await res.text();
  let msg = body;
  try {
    const json = JSON.parse(body);
    msg = json?.error?.message ?? json?.message ?? body;
  } catch {}
  return new Error(`AI request failed (${res.status}): ${String(msg).slice(0, 300)}`);
}
