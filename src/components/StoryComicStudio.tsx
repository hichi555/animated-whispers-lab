import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { generateImage } from "@/lib/studio.functions";
import { uploadBase64, useMediaUrl } from "@/lib/media";
import { useAuth } from "@/hooks/use-auth";

type Story = Tables<"stories">;
type Page = Tables<"story_pages">;
type Character = Tables<"characters">;
type Panel = Tables<"story_panels">;
export function StoryComicStudio({
  story,
  pages,
  cast,
}: {
  story: Story;
  pages: Page[];
  cast: Character[];
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const makeImage = useServerFn(generateImage);
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState(
    "Three connected comic panels. Panel 1 establishes the place, panel 2 captures the character’s decision, panel 3 lands the emotional beat. Keep the approved cast and art direction exact. No speech bubbles or text in the image.",
  );
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ index: number; total: number; panel: number } | null>(
    null,
  );
  const page = pages[selected];
  const { data: panels = [] } = useQuery({
    queryKey: ["story-panels", page?.id],
    enabled: Boolean(page),
    queryFn: async () =>
      (
        await supabase
          .from("story_panels")
          .select("*")
          .eq("page_id", page!.id)
          .order("panel_number")
      ).data ?? [],
  });
  async function buildPanels() {
    if (!user || !page) return;
    setBusy(true);
    const completePage = panels.length >= 3;
    const panelNumbers = completePage
      ? [1, 2, 3]
      : [1, 2, 3].filter((number) => !panels.some((panel) => panel.panel_number === number));
    try {
      const refs = cast
        .flatMap((c) => [c.portrait_url, c.reference_url])
        .filter((p): p is string => Boolean(p))
        .slice(0, 6);
      const castLine = cast
        .map(
          (c) =>
            `${c.name}: ${c.appearance ?? "approved appearance"}; ${c.outfit ?? "approved outfit"}`,
        )
        .join(". ");
      for (const [index, i] of panelNumbers.entries()) {
        setProgress({ index: index + 1, total: panelNumbers.length, panel: i });
        const prompt = `${direction} This is panel ${i} of 3. Story beat: ${page.text}. Visual direction: ${page.image_prompt ?? ""}. Approved cast: ${castLine}. Art style: ${story.art_style}. Compose a professional comic panel with a clear focal action and readable visual storytelling. No letters, captions, logos or watermark.`;
        const { b64 } = await makeImage({
          data: { prompt, style: story.art_style, referencePaths: refs },
        });
        const image = await uploadBase64(user.id, "outputs/comics", b64);
        const { error } = await supabase.from("story_panels").upsert(
          {
            story_id: story.id,
            page_id: page.id,
            user_id: user.id,
            panel_number: i,
            layout: i === 1 ? "wide" : i === 2 ? "standard" : "close",
            text: i === 1 ? page.text : "",
            image_prompt: prompt,
            image_url: image,
          },
          { onConflict: "page_id,panel_number" },
        );
        if (error) throw error;
      }
      await qc.invalidateQueries({ queryKey: ["story-panels", page.id] });
      toast.success(
        completePage
          ? `Comic page ${page.page_number} regenerated with three saved panels`
          : `Comic page ${page.page_number} now has three saved panels`,
      );
    } catch (error) {
      await qc.invalidateQueries({ queryKey: ["story-panels", page.id] });
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }
  return (
    <section className="mt-8 rounded-3xl border bg-card p-5 shadow-soft md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <BookOpen className="h-4 w-4" /> Comic / manga desk
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Build the story as panels</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Generate and regenerate one page at a time. The comic uses the same cast lock and art
            direction as the book.
          </p>
        </div>
        <select
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
          className="rounded-xl border bg-background px-3 py-2 text-sm"
          aria-label="Select story page"
        >
          {pages.map((p, i) => (
            <option key={p.id} value={i}>
              Page {i + 1}
            </option>
          ))}
        </select>
      </div>
      <Textarea
        value={direction}
        onChange={(e) => setDirection(e.target.value)}
        className="mt-5 min-h-24"
        aria-label="Comic direction"
      />
      <Button className="mt-3" disabled={busy || !page || !user} onClick={buildPanels}>
        {busy ? (
          <>
            <Loader2 className="animate-spin" />{" "}
            {progress
              ? `Creating panel ${progress.panel} · ${progress.index} of ${progress.total}…`
              : "Preparing comic page…"}
          </>
        ) : (
          <>
            <Sparkles />{" "}
            {panels.length >= 3
              ? "Regenerate comic page"
              : panels.length
                ? `Finish comic page (${panels.length}/3)`
                : "Build comic page"}
          </>
        )}
      </Button>
      {panels.length > 0 && (
        <div className="mt-7 grid gap-3 md:grid-cols-2">
          {panels.map((panel) => (
            <PanelCard key={panel.id} panel={panel} />
          ))}
        </div>
      )}
      {!panels.length && (
        <p className="mt-5 text-sm text-muted-foreground">
          No panels exist for this page yet. Build the first page to create a real saved comic
          sequence.
        </p>
      )}
    </section>
  );
}
function PanelCard({ panel }: { panel: Panel }) {
  const url = useMediaUrl(panel.image_url);
  const alt = panel.text || panel.image_prompt.slice(0, 180);
  return (
    <figure
      className={`overflow-hidden rounded-xl border-2 border-foreground/15 bg-background shadow-sm ${panel.layout === "wide" ? "md:col-span-2" : ""}`}
    >
      <div
        className={`relative bg-secondary ${panel.layout === "wide" ? "aspect-[2.2/1]" : "aspect-[4/3]"}`}
      >
        {url ? (
          <img src={url} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-md bg-background/90 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground shadow-sm">
          Panel {String(panel.panel_number).padStart(2, "0")}
        </span>
      </div>
      <figcaption className="border-t px-3 py-2.5 text-sm leading-5 text-foreground/80">
        {panel.text || `Scene ${panel.panel_number} · ${panel.layout} frame`}
      </figcaption>
    </figure>
  );
}
