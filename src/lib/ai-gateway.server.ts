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
function selectedImageProvider(): "openai" | "cloudflare" | "pollinations" {
  const choice = process.env["AI_IMAGE_PROVIDER"]?.trim().toLowerCase();
  const primaryKey = process.env["AI_API_KEY"]?.trim() || process.env["OPENAI_API_KEY"]?.trim();
  if (choice === "cloudflare" && hasCloudflareAI()) return "cloudflare";
  if (choice === "pollinations" && pollinationsKey()) return "pollinations";
  if (choice === "openai" && primaryKey) return "openai";
  if (primaryKey) return "openai";
  if (hasCloudflareAI()) return "cloudflare";
  if (pollinationsKey()) return "pollinations";
  return "openai";
}
export function imageProviderStatus() {
  return selectedImageProvider();
}
export function imageGateway() {
  const provider = selectedImageProvider();
  if (provider === "cloudflare") {
    return `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId()}/ai/run`;
  }
  return provider === "pollinations" ? "https://gen.pollinations.ai/v1" : GATEWAY;
}

export function requireImageKey() {
  const provider = selectedImageProvider();
  const key = provider === "cloudflare"
    ? cloudflareToken()
    : provider === "pollinations"
      ? pollinationsKey()
      : process.env["AI_API_KEY"]?.trim() || process.env["OPENAI_API_KEY"]?.trim();
  if (!key) throw new Error("No illustration provider is configured. Add a primary AI key, Cloudflare Workers AI credentials, or a Pollinations server-side secret key.");
  return key;
}

export function imageModelName() {
  const provider = selectedImageProvider();
  const providerModel = provider === "cloudflare"
    ? process.env["CLOUDFLARE_AI_IMAGE_MODEL"]?.trim()
    : provider === "pollinations"
      ? process.env["POLLINATIONS_IMAGE_MODEL"]?.trim()
      : process.env["OPENAI_IMAGE_MODEL"]?.trim();
  const defaultModel = provider === "cloudflare"
    ? "@cf/black-forest-labs/flux-2-klein-4b"
    : provider === "pollinations"
      ? "openai/gpt-image-2.5-sunburst"
      : "openai/gpt-image-2.5-sunburst";
  return providerModel || process.env["AI_IMAGE_MODEL"]?.trim() || defaultModel;
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
    ? "openai/gpt-oss-120b"
    : provider === "pollinations"
      ? "openai/gpt-5.4-nano"
      : provider === "cloudflare"
        ? "@cf/openai/gpt-oss-120b"
        : "gpt-5";
  const providerModel = provider === "groq"
    ? process.env["GROQ_TEXT_MODEL"]
    : provider === "pollinations"
      ? process.env["POLLINATIONS_TEXT_MODEL"]
      : provider === "cloudflare"
        ? process.env["CLOUDFLARE_AI_TEXT_MODEL"]
        : undefined;
  const modelId = providerModel ?? process.env["AI_TEXT_MODEL"] ??
    (provider === "openai" ? process.env["OPENAI_TEXT_MODEL"] : undefined) ?? defaultModel;
  // Workers AI supports Chat Completions for most models; Responses only applies to GPT-OSS.
  return createOpenAI({ baseURL, apiKey: key }).chat(modelId);
}

export async function gatewayError(res: Response) {
  const body = await res.text();
  let msg = body;
  try {
    const json = JSON.parse(body);
    const providerErrors = Array.isArray(json?.errors)
      ? json.errors.map((item: { message?: string }) => item?.message).filter(Boolean).join("; ")
      : "";
    msg = json?.error?.message || providerErrors || json?.message || body;
  } catch {
    // Keep the raw response when the provider returns non-JSON text.
  }
  return new Error(`AI request failed (${res.status}): ${String(msg).slice(0, 300)}`);
}

export async function cloudflareStructuredChat({
  prompt,
  schemaName,
  responseSchema,
  maxTokens,
}: {
  prompt: string;
  schemaName: string;
  responseSchema: Record<string, unknown>;
  maxTokens: number;
}) {
  const accountId = cloudflareAccountId();
  const key = cloudflareToken();
  if (!accountId || !key) throw new Error("Cloudflare Workers AI is not configured.");

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env["CLOUDFLARE_AI_TEXT_MODEL"]?.trim() || "@cf/openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        response_format: {
          type: "json_schema",
          json_schema: { name: schemaName, strict: true, schema: responseSchema },
        },
      }),
      signal: AbortSignal.timeout(120_000),
    },
  );

  const payload = await response.json().catch(() => null) as {
    choices?: Array<{ message?: { content?: unknown } }>;
    errors?: Array<{ message?: string }>;
    error?: { message?: string };
  } | null;
  if (!response.ok) {
    const detail = payload?.errors?.[0]?.message || payload?.error?.message;
    throw new Error(`Cloudflare Workers AI request failed (${response.status})${detail ? `: ${detail.slice(0, 180)}` : "."}`);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Cloudflare Workers AI returned an empty structured response.");
  }
  try {
    return JSON.parse(content) as unknown;
  } catch {
    throw new Error("Cloudflare Workers AI returned malformed structured output.");
  }
}
