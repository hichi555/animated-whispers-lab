import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, ImageIcon, Volume2, Trash2, Printer, Clapperboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { generateImage, narrate } from "@/lib/studio.functions";
import { voiceEngine } from "@/lib/catalog";
import { uploadBase64, useMediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { BookReader } from "@/components/BookReader";
import { StoryVideo } from "@/components/StoryVideo";
import { PrintBook } from "@/components/PrintBook";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/stories/$id")({
  head: () => ({ meta: [{ title: "Book editor — CyliaTales" }, { name: "robots", content: "noindex" }, { name: "description", content: "Edit illustrations and story text, save narration and read your book." }, { property: "og:title", content: "Book editor — CyliaTales" }, { property: "og:description", content: "Edit illustrations and story text, save narration and read your book." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Editor,
});

function Editor() {
  const { id } = Route.useParams();
  const [reading, setReading] = useState(false);
  const [view, setView] = useState<"book" | "video">("book");
  const { data: story } = useQuery({
    queryKey: ["story", id],
    queryFn: async () => (await supabase.from("stories").select("*").eq("id", id).single()).data,
  });
  const { data: pages = [] } = useQuery({
    queryKey: ["pages", id],
    queryFn: async () => (await supabase.from("story_pages").select("*").eq("story_id", id).order("page_number")).data ?? [],
  });
  const nav = useNavigate();
  if (!story) return <p className="text-muted-foreground">Opening book…</p>;

  async function remove() {
    if (!confirm("Delete this book?")) return;
    await supabase.from("story_pages").delete().eq("story_id", id);
    await supabase.from("stories").delete().eq("id", id);
    nav({ to: "/stories" });
  }

  return (
    <div className="max-w-5xl">
      <Link to="/stories" className="text-sm text-muted-foreground hover:text-foreground">← My books</Link>
      <div className="mt-2 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">{story.title}</h1>
          <p className="mt-1 text-muted-foreground">Ages {story.age_range} · {story.art_style} · Narrated by {story.voice}</p>
        </div>
        <div className="flex flex-wrap gap-2"><Button disabled={!pages.length} onClick={() => setReading(true)}><BookOpen/> Read book</Button><Button variant="outline" disabled={!pages.length} onClick={() => window.print()}><Printer/> Print / PDF</Button><Button variant="ghost" size="icon" title="Delete book" aria-label="Delete book" onClick={remove}><Trash2 className="h-4 w-4" /></Button></div>
      </div>
      {reading && <BookReader title={story.title} pages={pages} onClose={() => setReading(false)}/>}
      <div className="mb-6 flex gap-2" role="group" aria-label="Editor view"><Button variant={view === "book" ? "default" : "outline"} aria-pressed={view === "book"} onClick={() => setView("book")}><BookOpen/> Book pages</Button><Button variant={view === "video" ? "default" : "outline"} aria-pressed={view === "video"} onClick={() => setView("video")}><Clapperboard/> Video storyboard</Button></div>
      {view === "video" ? <StoryVideo pages={pages} title={story.title}/> : <div className="space-y-6">{pages.map((p) => <PageCard key={`${p.id}:${p.text}`} page={p} story={story} />)}</div>}
      <PrintBook title={story.title} pages={pages}/>
    </div>
  );
}

function PageCard({ page, story }: { page: Tables<"story_pages">; story: Tables<"stories"> }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const img = useServerFn(generateImage);
  const speak = useServerFn(narrate);
  const url = useMediaUrl(page.image_url);
  const [text, setText] = useState(page.text);
  const [busy, setBusy] = useState<"img" | "voice" | null>(null);
  const savedAudio = useMediaUrl(page.audio_url);
  const [audio, setAudio] = useState<string | null>(null);

  async function illustrate() {
    if (!user) return;
    setBusy("img");
    try {
      const { b64 } = await img({ data: { prompt: page.image_prompt ?? text, style: story.art_style } });
      const path = await uploadBase64(user.id, "pages", b64);
      await supabase.from("story_pages").update({ image_url: path }).eq("id", page.id);
      if (page.page_number === 1 && !story.cover_url) await supabase.from("stories").update({ cover_url: path }).eq("id", story.id);
      qc.invalidateQueries({ queryKey: ["pages", story.id] });
      qc.invalidateQueries({ queryKey: ["stories"] });
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(null); }
  }

  async function listen() {
    setBusy("voice");
    try {
      const { b64, mime } = await speak({ data: { text, voice: voiceEngine(story.voice) } });
      if (!user) return;
      const path = await uploadBase64(user.id, "narration", b64, mime);
      const { error } = await supabase.from("story_pages").update({ audio_url: path }).eq("id", page.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["pages", story.id] });
      const src = `data:${mime};base64,${b64}`;
      setAudio(src);
      new Audio(src).play().catch(() => {});
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(null); }
  }

  async function save() {
    if (text === page.text) return;
    const { error } = await supabase.from("story_pages").update({ text, audio_url: null }).eq("id", page.id);
    if (error) { toast.error(error.message); return; }
    setAudio(null);
    qc.invalidateQueries({ queryKey: ["pages", story.id] });
  }

  return (
    <div className="grid overflow-hidden rounded-2xl border bg-card shadow-soft md:grid-cols-2">
      <div className="grid aspect-[3/2] place-items-center bg-secondary">
        {url ? <img src={url} alt={`Illustration for page ${page.page_number}`} className="h-full w-full object-contain" /> : (
          <Button variant="outline" disabled={busy === "img"} onClick={illustrate}><ImageIcon className="h-4 w-4" /> {busy === "img" ? "Painting…" : "Illustrate page"}</Button>
        )}
      </div>
      <div className="flex flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Page {page.page_number}</p>
        <Textarea className="mt-2 flex-1 font-display text-lg" rows={5} value={text} onChange={(e) => setText(e.target.value)} onBlur={save} />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={!!busy} onClick={listen}><Volume2 className="h-4 w-4" /> {busy === "voice" ? "Recording…" : "Narrate"}</Button>
          {url && <Button size="sm" variant="ghost" disabled={!!busy} onClick={illustrate}>{busy === "img" ? "Painting…" : "Redraw"}</Button>}
        </div>
        {(audio || savedAudio) && <audio controls src={audio ?? savedAudio} className="mt-3 w-full" />}
      </div>
    </div>
  );
}
