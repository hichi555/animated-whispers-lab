import { createOpenAI } from "@ai-sdk/openai";

const configuredBase =
  process.env["AI_API_BASE"]?.trim() ||
  process.env["OPENAI_API_BASE"]?.trim() ||
  process.env["OPENAI_BASE_URL"]?.trim();
export const GATEWAY = configuredBase ?? "https://api.openai.com/v1";

export function requireKey() {
  const key = process.env["AI_API_KEY"]?.trim() || process.env["OPENAI_API_KEY"]?.trim();
  if (!key) throw new Error("The primary video provider is not configured.");
  return key;
}

function pollinationsKey() {
  return process.env["POLLINATIONS_API_KEY"]?.trim() || process.env["POLLINATIONS_KEY"]?.trim();
}
function cloudflareAccountId() {
  return process.env["CLOUDFLARE_AI_ACCOUNT_ID"]?.trim() || process.env["CLOUDFLARE_ACCOUNT_ID"]?.trim();
}
function cloudflareToken() {
  return process.env["CLOUDFLARE_AI_API_TOKEN"]?.trim() || process.env["CLOUDFLARE_API_TOKEN"]?.trim() || process.env["CLOUDFLARE_API_KEY"]?.trim();
}
function hasCloudflareAI() {
  return Boolean(cloudflareAccountId() && cloudflareToken());
}
function shouldUsePollinationsImages() {
  return Boolean(pollinationsKey() && !process.env["AI_API_KEY"]?.trim() && !process.env["OPENAI_API_KEY"]?.trim());
}
export function imageGateway() {
  return shouldUsePollinationsImages() ? "https://gen.pollinations.ai/v1" : GATEWAY;
}

export function requireImageKey() {
  const key = process.env["AI_API_KEY"]?.trim() || process.env["OPENAI_API_KEY"]?.trim() || pollinationsKey();
  if (!key) throw new Error("No illustration provider is configured. Add the primary AI key or a Pollinations server-side secret key.");
  return key;
}

export function imageModelName() {
  const defaultModel = shouldUsePollinationsImages()
    ? process.env["POLLINATIONS_IMAGE_MODEL"] ?? "openai/gpt-image-2.5-sunburst"
    : process.env["OPENAI_IMAGE_MODEL"] ?? "openai/gpt-image-2.5-sunburst";
  return process.env["AI_IMAGE_MODEL"] ?? defaultModel;
}

function selectedTextProvider(): "openai" | "groq" | "pollinations" | "cloudflare" {
  const choice = process.env["AI_TEXT_PROVIDER"]?.trim().toLowerCase();
  if (choice === "groq" && process.env["GROQ_API_KEY"]) return "groq";
  if (choice === "pollinations" && pollinationsKey()) return "pollinations";
  if ((choice === "cloudflare" || choice === "workers-ai") && hasCloudflareAI()) return "cloudflare";
  if (choice === "openai" && (process.env["AI_API_KEY"]?.trim() || process.env["OPENAI_API_KEY"]?.trim())) return "openai";
  if (configuredBase || process.env["AI_API_KEY"]?.trim() || process.env["OPENAI_API_KEY"]?.trim()) return "openai";
  if (hasCloudflareAI()) return "cloudflare";
  if (process.env["GROQ_API_KEY"]) return "groq";
  if (pollinationsKey()) return "pollinations";
  return "openai";
}

export function textProviderStatus() {
  return selectedTextProvider();
}

export function requireTextKey() {
  const provider = selectedTextProvider();
  const key = provider === "groq"
    ? process.env["GROQ_API_KEY"]
    : provider === "pollinations"
      ? pollinationsKey()
      : provider === "cloudflare"
        ? cloudflareToken()
        : process.env["AI_API_KEY"]?.trim() || process.env["OPENAI_API_KEY"]?.trim();
  if (!key) throw new Error("No story-writing provider is configured. Add the primary key, Cloudflare account ID plus token, Groq key, or Pollinations secret.");
  return key;
}

export function textModel(key: string) {
  const provider = selectedTextProvider();
  const accountId = cloudflareAccountId();
  const baseURL = provider === "groq"
    ? "https://api.groq.com/openai/v1"
    : provider === "pollinations"
      ? "https://gen.pollinations.ai/v1"
      : provider === "cloudflare"
        ? `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1`
        : GATEWAY;
  const defaultModel = provider === "groq"
    ? "llama-3.3-70b-versatile"
    : provider === "pollinations"
      ? "openai/gpt-5.4-nano"
      : provider === "cloudflare"
        ? "@cf/meta/llama-3.1-8b-instruct"
        : "gpt-5";
  const modelId = process.env["AI_TEXT_MODEL"] ??
    process.env["OPENAI_TEXT_MODEL"] ??
    (provider === "groq" ? process.env["GROQ_TEXT_MODEL"] : undefined) ??
    (provider === "pollinations" ? process.env["POLLINATIONS_TEXT_MODEL"] : undefined) ??
    (provider === "cloudflare" ? process.env["CLOUDFLARE_AI_TEXT_MODEL"] : undefined) ??
    defaultModel;
  // Workers AI supports Chat Completions for most models; Responses only applies to GPT-OSS.
  return createOpenAI({ baseURL, apiKey: key }).chat(modelId);
}

export async function gatewayError(res: Response) {
  const body = await res.text();
  let msg = body;
  try {
    const json = JSON.parse(body);
    msg = json?.error?.message ?? json?.message ?? body;
  } catch {
    // Keep the raw response when the provider returns non-JSON text.
  }
  return new Error(`AI request failed (${res.status}): ${String(msg).slice(0, 300)}`);
}
