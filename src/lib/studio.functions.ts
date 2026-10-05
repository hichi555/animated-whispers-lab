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
    z.object({ prompt: z.string().min(3).max(4000), style: z.string(), portrait: z.boolean().optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { requireKey, GATEWAY, gatewayError } = await import("./ai-gateway.server");
    const key = requireKey();
    const prompt = `${data.style} children's book illustration. ${data.prompt}. Rich, cohesive, professional picture-book quality, gentle lighting, no words or letters in the image.${data.portrait ? " Full-body character portrait on a soft plain background." : ""}`;
    const res = await fetch(`${GATEWAY}/v1/images/generations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-image-2.5-sunburst",
        prompt,
        size: data.portrait ? "1024x1024" : "1536x1024",
        quality: "medium",
      }),
    });
    if (!res.ok) throw await gatewayError(res);
    const json = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image was returned. Please try again.");
    return { b64 };
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
