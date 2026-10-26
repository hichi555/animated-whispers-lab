# CyliaTales AI provider configuration

CyliaTales keeps provider secrets server-side. The browser never receives provider keys, and the repository must not contain a `.env` file or a copied secret.

## Required production secrets

```env
OPENAI_API_KEY=...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_TEXT_MODEL=gpt-5
ELEVENLABS_API_KEY=...
```

`AI_API_KEY`, `AI_API_BASE`, and `AI_TEXT_MODEL` may be used as deployment-specific overrides. `OPENAI_API_BASE` is also accepted for backward compatibility. The gateway resolves the base URL in this order: `AI_API_BASE`, `OPENAI_API_BASE`, `OPENAI_BASE_URL`, then the official OpenAI endpoint.

## What is already installed

The app already includes the official Vercel AI SDK and OpenAI provider adapter:

- `ai`
- `@ai-sdk/openai`
- `@supabase/supabase-js`

ElevenLabs is called through its documented HTTPS API from server-only functions. A separate client SDK is intentionally not needed; this keeps the bundle smaller and prevents provider credentials from entering client code.

## Production pipeline

A new creation project creates a persistent artifact chain:

1. Editorial manuscript and layout
2. PDF / print delivery
3. ElevenLabs audiobook master
4. Page-synced narration tracks
5. Approved illustration-to-motion scenes
6. Final animated video delivery

Projects, artifact states, model selections, safety state and character locks are persisted in Supabase. Each character lock stores an identity prompt, references, negative prompt, style, version, approval state and source character link. The same lock can be attached to multiple projects.

## Provider boundaries

- Text and safety: OpenAI-compatible gateway (`OPENAI_BASE_URL` or `AI_API_BASE`)
- Image generation and edits: OpenAI-compatible image endpoint through the same gateway
- Voice cloning and narration: ElevenLabs server-side API
- Motion: configured video endpoint through the same gateway, with scene references kept in Supabase
- Storage and ownership: Supabase Storage and row-level security

If `ELEVENLABS_API_KEY` is absent, the voice studio reports that ElevenLabs is not connected instead of pretending that a voice feature is available. If the main AI key is absent, server functions fail with a clear configuration error before any job is created.


## Optional story-writing providers

The story-writing stage can use the existing OpenAI-compatible primary gateway, Cloudflare Workers AI, Groq, or Pollinations. Set `AI_TEXT_PROVIDER` to `openai`, `cloudflare`, `groq`, or `pollinations` to select an available text provider; when unset, the app prefers the primary gateway, then Workers AI, Groq, then Pollinations. Configure `CLOUDFLARE_AI_ACCOUNT_ID` with `CLOUDFLARE_AI_API_TOKEN`, or configure `GROQ_API_KEY` or `POLLINATIONS_API_KEY`, only as server-side secrets. Workers AI uses Cloudflare’s OpenAI-compatible Chat Completions endpoint; its REST compatibility does not imply a configured account, key, model entitlement or remaining free allocation. Cloudflare documents a 10,000-Neuron daily free allocation that resets at 00:00 UTC; requests fail when applicable limits are exceeded. The default model is `@cf/meta/llama-3.1-8b-instruct`. Optional model overrides are `GROQ_TEXT_MODEL` and `POLLINATIONS_TEXT_MODEL`. Workers AI and Groq are wired for story text only. Pollinations is wired for story text and illustration through its OpenAI-compatible Images endpoint; reference-based edits depend on model/provider support. Neither is treated as a narration or video provider. The primary OpenAI-compatible key remains required for scene video.

The studio's provider panel reports whether a credential is present, not whether a paid model is entitled or a live request succeeds. Cloudflare Story Worker settings represent the existing job-control integration; they do not configure Workers AI model inference. The app must have an independently deployed Worker and both `CLOUDFLARE_STORY_WORKER_URL` and `CLOUDFLARE_STORY_WORKER_TOKEN` before that control-plane integration can be considered configured.
