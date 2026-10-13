# CyliaTales enterprise integrations

This slice establishes a production-safe control plane for story generation.

## Supabase

Apply `supabase/migrations/20261013014500_story_generation_jobs.sql` to the connected project. It creates `story_generation_jobs` with:

- authenticated ownership policies;
- explicit `queued`, `processing`, `completed`, `failed`, and `cancelled` states;
- provider, attempt, timing, request, result, and error metadata;
- indexes for user, story, and operational status queries.

The application writes a job when a story plan starts and updates it on success or failure. The Production Desk shows the latest jobs so no generation is silently detached from the user’s project.

## Cloudflare Worker

`workers/story-orchestrator` is a separate Worker boundary for durable job orchestration. It currently provides:

- `GET /health` for deployment checks;
- authenticated `POST /v1/jobs` job claims;
- Supabase-backed state updates using a service-role secret held only in Worker secrets.

Set the following as Worker secrets or environment bindings; never commit values:

```bash
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put CYLIATALES_WORKER_TOKEN
wrangler secret put SUPABASE_URL
```

Deploy from the Worker directory:

```bash
cd workers/story-orchestrator
npx wrangler deploy
```

When the application server is provisioned with `CLOUDFLARE_STORY_WORKER_URL` and `CLOUDFLARE_STORY_WORKER_TOKEN`, the server adapter can dispatch durable jobs to the Worker boundary. Without those values, CyliaTales stays on its existing local gateway path rather than pretending the Worker is available.

## Current status

The repository contains the integration contract and validation coverage. A live Cloudflare deployment and live Supabase migration application still require authorized provider connectors in the deployment environment. No credential values are stored in this repository.
