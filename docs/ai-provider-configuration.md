# CyliaTales AI provider configuration

CyliaTales keeps all AI-provider credentials on the server. Never prefix a provider secret with `VITE_`, commit `.env`, or expose provider values in logs or client errors. Use the ignored local `.env` for development and protected environment variables for each deployed environment.

## Supabase and sign-in

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the browser client. Server functions use `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY` where an administrative operation requires it. Google OAuth redirects back to the active CyliaTales origin. `VITE_APP_URL` is optional and is intended only for a local-development handoff to a hosted app; do not pin production OAuth to a localhost URL. Add the exact deployed callback URL to Supabase Auth's allowed redirect URLs.

## Text generation

The studio supports the OpenAI-compatible primary gateway, Cloudflare Workers AI, Groq, and Pollinations. `AI_TEXT_PROVIDER` selects an available provider; without an override, selection prefers the configured primary gateway, then Cloudflare, Groq, and Pollinations. Provider keys are `AI_API_KEY` or `OPENAI_API_KEY`, the Cloudflare account ID plus API token, `GROQ_API_KEY`, and `POLLINATIONS_API_KEY` (or its documented alias). Provider-specific model names take precedence over the shared model override.

Defaults are `@cf/openai/gpt-oss-120b` for Cloudflare, `openai/gpt-oss-120b` for Groq, and `openai/gpt-5.4-nano` for Pollinations. Cloudflare uses its account-scoped OpenAI-compatible chat endpoint for ordinary chat and a server-side strict-JSON REST adapter for the structured story, safety, and classroom-material schemas. Current model compatibility is not a promise of account quota; the dashboard reports credential presence, not a successful live generation.

## Illustrations

`AI_IMAGE_PROVIDER` sets the preferred provider. The app tries each configured provider in order and advances when a request fails. With Cloudflare selected and only the supplied Cloudflare and Pollinations credentials present, the order is Cloudflare Workers AI, then Pollinations. Cloudflare uses `@cf/black-forest-labs/flux-2-klein-4b`; its model accepts up to four private character references, which the server resizes before upload. Pollinations uses the OpenAI-compatible image endpoint. Its edit route sends private references as multipart files using the documented `image` field and defaults to `black-forest-labs/flux.2-klein-4b` for reference edits. Set `POLLINATIONS_IMAGE_MODEL` or `POLLINATIONS_IMAGE_EDIT_MODEL` only when a deployment needs a different model.

A provider is attempted only when its server-side credential is present. A generated image is returned to the authenticated server function and then saved to the user's Supabase Storage path; provider keys never reach browser code. Provider quotas, access policies, and transient upstream errors can still cause a generation to fail.

## Read-aloud narration and voice cloning

Read-aloud narration calls the configured OpenAI-compatible `/audio/speech` endpoint with the `gpt-4o-mini-tts` default and voice instructions. If the primary endpoint is absent or fails, CyliaTales uses Cloudflare Workers AI: Aura-2 for English and MeloTTS for supported non-English selections. Aura-2 maps CyliaTales' named narrators to its supported speaker set; MeloTTS accepts a language code but does not expose the same speaker control, so exact voice identity may vary by language/provider. `CLOUDFLARE_AI_TTS_MODEL` optionally overrides this choice. Pollinations `google/gemini-3.8-flash-tts` is the final fallback, using the selected Gemini narrator voice and WAV output; configure `POLLINATIONS_TTS_MODEL` only when a deployment needs a different speech model. All speech credentials and provider requests stay server-side.

ElevenLabs voice cloning is a separate optional feature. It requires `ELEVENLABS_API_KEY` and explicit creator consent; it is not required for ordinary read-aloud narration. Cloudflare and Pollinations usage remains subject to each account's model availability and allowance.

## Video and durable jobs

Scene-motion generation uses the configured primary video gateway and is independent from image and narration fallback. It requires a primary gateway key and a gateway that supports the configured video endpoint and model. The optional Cloudflare story-job worker uses `CLOUDFLARE_STORY_WORKER_URL` plus `CLOUDFLARE_STORY_WORKER_TOKEN`; those values enable durable orchestration and do not configure Workers AI inference.

## Verification

Run `npm test` for provider-selection, OAuth redirect-safety, bilingual/comic persistence-contract, image-adapter, narration-payload, and secret-boundary checks. Run `npm run validate:production` for typecheck, production lint, and production build. Run `npm run smoke:ai` only when you intend to spend the configured providers' quota: it runs a bounded three-request Groq structured-story concurrency test, one Cloudflare structured story, one Cloudflare image, one Pollinations image, and one Pollinations narration check. It prints only provider names, timings, response sizes, and sanitized errors, then writes `artifacts/validation/live-ai-smoke.json` without generated story text or credentials. Set `LIVE_TEST_CONCURRENCY` to 2–4 to adjust the structured-story concurrency. A server-side credential status is only a configuration signal; live success is still subject to provider access, rate limits, and account allowance.

Official model and API references: [Cloudflare GPT-OSS 120B](https://developers.cloudflare.com/workers-ai/models/gpt-oss-120b/), [Cloudflare FLUX.2 Klein 4B](https://developers.cloudflare.com/workers-ai/models/flux-2-klein-4b/), [Cloudflare Aura-2 TTS](https://developers.cloudflare.com/workers-ai/models/aura-2-en/), [Cloudflare MeloTTS](https://developers.cloudflare.com/workers-ai/models/melotts/), [Cloudflare model-run REST API](https://developers.cloudflare.com/api/resources/ai/methods/run/), [Groq model catalog](https://console.groq.com/docs/models), [Groq structured outputs](https://console.groq.com/docs/structured-outputs), and [Pollinations API documentation](https://gen.pollinations.ai/docs).
