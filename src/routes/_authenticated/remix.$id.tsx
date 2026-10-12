import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { GitBranch, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { generateStory } from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/remix/$id")({
  head: () => ({ meta: [{ title: "Continue story — CyliaTales" }] }),
  component: RemixStory,
});
type Draft = { title: string; coverPrompt: string; pages: { text: string; imagePrompt: string }[] };
function RemixStory() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const generate = useServerFn(generateStory);
  const [direction, setDirection] = useState(
    "Continue this story with a new chapter that begins immediately after the final page. Preserve the approved cast, world rules and emotional tone, but introduce one fresh turning point.",
  );
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const { data: source } = useQuery({
    queryKey: ["source-story", id],
    queryFn: async () => (await supabase.from("stories").select("*").eq("id", id).single()).data,
  });
  const { data: cast = [] } = useQuery({
    queryKey: ["source-cast", source?.character_ids],
    enabled: Boolean(source?.character_ids?.length),
    queryFn: async () =>
      (
        await supabase
          .from("characters")
          .select("name,appearance,outfit,personality")
          .in("id", source?.character_ids ?? [])
      ).data ?? [],
  });
  if (!source) return <p className="text-muted-foreground">Opening story world…</p>;
  async function createPlan() {
    setBusy(true);
    try {
      const out = await generate({
        data: {
          idea: `${source.idea ?? source.title}\n\nBranch direction: ${direction}\n\nOriginal story title: ${source.title}`,
          ageRange: source.age_range,
          ageGuide: `Continue at the same reader level as ${source.age_range}`,
          theme: source.theme,
          tone: source.tone,
          artStyle: source.art_style,
          pages: 8,
          characters: cast.map((c) => ({
            name: c.name,
            description: [c.appearance, c.outfit, c.personality].filter(Boolean).join("; "),
          })),
        },
      });
      setDraft(out);
      toast.success("Branch plan ready for review");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function approve() {
    if (!draft || !user) return;
    setBusy(true);
    try {
      const { data: story, error } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          title: draft.title,
          idea: `${direction}\nSource story: ${source.title}`,
          age_range: source.age_range,
          theme: source.theme,
          tone: source.tone,
          art_style: source.art_style,
          voice: source.voice,
          voice_profile_id: source.voice_profile_id,
          character_ids: source.character_ids,
          status: "draft",
          source_story_id: source.id,
          branch_type: direction.toLowerCase().includes("continue") ? "continuation" : "remix",
        })
        .select("id")
        .single();
      if (error || !story) throw error ?? new Error("Could not save branch");
      const { error: pageError } = await supabase.from("story_pages").insert(
        draft.pages.map((p, i) => ({
          story_id: story.id,
          user_id: user.id,
          page_number: i + 1,
          text: p.text,
          image_prompt: p.imagePrompt,
        })),
      );
      if (pageError) throw pageError;
      toast.success("Your owned story branch is ready");
      await nav({ to: "/stories/$id", params: { id: story.id } });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="max-w-4xl">
      <PageHeader
        eyebrow="World branch"
        title={`Continue “${source.title}”`}
        subtitle="Create an owned branch with the original story’s cast, art direction and world context carried forward. Nothing is produced until you approve the new plan."
      />
      <section className="rounded-3xl border bg-card p-6 shadow-soft md:p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-primary">
            <GitBranch />
          </div>
          <div>
            <h2 className="text-xl font-semibold">What should happen next?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Source: {source.title} · {cast.length} inherited character
              {cast.length === 1 ? "" : "s"} · {source.art_style}
            </p>
          </div>
        </div>
        <Textarea
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          className="mt-6 min-h-32"
        />
        <Button
          className="mt-4"
          onClick={createPlan}
          disabled={busy || direction.trim().length < 20}
        >
          {busy && !draft ? (
            <>
              <Loader2 className="animate-spin" /> Drafting branch…
            </>
          ) : (
            <>
              <Sparkles /> Preview branch plan
            </>
          )}
        </Button>
      </section>
      {draft && (
        <section className="mt-6 overflow-hidden rounded-3xl border bg-card shadow-soft">
          <div className="border-b bg-secondary/40 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Review before production
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{draft.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Inherited from {source.title} · {draft.pages.length} pages
            </p>
          </div>
          <div className="divide-y">
            {draft.pages.map((page, i) => (
              <article key={i} className="p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Page {i + 1}
                </p>
                <p className="mt-2 font-display text-lg leading-relaxed">{page.text}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  <span className="font-semibold text-foreground">Visual direction:</span>{" "}
                  {page.imagePrompt}
                </p>
              </article>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t p-6">
            <p className="text-sm text-muted-foreground">
              This creates a new owned story branch. The source remains unchanged.
            </p>
            <Button onClick={approve} disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="animate-spin" /> Saving branch…
                </>
              ) : (
                "Approve & create branch"
              )}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
