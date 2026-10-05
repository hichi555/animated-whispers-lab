import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X, Volume2, VolumeX, Grid2X2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaUrl } from "@/lib/media";
import type { Tables } from "@/integrations/supabase/types";

export function BookReader({ title, pages, onClose }: { title: string; pages: Tables<"story_pages">[]; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [sound, setSound] = useState(true);
  const [direction, setDirection] = useState("opening");
  const [contents, setContents] = useState(false);
  const [size, setSize] = useState(1);
  const audio = useRef<AudioContext | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const storageKey = `cylia-reader:${pages[0]?.story_id ?? title}`;
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    try { const saved = Number(localStorage.getItem(storageKey)); if (Number.isInteger(saved) && saved >= 0 && saved < pages.length) setIndex(saved); } catch { /* Storage is optional. */ }
    root.current?.focus();
    return () => { document.body.style.overflow = overflow; if (previous instanceof HTMLElement) previous.focus(); void audio.current?.close(); };
  }, [storageKey, pages.length]);
  function turn(next: number) {
    if (next < 0 || next >= pages.length || next === index) return;
    setDirection(next > index ? "next" : "previous");
    setIndex(next);
    try { localStorage.setItem(storageKey, String(next)); } catch { /* Storage is optional. */ }
    if (sound) {
      try {
        const ctx = audio.current ?? new AudioContext(); audio.current = ctx;
        void ctx.resume();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * .32, ctx.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / samples.length) ** 2;
        const source = ctx.createBufferSource(); source.buffer = buffer;
        const filter = ctx.createBiquadFilter(); filter.type = "bandpass"; filter.frequency.value = 1300;
        const gain = ctx.createGain(); gain.gain.value = .09;
        source.connect(filter).connect(gain).connect(ctx.destination); source.start();
      } catch { /* Reading still works without audio support. */ }
    }
  }
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") { event.preventDefault(); turn(index + 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); turn(index - 1); }
      if (event.key === "Tab" && root.current) {
        const items = Array.from(root.current.querySelectorAll<HTMLElement>('button:not(:disabled), audio, [tabindex="0"]'));
        const first = items[0], last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  });
  const page = pages[index];
  return <div ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`Read ${title}`} className="book-reader">
    <header className="reader-header"><div className="min-w-0"><p className="text-xs uppercase text-muted-foreground">CyliaTales · Reading room</p><h2 className="mt-1 truncate text-xl">{title}</h2></div><div className="flex shrink-0 gap-1">
      <Button variant="ghost" size="icon" title="Contents" aria-label="Contents" aria-pressed={contents} onClick={() => setContents(!contents)}><Grid2X2/></Button>
      <Button variant="ghost" size="icon" title={sound ? "Mute page sounds" : "Enable page sounds"} aria-label="Toggle page sounds" aria-pressed={sound} onClick={() => setSound(!sound)}>{sound ? <Volume2/> : <VolumeX/>}</Button>
      <Button variant="ghost" size="icon" title="Close reader" aria-label="Close reader" onClick={onClose}><X/></Button>
    </div></header>
    {contents && <nav aria-label="Book contents" className="reader-contents">{pages.map((p, i) => <Button key={p.id} variant={i === index ? "default" : "outline"} size="sm" aria-label={`Go to page ${p.page_number}`} onClick={() => { turn(i); setContents(false); }}>{p.page_number}</Button>)}</nav>}
    <div className="reader-stage">{page ? <ReaderSpread key={page.id} page={page} direction={direction} size={size}/> : <p>This book has no pages yet.</p>}</div>
    <footer className="reader-footer"><div className="flex items-center gap-1"><Button size="icon" variant="ghost" title="Smaller text" aria-label="Smaller text" disabled={size === 0} onClick={() => setSize(size - 1)}><Minus/></Button><span className="text-sm">Aa</span><Button size="icon" variant="ghost" title="Larger text" aria-label="Larger text" disabled={size === 2} onClick={() => setSize(size + 1)}><Plus/></Button></div><div className="flex items-center gap-4"><Button size="icon" variant="outline" aria-label="Previous page" title="Previous page" disabled={index === 0} onClick={() => turn(index - 1)}><ArrowLeft/></Button><span aria-live="polite" className="min-w-16 text-center text-sm tabular-nums">{pages.length ? index + 1 : 0} / {pages.length}</span><Button size="icon" variant="outline" aria-label="Next page" title="Next page" disabled={index >= pages.length - 1} onClick={() => turn(index + 1)}><ArrowRight/></Button></div><span className="reader-end text-xs text-muted-foreground">{index === pages.length - 1 ? "The end" : ""}</span></footer>
  </div>;
}
function ReaderSpread({ page, direction, size }: { page: Tables<"story_pages">; direction: string; size: number }) {
  const image = useMediaUrl(page.image_url);
  const narration = useMediaUrl(page.audio_url);
  return <div className={`book-spread ${direction}`}>
    <div className="book-leaf book-art">{image ? <img src={image} alt={`Illustration for page ${page.page_number}`} draggable={false}/> : <span className="text-muted-foreground">Illustration not added</span>}</div>
    <div className={`book-leaf book-text reader-type-${size}`}><div className="reader-prose"><p>{page.text}</p></div>{narration && <audio controls preload="metadata" src={narration} className="mt-6 w-full" aria-label={`Narration for page ${page.page_number}`}/>}<span className="reader-folio">{page.page_number}</span></div>
  </div>;
}
