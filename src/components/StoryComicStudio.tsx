import { useEffect, useState } from "react";
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
import { COMIC_PANEL_COUNTS, COMIC_TEMPLATES, DEFAULT_COMIC_TEMPLATE, type ComicTemplateId } from "@/lib/comic-templates";

const PREFERENCES_KEY = "cyliatales.preferences.v1";

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
  const [templateId, setTemplateId] = useState<ComicTemplateId>(DEFAULT_COMIC_TEMPLATE);
  const [panelCount, setPanelCount] = useState<number>(3);
  const [direction, setDirection] = useState<string>(COMIC_TEMPLATES[0].direction);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ index: number; total: number; panel: number } | null>(
    null,
  );
  const page = pages[selected];
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFERENCES_KEY);
      if (!raw) return;
      const prefs = JSON.parse(raw) as { comicTemplate?: string; comicPanelCount?: string };
      const template = COMIC_TEMPLATES.find((item) => item.id === prefs.comicTemplate);
      if (template) {
        setTemplateId(template.id);
        setDirection(template.direction);
      }
      const savedCount = Number(prefs.comicPanelCount);
      if (COMIC_PANEL_COUNTS.includes(savedCount as (typeof COMIC_PANEL_COUNTS)[number])) setPanelCount(savedCount);
    } catch {
      toast.error("The saved comic template could not be loaded; using the cinematic default.");
    }
  }, []);
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
  const activePanels = panels.filter((panel) => panel.panel_number <= panelCount);
  async function buildPanels() {
    if (!user || !page) return;
    setBusy(true);
    const panelNumbersForPage = Array.from({ length: panelCount }, (_, index) => index + 1);
    const completePage = panelNumbersForPage.every((number) => activePanels.some((panel) => panel.panel_number === number));
    const panelNumbers = completePage
      ? panelNumbersForPage
      : panelNumbersForPage.filter((number) => !activePanels.some((panel) => panel.panel_number === number));
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
        const prompt = `${direction} This is panel ${i} of ${panelCount}. Story beat: ${page.text}. Visual direction: ${page.image_prompt ?? ""}. Approved cast: ${castLine}. Art style: ${story.art_style}. Compose a professional comic panel with a clear focal action and readable visual storytelling. No letters, captions, logos or watermark.`;
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
            layout: i === 1 ? "wide" : i === panelCount ? "close" : i % 3 === 0 ? "detail" : "standard",
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
          ? `Comic page ${page.page_number} regenerated with ${panelCount} saved panels`
          : `Comic page ${page.page_number} now has ${panelCount} saved panels`,
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
        <div className="flex flex-wrap gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
            className="rounded-xl border bg-background px-3 py-2 text-sm"
            aria-label="Select story page"
          >
            {pages.map((p, i) => <option key={p.id} value={i}>Page {i + 1}</option>)}
          </select>
          <select
            value={templateId}
            onChange={(e) => {
              const next = COMIC_TEMPLATES.find((item) => item.id === e.target.value);
              if (!next) return;
              setTemplateId(next.id);
              setDirection(next.direction);
              setPanelCount(next.panelCount);
            }}
            className="rounded-xl border bg-background px-3 py-2 text-sm"
            aria-label="Comic page template"
          >
            {COMIC_TEMPLATES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select
            value={panelCount}
            onChange={(e) => setPanelCount(Number(e.target.value))}
            className="rounded-xl border bg-background px-3 py-2 text-sm"
            aria-label="Panels per comic page"
          >
            {COMIC_PANEL_COUNTS.map((count) => <option key={count} value={count}>{count} panels</option>)}
          </select>
        </div>
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
            {activePanels.length >= panelCount
              ? "Regenerate comic page"
              : activePanels.length
                ? `Finish comic page (${activePanels.length}/${panelCount})`
                : "Build comic page"}
          </>
        )}
      </Button>
      {activePanels.length > 0 && (
        <div className="mt-7 grid gap-3 md:grid-cols-2">
          {activePanels.map((panel) => (
            <PanelCard key={panel.id} panel={panel} />
          ))}
        </div>
      )}
      {!activePanels.length && (
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
