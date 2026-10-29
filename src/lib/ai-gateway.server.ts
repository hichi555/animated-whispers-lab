import { createOpenAI } from "@ai-sdk/openai";

<<<<<<< HEAD
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

export function pollinationsKey() {
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
export type ImageProvider = "openai" | "cloudflare" | "pollinations";

export function imageProviderCandidates(): ImageProvider[] {
  const choice = process.env["AI_IMAGE_PROVIDER"]?.trim().toLowerCase();
  const primaryKey = process.env["AI_API_KEY"]?.trim() || process.env["OPENAI_API_KEY"]?.trim();
  const available: Record<ImageProvider, boolean> = {
    openai: Boolean(primaryKey),
    cloudflare: hasCloudflareAI(),
    pollinations: Boolean(pollinationsKey()),
  };
  const preferred = choice === "openai" || choice === "cloudflare" || choice === "pollinations" ? choice : null;
  const order: ImageProvider[] = preferred ? [preferred, "openai", "cloudflare", "pollinations"] : ["openai", "cloudflare", "pollinations"];
  return [...new Set(order)].filter((provider) => available[provider]);
}
export function imageProviderStatus(): ImageProvider | "none" {
  return imageProviderCandidates()[0] ?? "none";
}
function redactProviderMessage(message: string) {
  let safe = message;
  for (const name of [
    "AI_API_KEY", "OPENAI_API_KEY", "GROQ_API_KEY", "POLLINATIONS_API_KEY", "POLLINATIONS_KEY",
    "CLOUDFLARE_AI_API_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_API_KEY",
  ]) {
    const secret = process.env[name]?.trim();
    if (secret && secret.length >= 8) safe = safe.replaceAll(secret, "[redacted]");
  }
  return safe.replace(/\b(?:sk-|sk_|gsk_|cfut_)[A-Za-z0-9_-]{8,}\b/g, "[redacted]")
    .replace(/\bBearer\s+[A-Za-z0-9._-]{12,}/gi, "Bearer [redacted]");
}

export async function withImageProviderFallback<T>(providers: readonly ImageProvider[], attempt: (provider: ImageProvider) => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (const [index, provider] of providers.entries()) {
    try {
      return await attempt(provider);
    } catch (error) {
      lastError = error;
      if (index < providers.length - 1) console.warn("Illustration provider failed; trying the next configured provider.", { provider });
    }
  }
  const detail = lastError instanceof Error ? redactProviderMessage(lastError.message).slice(0, 220) : "Unknown provider error.";
  throw new Error(`Illustration generation failed across ${providers.length} configured provider(s). ${detail}`);
}

export function imageGateway(provider: ImageProvider | "none" = imageProviderStatus()) {
  if (provider === "none") throw new Error("No illustration provider is configured.");
  if (provider === "cloudflare") {
    return `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId()}/ai/run`;
  }
  return provider === "pollinations" ? "https://gen.pollinations.ai/v1" : GATEWAY;
}

export function requireImageKey(provider: ImageProvider | "none" = imageProviderStatus()) {
  const key = provider === "cloudflare"
    ? cloudflareToken()
    : provider === "pollinations"
      ? pollinationsKey()
      : provider === "openai"
        ? process.env["AI_API_KEY"]?.trim() || process.env["OPENAI_API_KEY"]?.trim()
        : undefined;
  if (!key) throw new Error("No illustration provider is configured. Add a primary AI key, Cloudflare Workers AI credentials, or a Pollinations server-side secret key.");
  return key;
}

export function imageModelName(provider: ImageProvider | "none" = imageProviderStatus()) {
  if (provider === "none") throw new Error("No illustration provider is configured.");
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

export type ImageReference = { bytes: Uint8Array; mime: string; filename: string };

export async function generateImageWithProvider(
  provider: ImageProvider,
  { prompt, portrait = false, references = [] }: { prompt: string; portrait?: boolean; references?: ImageReference[] },
) {
  const key = requireImageKey(provider);
  const api = imageGateway(provider);
  const model = imageModelName(provider);
  const size = portrait ? "1024x1024" : "1536x1024";
  let response: Response;
  if (provider === "cloudflare") {
    if (references.length > 4) throw new Error("Cloudflare accepts up to four character references per image.");
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("width", portrait ? "1024" : "1536");
    form.append("height", "1024");
    if (references.length) {
      const sharp = (await import("sharp")).default;
      for (const [index, image] of references.entries()) {
        const resized = await sharp(Buffer.from(image.bytes)).rotate().resize(510, 510, { fit: "inside", withoutEnlargement: true }).png().toBuffer();
        form.append(`input_image_${index}`, new Blob([new Uint8Array(resized)], { type: "image/png" }), `reference-${index}.png`);
      }
    }
    response = await fetch(`${api}/${model}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
      signal: AbortSignal.timeout(180_000),
    });
    if (!response.ok) throw await gatewayError(response);
    const payload = await response.json() as { result?: { image?: string }; image?: string };
    const b64 = payload.result?.image || payload.image;
    if (!b64) throw new Error("Cloudflare Workers AI returned no illustration.");
    return { b64 };
  }
  if (references.length) {
    const form = new FormData();
    const editModel = provider === "pollinations"
      ? process.env["POLLINATIONS_IMAGE_EDIT_MODEL"]?.trim() || "black-forest-labs/flux.2-klein-4b"
      : model;
    form.append("model", editModel);
    form.append("prompt", prompt);
    form.append("size", size);
    form.append("quality", "high");
    if (provider === "pollinations") form.append("response_format", "b64_json");
    for (const image of references) {
      form.append(provider === "pollinations" ? "image" : "image[]", new Blob([new Uint8Array(image.bytes)], { type: image.mime }), image.filename);
    }
    response = await fetch(`${api}/images/edits`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
      signal: AbortSignal.timeout(180_000),
    });
  } else {
    response = await fetch(`${api}/images/generations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, size, quality: "high", ...(provider === "pollinations" ? { response_format: "b64_json" } : {}) }),
      signal: AbortSignal.timeout(180_000),
    });
  }
  if (!response.ok) throw await gatewayError(response);
  const payload = await response.json() as { data?: { b64_json?: string }[] };
  const b64 = payload.data?.[0]?.b64_json;
  if (!b64) throw new Error(`${provider} returned no illustration data.`);
  return { b64 };
}

function selectedTextProvider(): "openai" | "groq" | "pollinations" | "cloudflare" {
  const choice = process.env["AI_TEXT_PROVIDER"]?.trim().toLowerCase();
  const groqKey = process.env["GROQ_API_KEY"]?.trim();
  const primaryKey = process.env["AI_API_KEY"]?.trim() || process.env["OPENAI_API_KEY"]?.trim();
  if (choice === "groq" && groqKey) return "groq";
  if (choice === "pollinations" && pollinationsKey()) return "pollinations";
  if ((choice === "cloudflare" || choice === "workers-ai") && hasCloudflareAI()) return "cloudflare";
  if (choice === "openai" && primaryKey) return "openai";
  if (primaryKey) return "openai";
  if (hasCloudflareAI()) return "cloudflare";
  if (groqKey) return "groq";
  if (pollinationsKey()) return "pollinations";
  return "openai";
}

export function textProviderStatus() {
  return selectedTextProvider();
}

export function requireTextKey() {
  const provider = selectedTextProvider();
  const key = provider === "groq"
    ? process.env["GROQ_API_KEY"]?.trim()
    : provider === "pollinations"
      ? pollinationsKey()
      : provider === "cloudflare"
        ? cloudflareToken()
        : process.env["AI_API_KEY"]?.trim() || process.env["OPENAI_API_KEY"]?.trim();
  if (!key) throw new Error("No story-writing provider is configured. Add the primary key, Cloudflare account ID plus token, Groq key, or Pollinations secret.");
=======
/**
 * Provider configuration is supplied by the app owner. The default is the
 * OpenAI API; compatible providers can be selected with AI_API_BASE_URL.
 * Keep keys server-side only (never prefix them with VITE_).
 */
export const GATEWAY = (process.env["AI_API_BASE_URL"] || "https://api.openai.com/v1").replace(/\/+$/, "");

export function requireKey() {
  const key = process.env["AI_API_KEY"];
  if (!key) throw new Error("AI is not configured. Add AI_API_KEY to your server environment.");
>>>>>>> origin/independent-cyliatales-auth-visuals
  return key;
}

export function textModel(key: string) {
<<<<<<< HEAD
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
    ? process.env["GROQ_TEXT_MODEL"]?.trim()
    : provider === "pollinations"
      ? process.env["POLLINATIONS_TEXT_MODEL"]?.trim()
      : provider === "cloudflare"
        ? process.env["CLOUDFLARE_AI_TEXT_MODEL"]?.trim()
        : undefined;
  const modelId = providerModel || process.env["AI_TEXT_MODEL"]?.trim() ||
    (provider === "openai" ? process.env["OPENAI_TEXT_MODEL"]?.trim() : undefined) || defaultModel;
  // Workers AI supports Chat Completions for most models; Responses only applies to GPT-OSS.
  return createOpenAI({ baseURL, apiKey: key }).chat(modelId);
=======
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey: key,
  });
  return provider.responses(process.env["AI_TEXT_MODEL"] || "gpt-4.1-mini");
>>>>>>> origin/independent-cyliatales-auth-visuals
}

export async function generatePollinationsSpeech(text: string, voice: string) {
  const key = pollinationsKey();
  if (!key) throw new Error("Pollinations narration is not configured.");
  const response = await fetch("https://gen.pollinations.ai/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env["POLLINATIONS_TTS_MODEL"]?.trim() || "google/gemini-3.8-flash-tts",
      input: text,
      voice,
      response_format: "wav",
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw await gatewayError(response);
  const mime = response.headers.get("content-type")?.split(";")[0] || "audio/wav";
  if (!mime.startsWith("audio/")) throw new Error("Pollinations returned an invalid narration format.");
  const b64 = Buffer.from(await response.arrayBuffer()).toString("base64");
  if (!b64) throw new Error("Pollinations returned an empty narration.");
  return { b64, mime };
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
<<<<<<< HEAD
    // Keep the raw response when the provider returns non-JSON text.
  }
  return new Error(`AI request failed (${res.status}): ${redactProviderMessage(String(msg)).slice(0, 300)}`);
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
