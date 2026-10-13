type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  CYLIATALES_WORKER_TOKEN: string;
};

type JobRequest = {
  jobId?: string;
  jobType?: string;
  payload?: unknown;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

function authorized(request: Request, env: Env) {
  return request.headers.get("x-cyliatales-worker-token") === env.CYLIATALES_WORKER_TOKEN;
}

async function supabasePatch(env: Env, jobId: string, patch: Record<string, unknown>) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/story_generation_jobs?id=eq.${jobId}`, {
    method: "PATCH",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });
  if (!response.ok) throw new Error(`Supabase job update failed (${response.status}).`);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ service: "cyliatales-story-orchestrator", status: "ready", version: "1" });
    }

    if (request.method !== "POST" || url.pathname !== "/v1/jobs") {
      return json({ error: "Not found" }, 404);
    }

    if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);

    let body: JobRequest;
    try {
      body = (await request.json()) as JobRequest;
    } catch {
      return json({ error: "Request body must be JSON" }, 400);
    }

    if (!body.jobId || !body.jobType) {
      return json({ error: "jobId and jobType are required" }, 400);
    }

    // The Worker is intentionally a control-plane boundary: it claims durable jobs,
    // while media/model execution remains a separate provider adapter. This keeps
    // retries idempotent and prevents a provider outage from losing production state.
    try {
      await supabasePatch(env, body.jobId, {
        status: "processing",
        provider: "cloudflare-worker",
        started_at: new Date().toISOString(),
        attempts: 1,
      });
      return json({ accepted: true, jobId: body.jobId, jobType: body.jobType });
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Job claim failed" }, 502);
    }
  },
};
