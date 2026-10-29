import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { Output, streamText } from "ai";
import { z } from "zod";

const managedEnvNames = [
  "AI_API_KEY", "AI_API_BASE", "AI_TEXT_PROVIDER", "AI_TEXT_MODEL", "AI_IMAGE_PROVIDER", "AI_IMAGE_MODEL",
  "AI_TTS_MODEL", "OPENAI_API_KEY", "OPENAI_API_BASE", "OPENAI_BASE_URL", "OPENAI_TEXT_MODEL", "OPENAI_IMAGE_MODEL",
  "GROQ_API_KEY", "GROQ_TEXT_MODEL", "CLOUDFLARE_AI_ACCOUNT_ID", "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_AI_API_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_API_KEY", "CLOUDFLARE_AI_TEXT_MODEL",
  "CLOUDFLARE_AI_IMAGE_MODEL", "POLLINATIONS_API_KEY", "POLLINATIONS_KEY", "POLLINATIONS_TEXT_MODEL",
  "POLLINATIONS_IMAGE_MODEL", "POLLINATIONS_IMAGE_EDIT_MODEL", "POLLINATIONS_TTS_MODEL",
];

for (const name of managedEnvNames) delete process.env[name];
const localEnv: Record<string, string> = {};
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
  if (!match) continue;
  let value = match[2] ?? "";
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  } else {
    value = value.replace(/\s+#.*$/, "");
  }
  localEnv[match[1]] = value;
}
for (const name of managedEnvNames) {
  const value = localEnv[name];
  if (value?.trim()) process.env[name] = value.trim();
}

const required = [
  { label: "GROQ_API_KEY", names: ["GROQ_API_KEY"] },
  { label: "Cloudflare account ID", names: ["CLOUDFLARE_AI_ACCOUNT_ID", "CLOUDFLARE_ACCOUNT_ID"] },
  { label: "Cloudflare API token", names: ["CLOUDFLARE_AI_API_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_API_KEY"] },
  { label: "Pollinations API key", names: ["POLLINATIONS_API_KEY", "POLLINATIONS_KEY"] },
];
const missing = required.filter(({ names }) => !names.some((name) => process.env[name])).map(({ label }) => label);
if (missing.length) {
  console.error(`Live smoke test needs these server-side .env variables: ${missing.join(", ")}`);
  process.exit(2);
}

function safeError(error: unknown) {
  let message = error instanceof Error ? error.message : "Unknown provider error.";
  if (error instanceof Error && error.cause instanceof Error && error.cause.message) {
    message += ` (${error.cause.message})`;
  }
  for (const name of managedEnvNames) {
    const secret = process.env[name]?.trim();
    if (secret && /(?:KEY|TOKEN)/.test(name)) message = message.replaceAll(secret, "[redacted]");
  }
  return message
    .replace(/\b(?:sk-|sk_|gsk_|cfut_)[A-Za-z0-9_-]{8,}\b/g, "[redacted]")
    .replace(/\bBearer\s+[A-Za-z0-9._-]{12,}/gi, "Bearer [redacted]")
    .slice(0, 240);
}

const { cloudflareStructuredChat, generateImageWithProvider, generatePollinationsSpeech, requireTextKey, textModel, textProviderStatus } =
  await import("../src/lib/ai-gateway.server.ts");

const storySchema = z.object({
  title: z.string(),
  coverPrompt: z.string(),
  pages: z.array(z.object({ text: z.string(), imagePrompt: z.string() })),
});
const prompt = "Write an original four-page picture book for ages 4–6 about a small fox helping a neighbor after rain. Keep each page to one or two short sentences, and make each illustration prompt concise. Return exactly four connected pages and a satisfying ending.";
const schemaJson = {
  type: "object",
  properties: {
    title: { type: "string" },
    coverPrompt: { type: "string" },
    pages: {
      type: "array",
      items: {
        type: "object",
        properties: { text: { type: "string" }, imagePrompt: { type: "string" } },
        required: ["text", "imagePrompt"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "coverPrompt", "pages"],
  additionalProperties: false,
};

const concurrency = Math.min(4, Math.max(2, Number.parseInt(process.env["LIVE_TEST_CONCURRENCY"] || "3", 10) || 3));
const result: Record<string, unknown> = {
  startedAt: new Date().toISOString(),
  textProvider: textProviderStatus(),
  configuredConcurrency: concurrency,
};
let failed = false;

console.log(`Starting ${concurrency} concurrent structured story generations through ${textProviderStatus()}…`);
const textModelInstance = textModel(requireTextKey());
const loadStarted = performance.now();
const storyRuns = await Promise.allSettled(
  Array.from({ length: concurrency }, async (_, index) => {
    const started = performance.now();
    const response = await streamText({
      model: textModelInstance,
      output: Output.object({ schema: storySchema }),
      prompt: `${prompt}\nRun marker: ${index + 1}. Do not include the marker in the story.`,
      abortSignal: AbortSignal.timeout(120_000),
    });
    const output = storySchema.parse(await response.output);
    if (output.pages.length !== 4) throw new Error(`Expected 4 pages; received ${output.pages.length}.`);
    return { latencyMs: Math.round(performance.now() - started), pageCount: output.pages.length };
  }),
);
const loadWallMs = Math.round(performance.now() - loadStarted);
const storyMetrics = storyRuns.map((entry) => {
  if (entry.status === "fulfilled") return { status: "passed", ...entry.value };
  failed = true;
  return { status: "failed", error: safeError(entry.reason) };
});
result.groqConcurrentStoryGeneration = {
  concurrency,
  requests: storyMetrics,
  successful: storyMetrics.filter((item) => item.status === "passed").length,
  totalWallMs: loadWallMs,
};
console.log("Groq structured generation load pass complete.");

try {
  const started = performance.now();
  const raw = await cloudflareStructuredChat({
    prompt,
    schemaName: "cylia_live_story_smoke",
    maxTokens: 2200,
    responseSchema: schemaJson,
  });
  const output = storySchema.parse(raw);
  if (output.pages.length !== 4) throw new Error(`Expected 4 pages; received ${output.pages.length}.`);
  result.cloudflareStructuredStory = { status: "passed", latencyMs: Math.round(performance.now() - started), pageCount: output.pages.length };
} catch (error) {
  failed = true;
  result.cloudflareStructuredStory = { status: "failed", error: safeError(error) };
}
console.log("Cloudflare structured story check complete.");

for (const provider of ["cloudflare", "pollinations"] as const) {
  try {
    const started = performance.now();
    const image = await generateImageWithProvider(provider, {
      prompt: "A warm, original children's picture-book portrait of a curious red fox beside a glowing lantern, soft gouache, expressive face, simple painted background, no text",
      portrait: true,
    });
    const bytes = Buffer.from(image.b64, "base64").length;
    if (bytes < 1024) throw new Error("Image response was unexpectedly small.");
    result[`${provider}ImageGeneration`] = { status: "passed", latencyMs: Math.round(performance.now() - started), outputBytes: bytes };
  } catch (error) {
    failed = true;
    result[`${provider}ImageGeneration`] = { status: "failed", error: safeError(error) };
  }
  console.log(`${provider} image generation check complete.`);
}

try {
  const started = performance.now();
  const audio = await generatePollinationsSpeech(
    "A little fox found a lantern, and the whole garden glowed like morning.",
    "Kore",
  );
  const bytes = Buffer.from(audio.b64, "base64").length;
  if (!audio.mime.startsWith("audio/") || bytes < 512) throw new Error("Audio response was empty or had an invalid media type.");
  result.pollinationsNarration = { status: "passed", latencyMs: Math.round(performance.now() - started), mime: audio.mime, outputBytes: bytes };
} catch (error) {
  failed = true;
  result.pollinationsNarration = { status: "failed", error: safeError(error) };
}

result.completedAt = new Date().toISOString();
result.status = failed ? "failed" : "passed";
const reportPath = "artifacts/validation/live-ai-smoke.json";
await mkdir("artifacts/validation", { recursive: true });
await writeFile(reportPath, `${JSON.stringify(result, null, 2)}\n`, { flag: "w" });
console.log(JSON.stringify(result, null, 2));
console.log(`Sanitized report: ${reportPath}`);
if (failed) process.exitCode = 1;
