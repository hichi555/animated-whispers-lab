import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;
export type StoryJobType =
  "story_plan" | "illustration" | "narration" | "motion" | "poster" | "comic";
export type StoryJobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";

export async function createStoryJob(
  client: Client,
  input: {
    userId: string;
    storyId?: string | null;
    jobType: StoryJobType;
    provider?: string;
    requestPayload?: Json;
  },
) {
  const { data, error } = await client
    .from("story_generation_jobs")
    .insert({
      user_id: input.userId,
      story_id: input.storyId ?? null,
      job_type: input.jobType,
      provider: input.provider ?? "local-gateway",
      request_payload: input.requestPayload ?? {},
      status: "queued",
    })
    .select("id")
    .single();

  if (error || !data) throw error ?? new Error("Could not create the production job.");
  return data.id;
}

export async function updateStoryJob(
  client: Client,
  jobId: string,
  patch: {
    status: StoryJobStatus;
    resultSummary?: Json | null;
    error?: string | null;
    startedAt?: string;
    completedAt?: string;
    attempts?: number;
  },
) {
  const update = {
    status: patch.status,
    ...(patch.resultSummary !== undefined ? { result_summary: patch.resultSummary } : {}),
    ...(patch.error !== undefined ? { error: patch.error } : {}),
    ...(patch.startedAt !== undefined ? { started_at: patch.startedAt } : {}),
    ...(patch.completedAt !== undefined ? { completed_at: patch.completedAt } : {}),
    ...(patch.attempts !== undefined ? { attempts: patch.attempts } : {}),
  };
  const { error } = await client.from("story_generation_jobs").update(update).eq("id", jobId);

  if (error) throw error;
}

export function cloudflareWorkerUrl() {
  return process.env["CLOUDFLARE_STORY_WORKER_URL"]?.replace(/\/$/, "") ?? null;
}

export async function dispatchToCloudflareWorker(input: {
  jobId: string;
  jobType: StoryJobType;
  payload: Json;
}) {
  const url = cloudflareWorkerUrl();
  const token = process.env["CLOUDFLARE_STORY_WORKER_TOKEN"];
  if (!url || !token) return { dispatched: false as const };

  const response = await fetch(`${url}/v1/jobs`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-cyliatales-worker-token": token,
    },
    body: JSON.stringify({
      jobId: input.jobId,
      jobType: input.jobType,
      payload: input.payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`Cloudflare story worker rejected the job (${response.status}).`);
  }

  return { dispatched: true as const };
}
