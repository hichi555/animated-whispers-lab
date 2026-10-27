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

The story-writing stage can use the existing OpenAI-compatible primary gateway, Cloudflare Workers AI, Groq, or Pollinations. Set `AI_TEXT_PROVIDER` to `openai`, `cloudflare`, `groq`, or `pollinations` to select an available text provider; when unset, the app prefers the primary gateway, then Workers AI, Groq, then Pollinations. Configure `CLOUDFLARE_AI_ACCOUNT_ID` with `CLOUDFLARE_AI_API_TOKEN`, or configure `GROQ_API_KEY` or `POLLINATIONS_API_KEY`, only as server-side secrets. Do not use a `VITE_` prefix for provider tokens; Vite exposes `VITE_` variables to browser code. The defaults are `@cf/openai/gpt-oss-120b` for Workers AI, `openai/gpt-oss-120b` for Groq, and `openai/gpt-5.4-nano` for Pollinations. Provider-specific model variables override the shared `AI_TEXT_MODEL`, and `OPENAI_TEXT_MODEL` applies only to the OpenAI provider. Workers AI uses Cloudflare’s OpenAI-compatible Chat Completions endpoint; endpoint compatibility does not guarantee available account quota. Its default was selected from Cloudflare’s current [GPT-OSS 120B model documentation](https://developers.cloudflare.com/workers-ai/models/gpt-oss-120b/) after the previous Llama 3.1 model returned a deprecation error. Groq’s [current model catalog](https://console.groq.com/docs/models) and [structured-output guide](https://console.groq.com/docs/structured-outputs) support the GPT-OSS 120B default used by the app.

Illustrations use the primary image provider when configured. Otherwise, the app prefers Cloudflare Workers AI, then Pollinations. `AI_IMAGE_PROVIDER` can explicitly select `openai`, `cloudflare`, or `pollinations` when that provider's credentials are available. Cloudflare defaults to `@cf/black-forest-labs/flux-2-klein-4b`, a live-tested text-to-image model. For character continuity, the server securely downloads up to four references, resizes each to 510×510, and sends them as multipart inputs; the [model documentation](https://developers.cloudflare.com/workers-ai/models/flux-2-klein-4b/) documents reference inputs below 512×512. Cloudflare's [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) currently includes 10,000 Neurons per day on the Free plan; further requests fail when the daily limit is exceeded. Pollinations uses its OpenAI-compatible Images endpoint and returns base64 images by default, but image requests require sufficient account/key balance; see its [API documentation](https://gen.pollinations.ai/docs). Neither Cloudflare nor Pollinations is treated as a narration or video provider. The primary OpenAI-compatible key remains required for scene video.

The studio's provider panel reports whether a credential is present, not whether a paid model is entitled or a live request succeeds. Cloudflare Story Worker settings represent the existing job-control integration; they do not configure Workers AI model inference. The app must have an independently deployed Worker and both `CLOUDFLARE_STORY_WORKER_URL` and `CLOUDFLARE_STORY_WORKER_TOKEN` before that control-plane integration can be considered configured.
