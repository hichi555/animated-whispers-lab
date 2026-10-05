import { useEffect, useRef, useState } from "react";
import { Play, Pause, Download, Save, Clapperboard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMediaUrl } from "@/lib/media";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

type Page = Tables<"story_pages">;
export function StoryVideo({ pages, title }: { pages: Page[]; title: string }) {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [duration, setDuration] = useState(6);
  const page = pages[selected];
  const image = useMediaUrl(page?.image_url);
  const narration = useMediaUrl(page?.audio_url);
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (!playing || !page) return;
    const advance = () => { if (selected + 1 < pages.length) setSelected(selected + 1); else setPlaying(false); };
    if (narration && audio.current) {
      audio.current.onended = advance;
      void audio.current.play().catch(() => setPlaying(false));
      return () => { audio.current?.pause(); };
    }
    const timer = window.setTimeout(advance, duration * 1000);
    return () => window.clearTimeout(timer);
  }, [playing, selected, narration, duration, pages.length, page]);

  async function exportVideo() {
    if (!pages.length || pages.some(p => !p.image_url)) { toast.error("Add an illustration to every scene before exporting."); return; }
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported("video/webm")) { toast.error("WebM export is not supported in this browser."); return; }
    setPlaying(false); setExporting(true);
    let stream: MediaStream | undefined;
    try {
      const images = await Promise.all(pages.map(async p => {
        if (!p.image_url) throw new Error("Missing illustration");
        const { data, error } = await supabase.storage.from("media").createSignedUrl(p.image_url, 3600);
        if (error) throw error;
        const img = new Image(); img.crossOrigin = "anonymous"; img.src = data.signedUrl; await img.decode(); return img;
      }));
      const canvas = document.createElement("canvas"); canvas.width = 1920; canvas.height = 1080;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Video canvas is unavailable");
      stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm", videoBitsPerSecond: 12000000 });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      const done = new Promise<Blob>((resolve, reject) => { recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" })); recorder.onerror = () => reject(new Error("Video export failed")); });
      const background = getComputedStyle(document.documentElement).getPropertyValue("--background").trim();
      ctx.fillStyle = background; ctx.fillRect(0, 0, 1920, 1080);
      recorder.start();
      for (let i = 0; i < images.length; i++) {
        setSelected(i);
        const img = images[i];
        if (!img) throw new Error("Scene illustration is unavailable");
        ctx.fillStyle = background; ctx.fillRect(0, 0, 1920, 1080);
        const scale = Math.min(1920 / img.width, 1080 / img.height);
        ctx.drawImage(img, (1920 - img.width * scale) / 2, (1080 - img.height * scale) / 2, img.width * scale, img.height * scale);
        await new Promise(resolve => window.setTimeout(resolve, duration * 1000));
      }
      recorder.stop(); const blob = await done;
      const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${title.replace(/[^a-z0-9]+/gi, "-")}.webm`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Silent 1080p video exported");
    } catch (error) { toast.error((error as Error).message); }
    finally { stream?.getTracks().forEach(track => track.stop()); setExporting(false); }
  }
  if (!page) return <p className="py-12 text-muted-foreground">This book has no scenes yet.</p>;
  return <section className="video-workspace">
    <div className="flex flex-wrap items-center justify-between gap-3 border-y py-4"><div className="flex items-center gap-3"><Clapperboard className="text-primary"/><h2 className="text-lg font-semibold">Story film</h2><span className="text-sm text-muted-foreground">{pages.length} scenes</span></div><div className="flex gap-2"><Button variant="outline" disabled={exporting} onClick={() => setPlaying(!playing)}>{playing ? <Pause/> : <Play/>}{playing ? "Pause" : "Play with narration"}</Button><Button disabled={exporting} onClick={exportVideo}><Download/>{exporting ? "Exporting…" : "Silent WebM · 1080p"}</Button></div></div>
    <div className="grid gap-6 py-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div><div className="video-stage">{image ? <img src={image} alt={`Scene ${page.page_number}`} /> : <p className="text-muted-foreground">No illustration for this scene</p>}</div><p className="mt-4 font-display text-xl leading-relaxed">{page.text}</p>{narration && <audio ref={audio} key={narration} src={narration} controls className="mt-4 w-full"/>}</div>
      <div><SceneEditor key={`${page.id}:${page.text}:${page.image_prompt}`} page={page}/><div className="mt-5 space-y-2"><Label htmlFor="scene-duration">Silent scene duration · {duration}s</Label><input id="scene-duration" className="w-full accent-primary" type="range" min={3} max={15} value={duration} onChange={e => setDuration(Number(e.target.value))} disabled={exporting}/></div></div>
    </div>
    <div className="storyboard-strip">{pages.map((p, i) => <SceneTile key={p.id} page={p} active={i === selected} onSelect={() => { setPlaying(false); setSelected(i); }} disabled={exporting}/>)}</div>
  </section>;
}
function SceneTile({ page, active, onSelect, disabled }: { page: Page; active: boolean; onSelect: () => void; disabled: boolean }) {
  const url = useMediaUrl(page.image_url);
  return <Button variant={active ? "default" : "outline"} aria-pressed={active} onClick={onSelect} disabled={disabled} className="storyboard-tile">{url ? <img src={url} alt=""/> : <Clapperboard/>}<span>Scene {page.page_number}</span></Button>;
}
function SceneEditor({ page }: { page: Page }) {
  const [text, setText] = useState(page.text); const [prompt, setPrompt] = useState(page.image_prompt ?? ""); const [saving, setSaving] = useState(false); const qc = useQueryClient();
  async function save() { setSaving(true); try { const { error } = await supabase.from("story_pages").update({ text, image_prompt: prompt, ...(text !== page.text ? { audio_url: null } : {}) }).eq("id", page.id); if (error) throw error; await qc.invalidateQueries({ queryKey: ["pages", page.story_id] }); toast.success("Scene saved"); } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); } }
  return <div className="space-y-4"><h3 className="font-semibold">Scene {page.page_number}</h3><div className="space-y-2"><Label htmlFor="scene-script">Narration script</Label><Textarea id="scene-script" rows={6} value={text} onChange={e => setText(e.target.value)}/></div><div className="space-y-2"><Label htmlFor="scene-direction">Illustration direction</Label><Textarea id="scene-direction" rows={4} value={prompt} onChange={e => setPrompt(e.target.value)}/></div><Button onClick={save} disabled={saving}><Save/>{saving ? "Saving…" : "Save scene"}</Button></div>;
}