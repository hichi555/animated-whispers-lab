import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const StoryInput = z.object({
  idea: z.string().min(3).max(2000),
  ageRange: z.string(),
  ageGuide: z.string(),
  theme: z.string().nullable(),
  tone: z.string().nullable(),
  artStyle: z.string(),
  pages: z.number().int().min(4).max(16),
  characters: z.array(z.object({ name: z.string(), description: z.string() })),
});

export const generateStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => StoryInput.parse(d))
  .handler(async ({ data }) => {
    const { requireKey, textModel } = await import("./ai-gateway.server");
    const { streamText, Output, NoObjectGeneratedError } = await import("ai");
    const key = requireKey();
    const cast = data.characters.length
      ? data.characters.map((c) => `- ${c.name}: ${c.description}`).join("\n")
      : "Invent a small, memorable cast.";
    const prompt = `Write an original children's picture book.
Idea: ${data.idea}
Reader age: ${data.ageRange} (${data.ageGuide})
Theme: ${data.theme ?? "any"}; Tone: ${data.tone ?? "warm"}
Characters:\n${cast}
Exactly ${data.pages} pages. For each page give the story text and an illustration prompt describing the scene, characters' consistent appearance, setting and mood (no text in image). Art style: ${data.artStyle}.
Keep it safe, positive and age-appropriate with a satisfying ending. Title under 8 words. Also give a cover illustration prompt.`;
    const schema = z.object({
      title: z.string(),
      coverPrompt: z.string(),
      pages: z.array(z.object({ text: z.string(), imagePrompt: z.string() })),
    });
    try {
      const result = streamText({
        model: textModel(key),
        output: Output.object({ schema }),
        prompt,
        providerOptions: {
          openai: { forceReasoning: true, reasoningEffort: "low", store: false, include: ["reasoning.encrypted_content"] },
        },
      });
      const out = await result.output;
      return { ...out, pages: out.pages.slice(0, data.pages) };
    } catch (e) {
      if (NoObjectGeneratedError.isInstance(e)) throw new Error("The story came back incomplete. Please try again.");
      throw e;
    }
  });

export const generateImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      prompt: z.string().min(3).max(4000),
      style: z.string(),
      portrait: z.boolean().optional(),
      referencePaths: z.array(z.string().min(3).max(300)).max(6).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { requireKey, GATEWAY, gatewayError } = await import("./ai-gateway.server");
    const key = requireKey();
    const refs = [...new Set(data.referencePaths ?? [])].filter((p) => p.startsWith(`${context.userId}/`));
    const base = `${data.style} children's book illustration. ${data.prompt}. Rich, cohesive, professional picture-book quality, gentle lighting, no words or letters in the image.${data.portrait ? " Full-body character portrait on a soft plain background." : ""}`;
    const size = data.portrait ? "1024x1024" : "1536x1024";
    let res: Response;
    if (refs.length) {
      const form = new FormData();
      form.append("model", "openai/gpt-image-2.5-sunburst");
      form.append("prompt", `Reference images 1-${refs.length} show the established characters. Keep each character's face, hairstyle, body proportions, outfit and color palette exactly consistent with the references, redrawn in the requested art style. Do not copy the references' backgrounds or poses. Scene: ${base}`);
      form.append("size", size);
      form.append("quality", "high");
      for (const [i, path] of refs.entries()) {
        const { data: blob, error } = await context.supabase.storage.from("media").download(path);
        if (error || !blob) throw new Error("A character reference image could not be loaded.");
        form.append("image[]", new File([blob], `reference-${i}.${blob.type.includes("jpeg") ? "jpg" : blob.type.includes("webp") ? "webp" : "png"}`, { type: blob.type || "image/png" }));
      }
      res = await fetch(`${GATEWAY}/v1/images/edits`, { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: form });
    } else {
      res = await fetch(`${GATEWAY}/v1/images/generations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "openai/gpt-image-2.5-sunburst", prompt: base, size, quality: "high" }),
      });
    }
    if (!res.ok) throw await gatewayError(res);
    const json = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image was returned. Please try again.");
    return { b64 };
  });

const CAMERA_PROMPTS: Record<string, string> = {
  "Locked-off": "Locked-off camera, no camera movement",
  "Slow push-in": "Slow, gentle push-in toward the subject",
  "Gentle pan left": "Gentle, slow pan to the left",
  "Gentle pan right": "Gentle, slow pan to the right",
};

export const startSceneMotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ pageId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireKey, GATEWAY, gatewayError } = await import("./ai-gateway.server");
    const { data: page, error } = await context.supabase.from("story_pages").select("*").eq("id", data.pageId).single();
    if (error || !page) throw new Error("Scene not found.");
    if (!page.image_url) throw new Error("Illustrate this scene before animating it.");
    if (page.motion_status === "processing") throw new Error("This scene is already animating.");
    const { data: blob, error: dlError } = await context.supabase.storage.from("media").download(page.image_url);
    if (dlError || !blob) throw new Error("The scene illustration could not be loaded.");
    const imageB64 = Buffer.from(await blob.arrayBuffer()).toString("base64");
    const duration = Math.min(10, Math.max(3, page.duration_seconds));
    const prompt = `Animate the illustration <FIRST_FRAME> as one shot from a children's picture book. ${page.shot_type} framing. ${CAMERA_PROMPTS[page.camera_motion] ?? page.camera_motion}. ${page.motion_prompt ? `Action: ${page.motion_prompt}.` : `Subtle, natural life: characters breathe and move gently, small environmental motion such as leaves, light or water.`} Keep every character's face, proportions, outfit, colors and the illustrated art style unchanged. In a single continuous shot, no scene cuts. Ends on a calm held frame. Audio: soft gentle ambient sound matching the scene. No music. No dialogue. No captions, no on-screen text.`;
    const res = await fetch(`${GATEWAY}/v1/videos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${requireKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-omni-1.1-flash",
        input: [{ type: "text", text: prompt }, { type: "image", data: imageB64, mime_type: blob.type || "image/png" }],
        response_format: { type: "video", resolution: "1080p", duration: `${duration}s`, aspect_ratio: "16:9" },
      }),
    });
    if (!res.ok) throw await gatewayError(res);
    const job = (await res.json()) as { id?: string };
    if (!job.id) throw new Error("The motion clip could not be started.");
    await context.supabase.from("story_pages").update({ motion_job_id: job.id, motion_status: "processing", motion_error: null }).eq("id", page.id);
    return { status: "processing" };
  });

export const checkSceneMotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ pageId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { requireKey, GATEWAY, gatewayError } = await import("./ai-gateway.server");
    const { data: page, error } = await context.supabase.from("story_pages").select("id, motion_job_id, motion_status").eq("id", data.pageId).single();
    if (error || !page) throw new Error("Scene not found.");
    if (page.motion_status !== "processing" || !page.motion_job_id) return { status: page.motion_status };
    const key = requireKey();
    const res = await fetch(`${GATEWAY}/v1/videos/${page.motion_job_id}`, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) throw await gatewayError(res);
    const job = (await res.json()) as { status: string; progress?: number; error?: { message?: string } };
    if (job.status === "failed") {
      const message = job.error?.message ?? "The motion clip failed.";
      await context.supabase.from("story_pages").update({ motion_status: "failed", motion_error: message }).eq("id", page.id);
      return { status: "failed", error: message };
    }
    if (job.status !== "completed") return { status: "processing", progress: job.progress ?? 0 };
    const content = await fetch(`${GATEWAY}/v1/videos/${page.motion_job_id}/content`, { headers: { Authorization: `Bearer ${key}` } });
    if (!content.ok) throw await gatewayError(content);
    const path = `${context.userId}/motion/${page.id}-${page.motion_job_id}.mp4`;
    const { error: upError } = await context.supabase.storage.from("media").upload(path, await content.arrayBuffer(), { contentType: "video/mp4", upsert: true });
    if (upError) throw new Error("The finished clip could not be saved.");
    await context.supabase.from("story_pages").update({ motion_url: path, motion_status: "completed", motion_job_id: null }).eq("id", page.id);
    return { status: "completed" };
  });

export const narrate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ text: z.string().min(1).max(3000), voice: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { requireKey, GATEWAY, gatewayError } = await import("./ai-gateway.server");
    const key = requireKey();
    const res = await fetch(`${GATEWAY}/v1/audio/speech`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-tts-preview",
        contents: [{ role: "user", parts: [{ text: `Read this aloud as a warm, expressive children's storyteller: ${data.text}` }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: data.voice } } },
        },
        stream_format: "audio",
      }),
    });
    if (!res.ok) throw await gatewayError(res);
    const buf = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return { b64: btoa(bin), mime: res.headers.get("content-type") ?? "audio/wav" };
  });

function elevenLabsKey() {
  const key = process.env["ELEVENLABS_API_KEY"];
  if (!key) throw new Error("ElevenLabs is not connected.");
  return key;
}

async function elevenLabsError(response: Response, action: string) {
  const detail = await response.text();
  console.error(`ElevenLabs ${action} failed [${response.status}]: ${detail}`);
  if (response.status === 401) return new Error("The ElevenLabs connection needs to be renewed.");
  if (response.status === 402) return new Error("The ElevenLabs account has no credits remaining.");
  if (response.status === 429) return new Error("ElevenLabs is busy. Please try again shortly.");
  return new Error(`${action} failed. Please check the recording and try again.`);
}

export const cloneVoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    name: z.string().min(2).max(80),
    audioBase64: z.string().min(100).max(20_000_000),
    mime: z.string().regex(/^audio\//),
    consentConfirmed: z.literal(true),
  }).parse(d))
  .handler(async ({ data }) => {
    const bytes = Buffer.from(data.audioBase64, "base64");
    const extension = data.mime.includes("webm") ? "webm" : data.mime.includes("wav") ? "wav" : "mp3";
    const form = new FormData();
    form.append("name", data.name);
    form.append("description", "CiliaTales consented family or educator narration voice");
    form.append("remove_background_noise", "true");
    form.append("files", new Blob([bytes], { type: data.mime }), `voice-sample.${extension}`);
    const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: { "xi-api-key": elevenLabsKey() },
      body: form,
    });
    if (!response.ok) throw await elevenLabsError(response, "voice creation");
    const result = await response.json() as { voice_id?: string };
    if (!result.voice_id) throw new Error("ElevenLabs did not return a voice.");
    return { voiceId: result.voice_id };
  });

export const narrateWithClonedVoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    text: z.string().min(1).max(5000),
    voiceId: z.string().min(8).max(100),
    previousText: z.string().max(1000).optional(),
    nextText: z.string().max(1000).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: owned } = await context.supabase
      .from("voice_profiles")
      .select("id")
      .eq("provider_voice_id", data.voiceId)
      .eq("user_id", context.userId)
      .eq("consent_confirmed", true)
      .maybeSingle();
    if (!owned) throw new Error("This voice is not available in your studio.");
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(data.voiceId)}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": elevenLabsKey(), "Content-Type": "application/json" },
      body: JSON.stringify({
        text: data.text,
        model_id: "eleven_multilingual_v2",
        previous_text: data.previousText,
        next_text: data.nextText,
        voice_settings: { stability: 0.58, similarity_boost: 0.82, style: 0.32, use_speaker_boost: true, speed: 0.96 },
      }),
    });
    if (!response.ok) throw await elevenLabsError(response, "narration");
    return { b64: Buffer.from(await response.arrayBuffer()).toString("base64"), mime: "audio/mpeg" };
  });

export const deleteClonedVoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ voiceId: z.string().min(8).max(100) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: owned } = await context.supabase
      .from("voice_profiles")
      .select("id")
      .eq("provider_voice_id", data.voiceId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!owned) throw new Error("This voice is not available in your studio.");
    const response = await fetch(`https://api.elevenlabs.io/v1/voices/${encodeURIComponent(data.voiceId)}`, {
      method: "DELETE",
      headers: { "xi-api-key": elevenLabsKey() },
    });
    if (!response.ok && response.status !== 404) throw await elevenLabsError(response, "voice removal");
    return { ok: true };
  });
