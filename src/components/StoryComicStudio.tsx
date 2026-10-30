import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AudioLines, BookOpen, Check, Loader2, LockKeyhole, RefreshCw, Sparkles, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { generateImage, narrate, narrateWithClonedVoice } from "@/lib/studio.functions";
import { uploadBase64, useMediaUrl } from "@/lib/media";
import { useAuth } from "@/hooks/use-auth";
import { VOICES, voiceEngine } from "@/lib/catalog";
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
  const speak = useServerFn(narrate);
  const speakCustom = useServerFn(narrateWithClonedVoice);
  const [selected, setSelected] = useState(0);
  const [templateId, setTemplateId] = useState<ComicTemplateId>(DEFAULT_COMIC_TEMPLATE);
  const [panelCount, setPanelCount] = useState<number>(3);
  const [direction, setDirection] = useState<string>(COMIC_TEMPLATES[0].direction);
  const [selectedCastIds, setSelectedCastIds] = useState<string[]>([]);
  const [consistencyPreset, setConsistencyPreset] = useState<"identity" | "performance">("identity");
  const [narrationVoice, setNarrationVoice] = useState(() =>
    story.voice_profile_id ? `custom:${story.voice_profile_id}` : `builtin:${VOICES.find((voice) => voice.id === story.voice)?.id ?? VOICES[0].id}`,
  );
  const [narrationScript, setNarrationScript] = useState("");
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [narrationBusy, setNarrationBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ index: number; total: number; panel: number } | null>(
    null,
  );
  const page = pages[selected];
  const castKey = cast.map((character) => character.id).join("|");
  useEffect(() => {
    const ids = castKey ? castKey.split("|") : [];
    setSelectedCastIds((current) => current.length ? current.filter((id) => ids.includes(id)) : ids);
  }, [castKey]);
  useEffect(() => {
    setNarrationScript(page?.narration_script ?? page?.text ?? "");
    const defaultVoice = story.voice_profile_id
      ? `custom:${story.voice_profile_id}`
      : `builtin:${VOICES.find((voice) => voice.id === story.voice)?.id ?? VOICES[0].id}`;
    setNarrationVoice(page?.narration_voice ?? defaultVoice);
    setAudioPreview(null);
  }, [page?.id, page?.narration_script, page?.narration_voice, page?.text, story.voice, story.voice_profile_id]);
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
  const { data: approvedLocks = [] } = useQuery({
    queryKey: ["comic-character-locks", story.id, castKey],
    enabled: Boolean(user && cast.length),
    queryFn: async () => {
      const { data } = await supabase
        .from("character_locks")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "approved")
        .in("character_id", cast.map((character) => character.id))
        .order("version", { ascending: false });
      return data ?? [];
    },
  });
  const { data: voiceProfiles = [] } = useQuery({
    queryKey: ["comic-voice-profiles", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("voice_profiles")
        .select("id,name,provider_voice_id")
        .eq("user_id", user!.id)
        .eq("provider", "elevenlabs")
        .eq("consent_confirmed", true)
        .order("name");
      return data ?? [];
    },
  });
  const locksByCharacter = new Map<string, (typeof approvedLocks)[number]>();
  for (const lock of approvedLocks) {
    if (lock.character_id && !locksByCharacter.has(lock.character_id)) locksByCharacter.set(lock.character_id, lock);
  }
  const activePanels = panels.filter((panel) => panel.panel_number <= panelCount);
  const savedAudioUrl = useMediaUrl(page?.audio_url ?? null);
  async function renderNarration() {
    if (!user || !page) return;
    const text = narrationScript.trim();
    if (!text) { toast.error("Add the words you want the narrator to read."); return; }
    if (text.length > 3000) { toast.error("Keep the narration script under 3,000 characters."); return; }
    setNarrationBusy(true);
    try {
      let result: { b64: string; mime: string };
      if (narrationVoice.startsWith("custom:")) {
        const profile = voiceProfiles.find((item) => `custom:${item.id}` === narrationVoice);
        if (!profile) throw new Error("That consented voice profile is no longer available.");
        result = await speakCustom({ data: { text, voiceId: profile.provider_voice_id } });
      } else {
        const voiceId = narrationVoice.slice("builtin:".length);
        result = await speak({ data: { text, voice: voiceEngine(voiceId), language: story.language } });
      }
      const path = await uploadBase64(user.id, "narration", result.b64, result.mime);
      const { error } = await supabase.from("story_pages")
        .update({ audio_url: path, narration_script: text, narration_voice: narrationVoice })
        .eq("id", page.id);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["pages", story.id] });
      setAudioPreview(`data:${result.mime};base64,${result.b64}`);
      toast.success(`Narration saved for page ${page.page_number}.`);
    } catch (error) {
      toast.error((error as Error).message || "Narration could not be generated.");
    } finally {
      setNarrationBusy(false);
    }
  }
  async function buildPanels() {
    if (!user || !page) return;
    setBusy(true);
    const panelNumbersForPage = Array.from({ length: panelCount }, (_, index) => index + 1);
    const completePage = panelNumbersForPage.every((number) => activePanels.some((panel) => panel.panel_number === number));
    const panelNumbers = completePage
      ? panelNumbersForPage
      : panelNumbersForPage.filter((number) => !activePanels.some((panel) => panel.panel_number === number));
    try {
      const activeCast = cast.filter((character) => selectedCastIds.includes(character.id));
      const selectedLocks = activeCast.map((character) => locksByCharacter.get(character.id)).filter((lock) => lock !== undefined);
      const refs = [
        ...activeCast.map((character) => {
          const lock = locksByCharacter.get(character.id);
          return lock?.reference_paths[0] ?? character.portrait_url ?? character.reference_url;
        }),
        ...activeCast.flatMap((character) => {
          const lock = locksByCharacter.get(character.id);
          return [character.reference_url, character.portrait_url, ...(lock?.reference_paths.slice(1) ?? [])];
        }),
      ].filter((path, index, list): path is string => Boolean(path) && list.indexOf(path) === index).slice(0, 6);
      const castLine = activeCast
        .map(
          (character) => {
            const lock = locksByCharacter.get(character.id);
            return `${character.name}: ${[character.appearance, character.outfit, character.palette && `palette ${character.palette}`, lock?.identity_prompt].filter(Boolean).join("; ") || "approved appearance and outfit"}`;
          },
        )
        .join(". ");
      const negativeConstraints = selectedLocks.map((lock) => lock.negative_prompt).filter(Boolean).join("; ");
      const continuityInstruction = consistencyPreset === "identity"
        ? "Strict identity continuity: preserve the approved face, facial markings, age, body proportions, silhouette, outfit, palette and signature accessories exactly across panels. Only the depicted action may change."
        : "Performance variation: keep each approved face, age, proportions, outfit, palette and signature features recognizable, while allowing expressive pose, gaze, gesture and framing to follow the scene beat.";
      for (const [index, i] of panelNumbers.entries()) {
        setProgress({ index: index + 1, total: panelNumbers.length, panel: i });
        const prompt = `${direction} This is panel ${i} of ${panelCount}. Story beat: ${page.text}. Visual direction: ${page.image_prompt ?? ""}. ${continuityInstruction} ${activeCast.length ? `Character identity anchors: ${castLine}.` : "No recurring cast is selected for this panel."} ${negativeConstraints ? `Never change these locked traits: ${negativeConstraints}.` : ""} Art style: ${story.art_style}. Style direction: ${story.art_direction_prompt ?? "follow the established story look"}. Compose a professional comic panel with a clear focal action and readable visual storytelling. No letters, captions, logos or watermark.`;
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
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border bg-secondary/35 p-4 md:p-5" aria-label="Character continuity controls">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary"><LockKeyhole className="h-4 w-4" /> Continuity board</p>
              <h3 className="mt-2 text-lg font-semibold">Anchor the cast, not the pose</h3>
              <p className="mt-1 text-sm text-muted-foreground">Choose who appears. Approved identity notes and reference images are included in the panel prompt.</p>
            </div>
            <span className="shrink-0 rounded-full border bg-card px-2.5 py-1 text-xs font-medium">{selectedCastIds.length} / {cast.length} selected · {cast.filter((character) => locksByCharacter.has(character.id)).length} locked</span>
          </div>
          {cast.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {cast.map((character) => (
                <CharacterAnchorCard
                  key={character.id}
                  character={character}
                  lock={locksByCharacter.get(character.id)}
                  selected={selectedCastIds.includes(character.id)}
                  onToggle={() => setSelectedCastIds((current) => current.includes(character.id)
                    ? current.filter((id) => id !== character.id)
                    : [...current, character.id])}
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed bg-card/70 p-3 text-sm text-muted-foreground">No saved characters are attached to this story. Add a character to build reusable identity anchors.</p>
          )}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button type="button" aria-pressed={consistencyPreset === "identity"} onClick={() => setConsistencyPreset("identity")} className={`rounded-xl border p-3 text-left transition-colors ${consistencyPreset === "identity" ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "bg-card hover:bg-muted"}`}>
              <span className="flex items-center gap-2 text-sm font-semibold">{consistencyPreset === "identity" && <Check className="h-4 w-4 text-primary" />} Identity lock</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">Hold face, silhouette, outfit and palette steady.</span>
            </button>
            <button type="button" aria-pressed={consistencyPreset === "performance"} onClick={() => setConsistencyPreset("performance")} className={`rounded-xl border p-3 text-left transition-colors ${consistencyPreset === "performance" ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "bg-card hover:bg-muted"}`}>
              <span className="flex items-center gap-2 text-sm font-semibold">{consistencyPreset === "performance" && <Check className="h-4 w-4 text-primary" />} Expressive acting</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">Keep identity while varying pose, gaze and framing.</span>
            </button>
          </div>
        </section>

        <section className="rounded-2xl border bg-[#f7f4ed] p-4 text-[#182a32] md:p-5 dark:bg-card dark:text-card-foreground" aria-label="Comic narration controls">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary"><AudioLines className="h-4 w-4" /> Narration booth</p>
              <h3 className="mt-2 text-lg font-semibold">Direct the read, page by page</h3>
              <p className="mt-1 text-sm text-muted-foreground">Edit a separate narration script without changing the printed page text, then render and listen before sharing.</p>
            </div>
            <Volume2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
          </div>
          <label className="mt-4 block space-y-2 text-sm font-medium">
            <span>Narrator voice</span>
            <select value={narrationVoice} onChange={(event) => setNarrationVoice(event.target.value)} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm" aria-label="Comic narrator voice">
              <optgroup label="CyliaTales storytellers">
                {VOICES.map((voice) => <option key={voice.id} value={`builtin:${voice.id}`}>{voice.id} · {voice.mood}</option>)}
              </optgroup>
              {voiceProfiles.length > 0 && <optgroup label="Consented studio voices">
                {voiceProfiles.map((profile) => <option key={profile.id} value={`custom:${profile.id}`}>{profile.name} · private voice</option>)}
              </optgroup>}
            </select>
            <span className="block text-xs font-normal text-muted-foreground">Uses the selected voice where supported; multilingual fallback voices may vary by provider.</span>
          </label>
          <label className="mt-3 block space-y-2 text-sm font-medium">
            <span>What the narrator reads</span>
            <Textarea value={narrationScript} onChange={(event) => setNarrationScript(event.target.value.slice(0, 3000))} maxLength={3000} rows={4} placeholder="The page text is copied here. Add pronunciation hints or a different spoken line without changing the book." aria-label="Comic narration script" />
            <span className="block text-xs font-normal text-muted-foreground">Script and voice are saved per page, separately from the printed text · {narrationScript.length}/3,000</span>
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" disabled={narrationBusy || busy || !page || !user || !narrationScript.trim()} onClick={renderNarration}>
              {narrationBusy ? <><Loader2 className="animate-spin" /> Rendering narration…</> : <><Volume2 /> Render & listen</>}
            </Button>
            {(audioPreview || savedAudioUrl) && <audio key={page?.id} className="h-10 min-w-[180px] flex-1" controls preload="none" src={audioPreview ?? savedAudioUrl ?? undefined} aria-label={`Page ${page?.page_number ?? ""} narration preview`} />}
          </div>
        </section>
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
function CharacterAnchorCard({
  character,
  lock,
  selected,
  onToggle,
}: {
  character: Character;
  lock: Tables<"character_locks"> | undefined;
  selected: boolean;
  onToggle: () => void;
}) {
  const image = useMediaUrl(character.portrait_url ?? character.reference_url ?? lock?.reference_paths[0] ?? null);
  const referenceCount = [character.portrait_url, character.reference_url, ...(lock?.reference_paths ?? [])].filter(Boolean).length;
  return (
    <button type="button" aria-pressed={selected} onClick={onToggle} className={`flex min-w-0 items-center gap-3 rounded-xl border bg-card p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? "border-primary/60 ring-1 ring-primary/20" : "opacity-70 hover:opacity-100"}`}>
      <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-secondary">
        {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <span className="text-sm font-semibold text-muted-foreground">{character.name.slice(0, 1)}</span>}
        {lock && <span className="absolute bottom-0 right-0 grid h-4 w-4 place-items-center rounded-tl bg-primary text-primary-foreground"><LockKeyhole className="h-2.5 w-2.5" /></span>}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{character.name}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{lock ? `Approved lock · v${lock.version}` : `${referenceCount} visual anchor${referenceCount === 1 ? "" : "s"}`}</span>
      </span>
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${selected ? "border-primary bg-primary text-primary-foreground" : "bg-background text-transparent"}`} aria-hidden="true"><Check className="h-3 w-3" /></span>
    </button>
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
