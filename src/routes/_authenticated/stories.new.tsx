import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { generateStory } from "@/lib/studio.functions";
import { AGE_RANGES, ART_STYLES, THEMES, TONES, VOICES } from "@/lib/catalog";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { STYLE_ART } from "@/lib/style-art";

export const Route = createFileRoute("/_authenticated/stories/new")({
  head: () => ({ meta: [{ title: "New story — CyliaTales" }, { name: "robots", content: "noindex" }, { name: "description", content: "Choose reader age, cast, art direction and narrator for a new original book." }, { property: "og:title", content: "New story — CyliaTales" }, { property: "og:description", content: "Choose reader age, cast, art direction and narrator for a new original book." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: NewStory,
});

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <Button variant="outline" type="button" onClick={onClick} className={cn("rounded-full border px-3 py-1.5 text-sm transition", on ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary")}>
      {children}
    </Button>
  );
}

function NewStory() {
  const { user } = useAuth();
  const nav = useNavigate();
  const gen = useServerFn(generateStory);
  const [idea, setIdea] = useState("");
  const [age, setAge] = useState<string>(AGE_RANGES[1].id);
  const [theme, setTheme] = useState<string | null>(null);
  const [tone, setTone] = useState<string | null>("Cozy");
  const [style, setStyle] = useState<string>(ART_STYLES[0].id);
  const [voice, setVoice] = useState<string>(VOICES[0].id);
  const [voiceProfileId, setVoiceProfileId] = useState<string | null>(null);
  const [pages, setPages] = useState(8);
  const [cast, setCast] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const { data: chars = [] } = useQuery({
    queryKey: ["characters"],
    queryFn: async () => (await supabase.from("characters").select("*").order("created_at")).data ?? [],
  });
  const { data: customVoices = [] } = useQuery({
    queryKey: ["voice-profiles"],
    queryFn: async () => (await supabase.from("voice_profiles").select("id,name").order("created_at")).data ?? [],
  });

  async function create() {
    if (idea.trim().length < 3) { toast.error("Tell us a little about your story idea."); return; }
    if (!user) return;
    setBusy(true);
    try {
      const picked = chars.filter((c) => cast.includes(c.id));
      const ageInfo = AGE_RANGES.find((a) => a.id === age);
      if (!ageInfo) throw new Error("Choose a reader age.");
      const out = await gen({
        data: {
          idea, ageRange: age, ageGuide: ageInfo.words, theme, tone, artStyle: style, pages,
          characters: picked.map((c) => ({ name: c.name, description: [c.kind, c.age, c.appearance, c.outfit, c.palette && `Fixed colors: ${c.palette}`, c.personality, "Keep these exact visual traits in every page illustration prompt; never change clothing, colors, age or anatomy"].filter(Boolean).join(", ") })),
        },
      });
      const { data: story, error } = await supabase.from("stories").insert({
        user_id: user.id, title: out.title, idea, age_range: age, theme, tone, art_style: style, voice, voice_profile_id: voiceProfileId, character_ids: cast, status: "draft",
      }).select().single();
      if (error) throw error;
      const { error: pe } = await supabase.from("story_pages").insert(
        out.pages.map((p, i) => ({ story_id: story.id, user_id: user.id, page_number: i + 1, text: p.text, image_prompt: p.imagePrompt })),
      );
      if (pe) throw pe;
      toast.success("Your story is ready!");
      nav({ to: "/stories/$id", params: { id: story.id } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="story-form-section"><h2 className="mb-4 text-lg font-semibold">{title}</h2>{children}</section>
  );

  return (
    <div className="max-w-4xl">
      <PageHeader eyebrow="Create" title="New story" subtitle="An original book, shaped around your reader." />
      <div className="space-y-5">
        <section className="story-form-section">
          <h2 className="mb-4 text-lg font-semibold">1. Your idea</h2>
          <Textarea rows={4} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="A shy hedgehog who's afraid of the dark finds a firefly friend…" />
        </section>
        <Section title="2. Reader age">
          <div className="grid gap-2 sm:grid-cols-4">
            {AGE_RANGES.map((a) => (
              <Button variant="outline" key={a.id} onClick={() => setAge(a.id)} className={cn("h-auto whitespace-normal rounded-lg border p-4 text-left flex-col items-start", age === a.id ? "border-primary bg-primary/10" : "hover:bg-secondary")}>
                <p className="font-semibold">{a.id}</p><p className="text-xs text-muted-foreground">{a.label}</p>
              </Button>
            ))}
          </div>
        </Section>
        <Section title="3. Theme & tone">
          <div className="space-y-3">
            {THEMES.map((g) => (
              <div key={g.group}><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.group}</p>
                <div className="flex flex-wrap gap-2">{g.items.map((t) => <Chip key={t} on={theme === t} onClick={() => setTheme(theme === t ? null : t)}>{t}</Chip>)}</div>
              </div>
            ))}
            <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tone</p>
            <div className="flex flex-wrap gap-2">{TONES.map((t) => <Chip key={t} on={tone === t} onClick={() => setTone(t)}>{t}</Chip>)}</div>
          </div>
        </Section>
        <Section title="4. Art style">
          <div className="grid gap-2 sm:grid-cols-3">
            {ART_STYLES.map((s) => (
              <Button variant="outline" key={s.id} aria-pressed={style === s.id} onClick={() => setStyle(s.id)} className={cn("h-auto overflow-hidden whitespace-normal rounded-lg border p-0 text-left flex-col items-stretch gap-0", style === s.id ? "border-primary ring-2 ring-primary/20 bg-primary/10" : "hover:bg-secondary")}>
                {STYLE_ART[s.id] && <img src={STYLE_ART[s.id]} alt={`${s.id} illustration of a lantern-lit forest adventure`} className="aspect-[4/3] w-full object-contain bg-secondary" />}
                <span className="flex flex-col gap-1 p-4"><span className="font-semibold">{s.id}</span><span className="text-xs text-muted-foreground">{s.hint}</span></span>
              </Button>
            ))}
          </div>
        </Section>
        <Section title="5. Cast, narrator & length">
          <div className="flex flex-wrap gap-2">
            {chars.map((c) => <Chip key={c.id} on={cast.includes(c.id)} onClick={() => setCast(cast.includes(c.id) ? cast.filter((x) => x !== c.id) : [...cast, c.id])}>{c.name}</Chip>)}
            {!chars.length && <p className="text-sm text-muted-foreground">No characters yet — we'll invent some.</p>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{VOICES.map((v) => <Chip key={v.id} on={!voiceProfileId && voice === v.id} onClick={() => { setVoice(v.id); setVoiceProfileId(null); }}>{v.id} · {v.mood}</Chip>)}{customVoices.map((v) => <Chip key={v.id} on={voiceProfileId === v.id} onClick={() => { setVoice(v.name); setVoiceProfileId(v.id); }}>{v.name} · Private</Chip>)}</div>
          <div className="mt-4 flex items-center gap-3 text-sm">
            Pages <input type="range" min={4} max={16} value={pages} onChange={(e) => setPages(+e.target.value)} className="accent-primary" /> <b>{pages}</b>
          </div>
        </Section>
        <Button size="lg" className="w-full" disabled={busy} onClick={create}>{busy ? "Writing your story…" : "Write my story"}</Button>
      </div>
    </div>
  );
}
