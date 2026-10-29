import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import {
  safeInternalReturnTo,
  resolveOAuthCallbackOrigin,
  shouldHandoffOAuth,
} from "../src/lib/auth-redirect.ts";

const root = resolve(import.meta.dirname, "..");

function read(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("Google OAuth uses the current production origin and blocks unsafe return targets", () => {
  assert.equal(
    resolveOAuthCallbackOrigin("https://stories.example", "https://old.example"),
    "https://stories.example",
  );
  assert.equal(
    resolveOAuthCallbackOrigin("http://localhost:8080", "https://stories.example"),
    "https://stories.example",
  );
  assert.equal(shouldHandoffOAuth("http://localhost:8080", "https://stories.example"), true);
  assert.equal(shouldHandoffOAuth("https://stories.example", "https://stories.example"), false);
  assert.equal(safeInternalReturnTo("/stories/abc?view=reader"), "/stories/abc?view=reader");
  for (const unsafe of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    null,
  ]) {
    assert.equal(safeInternalReturnTo(unsafe), "/studio");
  }
});

test("comic and bilingual formats have persisted schema, ownership policies, and reader controls", () => {
  const migrations = readdirSync(resolve(root, "supabase/migrations"))
    .filter((file) => file.endsWith(".sql"))
    .map((file) => read(`supabase/migrations/${file}`))
    .join("\n");
  assert.match(migrations, /unique\s*\(page_id,\s*panel_number\)/i);
  assert.match(migrations, /auth\.uid\(\)\s*=\s*user_id/i);
  assert.match(migrations, /translation_text\s+text/i);
  assert.match(migrations, /translation_language\s+text/i);
  const panelPermissionMigration = read(
    "supabase/migrations/20261028010000_story_panel_permissions_and_updated_at.sql",
  );
  assert.match(
    panelPermissionMigration,
    /grant\s+select,\s*insert,\s*update,\s*delete\s+on\s+table\s+public\.story_panels\s+to\s+authenticated/i,
  );
  assert.match(panelPermissionMigration, /story_panels_set_updated_at/i);
  const editor = read("src/routes/_authenticated/stories.$id.tsx");
  assert.match(editor, /translation_text:\s*translationText\.trim\(\)\s*\|\|\s*null/);
  assert.match(editor, /translation_language:\s*translationLanguage\.trim\(\)\s*\|\|\s*null/);
  const reader = read("src/components/BookReader.tsx");
  assert.match(reader, /Toggle bilingual side-by-side view/);
  assert.match(reader, /reader-bilingual/);
  const styles = read("src/styles.css");
  assert.match(styles, /\.reader-bilingual\s*\{[^}]*grid-template-columns:\s*1fr\s+1fr/s);
  const comicStudio = read("src/components/StoryComicStudio.tsx");
  assert.match(comicStudio, /Finish comic page/);
  assert.match(comicStudio, /Creating panel/);
});

test("saved language defaults drive bilingual generation and persist on stories and pages", () => {
  const creation = read("src/routes/_authenticated/stories.new.tsx");
  const settings = read("src/routes/_authenticated/settings.tsx");
  const generation = read("src/lib/studio.functions.ts");
  const types = read("src/integrations/supabase/types.ts");
  assert.match(settings, /translationLanguage: string/);
  assert.match(creation, /cyliatales\.preferences\.v1/);
  assert.match(creation, /translationLanguage: bilingual \? translationLanguage : null/);
  assert.match(creation, /translation_text: p\.translationText\.trim\(\) \|\| null/);
  assert.match(creation, /language,/);
  assert.match(generation, /translationLanguage: z\.enum\(STORY_LANGUAGES\)\.nullable\(\)\.default\(null\)/);
  assert.match(generation, /translationText: z\.string\(\)/);
  assert.match(generation, /incomplete/);
  assert.match(types, /language: string/);
});

test("server provider routing prefers Groq for text and Cloudflare then Pollinations for images", async () => {
  const names = [
    "AI_TEXT_PROVIDER",
    "AI_IMAGE_PROVIDER",
    "AI_API_KEY",
    "OPENAI_API_KEY",
    "GROQ_API_KEY",
    "POLLINATIONS_API_KEY",
    "POLLINATIONS_KEY",
    "CLOUDFLARE_AI_ACCOUNT_ID",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_AI_API_TOKEN",
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_API_KEY",
  ];
  const prior = new Map(names.map((name) => [name, process.env[name]]));
  try {
    for (const name of names) delete process.env[name];
    process.env.AI_TEXT_PROVIDER = "groq";
    process.env.AI_IMAGE_PROVIDER = "cloudflare";
    process.env.GROQ_API_KEY = "gsk_test_secret_0123456789";
    process.env.CLOUDFLARE_AI_ACCOUNT_ID = "test-account";
    process.env.CLOUDFLARE_AI_API_TOKEN = "cfut_test_secret_0123456789";
    process.env.POLLINATIONS_API_KEY = "sk_test_secret_0123456789";
    const gateway = await import("../src/lib/ai-gateway.server.ts");
    assert.equal(gateway.textProviderStatus(), "groq");
    assert.equal(gateway.requireTextKey(), "gsk_test_secret_0123456789");
    assert.deepEqual(gateway.imageProviderCandidates(), ["cloudflare", "pollinations"]);
    assert.equal(gateway.imageProviderStatus(), "cloudflare");

    const originalWarn = console.warn;
    console.warn = () => undefined;
    try {
      const visited: string[] = [];
      const result = await gateway.withImageProviderFallback(
        ["cloudflare", "pollinations"],
        async (provider) => {
          visited.push(provider);
          if (provider === "cloudflare")
            throw new Error(`Upstream echoed ${process.env.POLLINATIONS_API_KEY}`);
          return "image-ready";
        },
      );
      assert.equal(result, "image-ready");
      assert.deepEqual(visited, ["cloudflare", "pollinations"]);
      await assert.rejects(
        () =>
          gateway.withImageProviderFallback(["pollinations"], async () => {
            throw new Error(`Upstream echoed ${process.env.POLLINATIONS_API_KEY}`);
          }),
        (error: Error) =>
          !error.message.includes(process.env.POLLINATIONS_API_KEY!) &&
          error.message.includes("[redacted]"),
      );
    } finally {
      console.warn = originalWarn;
    }

    const originalFetch = globalThis.fetch;
    const calls: Array<{ url: string; authorization: string; body: RequestInit["body"] }> = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({
        url: String(input),
        authorization: new Headers(init?.headers).get("authorization") ?? "",
        body: init?.body,
      });
      const payload = String(input).includes("cloudflare.com")
        ? { result: { image: "Y2xvdWRmbGFyZQ==" } }
        : { data: [{ b64_json: "cG9sbGluYXRpb25z" }] };
      return new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json" } });
    }) as typeof fetch;
    try {
      const cloudflare = await gateway.generateImageWithProvider("cloudflare", {
        prompt: "A fox reading beneath a lantern",
        portrait: true,
      });
      assert.equal(cloudflare.b64, "Y2xvdWRmbGFyZQ==");
      assert.match(calls[0].url, /cloudflare\.com\/client\/v4\/accounts\/test-account\/ai\/run\/@cf\/black-forest-labs\/flux-2-klein-4b/);
      assert.equal(calls[0].authorization, "Bearer cfut_test_secret_0123456789");
      assert.equal((calls[0].body as FormData).get("width"), "1024");

      const pollinations = await gateway.generateImageWithProvider("pollinations", {
        prompt: "A fox reading beneath a lantern",
        portrait: true,
      });
      assert.equal(pollinations.b64, "cG9sbGluYXRpb25z");
      assert.equal(calls[1].url, "https://gen.pollinations.ai/v1/images/generations");
      assert.equal(calls[1].authorization, "Bearer sk_test_secret_0123456789");
      assert.deepEqual(JSON.parse(String(calls[1].body)), {
        model: "openai/gpt-image-2.5-sunburst",
        prompt: "A fox reading beneath a lantern",
        size: "1024x1024",
        quality: "high",
        response_format: "b64_json",
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  } finally {
    for (const [name, value] of prior) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test("Pollinations narration uses authenticated server-side Gemini TTS and returns audio bytes", async () => {
  const names = ["POLLINATIONS_API_KEY", "POLLINATIONS_KEY", "POLLINATIONS_TTS_MODEL"];
  const prior = new Map(names.map((name) => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  try {
    process.env.POLLINATIONS_API_KEY = "sk_test_pollinations_secret_0123456789";
    delete process.env.POLLINATIONS_KEY;
    process.env.POLLINATIONS_TTS_MODEL = "google/gemini-3.8-flash-tts";
    let capturedUrl = "";
    let capturedAuthorization = "";
    let capturedBody: Record<string, unknown> = {};
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedUrl = String(input);
      capturedAuthorization = new Headers(init?.headers).get("authorization") ?? "";
      capturedBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return new Response(new Uint8Array([1, 2, 3, 4]), {
        status: 200,
        headers: { "content-type": "audio/wav" },
      });
    }) as typeof fetch;

    const { generatePollinationsSpeech } = await import("../src/lib/ai-gateway.server.ts");
    const audio = await generatePollinationsSpeech("A little fox finds a lantern.", "Kore");
    assert.equal(capturedUrl, "https://gen.pollinations.ai/v1/audio/speech");
    assert.equal(capturedAuthorization, "Bearer sk_test_pollinations_secret_0123456789");
    assert.deepEqual(capturedBody, {
      model: "google/gemini-3.8-flash-tts",
      input: "A little fox finds a lantern.",
      voice: "Kore",
      response_format: "wav",
    });
    assert.equal(audio.mime, "audio/wav");
    assert.equal(Buffer.from(audio.b64, "base64").length, 4);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of prior) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test("provider credentials are not configured through VITE-prefixed application source", () => {
  const gateway = read("src/lib/ai-gateway.server.ts");
  const studio = read("src/lib/studio.functions.ts");
  const create = read("src/routes/_authenticated/create.tsx");
  for (const source of [gateway, studio, create]) {
    assert.doesNotMatch(source, /VITE_(?:GROQ|POLLINATIONS|CLOUDFLARE).*?(?:KEY|TOKEN)/);
  }
});
