import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { generateImage } from "@/lib/studio.functions";
import { uploadBase64, useMediaUrl } from "@/lib/media";
import { useAuth } from "@/hooks/use-auth";

type Story = Tables<"stories">;
type Character = Tables<"characters">;
type Output = Tables<"story_outputs">;

export function StoryPosterStudio({ story, cast }: { story: Story; cast: Character[] }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const generate = useServerFn(generateImage);
  const [brief, setBrief] = useState(
    `A cinematic story poster for “${story.title}”. Show the central emotional promise of the story, the approved cast, and the world’s visual atmosphere. No words in the image.`,
  );
  const [busy, setBusy] = useState(false);
  const { data: outputs = [] } = useQuery({
    queryKey: ["story-outputs", story.id],
    queryFn: async () =>
      (
        await supabase
          .from("story_outputs")
          .select("*")
          .eq("story_id", story.id)
          .eq("kind", "poster")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  async function createPoster() {
    if (!user) return;
    setBusy(true);
    try {
      const references = cast
        .flatMap((c) => [c.portrait_url, c.reference_url])
        .filter((p): p is string => Boolean(p))
        .slice(0, 6);
      const castLine = cast.length
        ? ` Approved cast: ${cast.map((c) => `${c.name} (${c.appearance ?? "consistent appearance"}; ${c.outfit ?? "signature outfit"})`).join("; ")}.`
        : " Use a coherent original protagonist from the story.";
      const prompt = `${brief} Story premise: ${story.idea ?? story.title}.${castLine} Art direction: ${story.art_style}. Create a polished vertical poster composition with cinematic hierarchy, strong focal silhouette, rich environmental storytelling, professional lighting and clean negative space. Never render typography, logos, watermarks or letters.`;
      const { b64 } = await generate({
        data: { prompt, style: story.art_style, referencePaths: references },
      });
      const asset = await uploadBase64(user.id, "outputs/posters", b64);
      const { error } = await supabase.from("story_outputs").insert({
        story_id: story.id,
        user_id: user.id,
        kind: "poster",
        status: "complete",
        title: `${story.title} — Story Poster`,
        prompt,
        asset_url: asset,
      });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["story-outputs", story.id] });
      toast.success("Story poster created and saved to this world");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="mt-8 rounded-3xl border bg-card p-5 shadow-soft md:p-7"
      aria-labelledby="poster-studio-title"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
          <ImagePlus className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Real output studio
          </p>
          <h2 id="poster-studio-title" className="mt-1 text-2xl font-semibold">
            Make a story poster
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            A saved poster uses this story’s approved art direction and cast references. Each
            generation is a real output you can revisit, not a decorative preview.
          </p>
        </div>
      </div>
      <Textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        className="mt-5 min-h-24"
        aria-label="Poster direction"
      />
      <Button className="mt-3" disabled={busy || brief.trim().length < 10} onClick={createPoster}>
        {busy ? (
          <>
            <Loader2 className="animate-spin" /> Creating poster…
          </>
        ) : (
          <>
            <Sparkles /> Create poster
          </>
        )}
      </Button>
      {outputs.length > 0 && (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {outputs.map((output) => (
            <PosterCard key={output.id} output={output} />
          ))}
        </div>
      )}
    </section>
  );
}

function PosterCard({ output }: { output: Output }) {
  const url = useMediaUrl(output.asset_url);
  return (
    <figure className="overflow-hidden rounded-2xl border bg-background">
      <div className="aspect-[4/5] bg-secondary">
        {url ? (
          <img src={url} alt={output.title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            Loading poster…
          </div>
        )}
      </div>
      <figcaption className="p-3 text-sm font-semibold">{output.title}</figcaption>
    </figure>
  );
}
