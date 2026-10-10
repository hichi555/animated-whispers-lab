import { forwardRef, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { ArrowLeft, ArrowRight, X, Volume2, VolumeX, ImagePlus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaUrl } from "@/lib/media";
import type { Tables } from "@/integrations/supabase/types";

type Page = Tables<"story_pages">;

const Leaf = forwardRef<
  HTMLDivElement,
  { className?: string; hard?: boolean; children: React.ReactNode }
>(({ className = "", hard, children }, ref) => (
  <div ref={ref} className={`flip-leaf ${className}`} data-density={hard ? "hard" : "soft"}>
    {children}
  </div>
));
Leaf.displayName = "Leaf";

function Art({ path, alt }: { path: string | null; alt: string }) {
  const url = useMediaUrl(path);
  return url ? (
    <img src={url} alt={alt} draggable={false} className="h-full w-full object-cover" />
  ) : (
    <span className="flip-empty">Illustration not added</span>
  );
}

function Narration({ path, n }: { path: string | null; n: number }) {
  const url = useMediaUrl(path);
  return url ? (
    <audio
      controls
      preload="none"
      src={url}
      className="mt-4 w-full"
      aria-label={`Narration for page ${n}`}
    />
  ) : null;
}

export function BookReader({
  title,
  pages,
  coverPath,
  storyId,
  onIllustrate,
  drawingPage,
  onClose,
}: {
  title: string;
  pages: Page[];
  coverPath?: string | null;
  storyId: string;
  onIllustrate: (page: Page) => void;
  drawingPage: string | null;
  onClose: () => void;
}) {
  const book = useRef<{
    pageFlip: () => {
      flipNext: () => void;
      flipPrev: () => void;
      turnToPage: (page: number) => void;
    };
  } | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const [sound, setSound] = useState(true);
  const [current, setCurrent] = useState(0);
  const [dims, setDims] = useState({ w: 540, h: 720, compact: false });
  const [contents, setContents] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [startPage, setStartPage] = useState(0);
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(`reader-position:${storyId}`));
      if (Number.isInteger(saved) && saved >= 0 && saved < pages.length * 2 + 2) {
        setStartPage(saved);
        setCurrent(saved);
      }
    } catch {
      /* private browsing */
    }
  }, [storyId, pages.length]);
  const total = pages.length * 2 + 2;
  const coverArt = coverPath ?? pages.find((p) => p.image_url)?.image_url ?? null;

  useEffect(() => {
    const fit = () => {
      const compact = window.innerWidth < 768;
      const h = Math.min(window.innerHeight - (compact ? 180 : 160), 1000);
      const w = Math.min(
        Math.round(h * 0.75),
        Math.floor((window.innerWidth - (compact ? 24 : 80)) / (compact ? 1 : 2)),
      );
      setDims({ w: Math.max(w, 160), h: Math.max(Math.round(w / 0.75), 213), compact });
    };
    fit();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("resize", fit);
    const key = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input,textarea,select")) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") book.current?.pageFlip()?.flipNext();
      if (e.key === "ArrowLeft") book.current?.pageFlip()?.flipPrev();
    };
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("resize", fit);
      window.removeEventListener("keydown", key);
    };
  }, [onClose]);

  function rustle() {
    if (!sound) return;
    try {
      const ctx = audio.current ?? new AudioContext();
      audio.current = ctx;
      void ctx.resume();
      const len = ctx.sampleRate * 0.55;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const env = Math.pow(Math.sin(Math.PI * Math.min(t * 1.4, 1)), 1.6) * (1 - t * 0.6);
        last = last * 0.82 + (Math.random() * 2 - 1) * 0.18; // paper grain
        const snap = t > 0.62 && t < 0.68 ? (Math.random() * 2 - 1) * 0.9 : 0; // page settling
        d[i] = (last * 2.4 + snap) * env;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 500;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 5200;
      const g = ctx.createGain();
      g.gain.value = 0.35;
      src.connect(hp).connect(lp).connect(g).connect(ctx.destination);
      src.start();
    } catch {
      /* audio optional */
    }
  }

  const Flip = HTMLFlipBook;
  const selected =
    current > 0 && current < total - 1
      ? pages[Math.floor((current - 1) / 2)]
      : current === 0
        ? pages[0]
        : undefined;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Read ${title}`}
      className={`book-reader ${largeText ? "reader-large-type" : ""}`}
    >
      <header className="reader-header">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reading room</p>
          <h2 className="mt-1 truncate text-xl">{title}</h2>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="Contents"
            aria-label="Contents"
            aria-pressed={contents}
            onClick={() => setContents(!contents)}
          >
            <BookOpen />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Larger text"
            aria-label="Larger text"
            aria-pressed={largeText}
            onClick={() => setLargeText(!largeText)}
          >
            Aa
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle page sounds"
            aria-pressed={sound}
            onClick={() => setSound(!sound)}
          >
            {sound ? <Volume2 /> : <VolumeX />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Close reader" onClick={onClose}>
            <X />
          </Button>
        </div>
      </header>
      {contents && (
        <nav aria-label="Book contents" className="reader-contents">
          <Button
            variant="outline"
            size="sm"
            onClick={() => book.current?.pageFlip()?.turnToPage(0)}
          >
            Cover
          </Button>
          {pages.map((p, i) => (
            <Button
              key={p.id}
              variant="outline"
              size="sm"
              onClick={() => {
                book.current?.pageFlip()?.turnToPage(i * 2 + 1);
                setContents(false);
              }}
            >
              {p.page_number}
            </Button>
          ))}
        </nav>
      )}
      <div className={`flip-stage ${current === 0 ? "reader-front-closed" : current >= total - 1 ? "reader-back-closed" : ""}`}>
        <Flip
          ref={book}
          key={`${storyId}:${dims.w}x${dims.h}:${startPage}`}
          width={dims.w}
          height={dims.h}
          size="fixed"
          autoSize={false}
          style={{}}
          minWidth={160}
          maxWidth={1000}
          minHeight={213}
          maxHeight={1400}
          startZIndex={0}
          clickEventForward
          useMouseEvents
          swipeDistance={30}
          showPageCorners
          disableFlipByClick
          startPage={startPage}
          showCover
          maxShadowOpacity={0.45}
          drawShadow
          flippingTime={700}
          usePortrait={dims.compact}
          mobileScrollSupport
          onFlip={(e: { data: number }) => {
            setCurrent(e.data);
            try {
              localStorage.setItem(`reader-position:${storyId}`, String(e.data));
            } catch {
              // localStorage may be unavailable in private browsing mode
            }
          }}
          onChangeState={(e: { data: string }) => { if (e.data === "flipping") rustle(); }}
          className="flip-book"
        >
          <Leaf hard className="flip-cover">
            <div className="flip-cover-art">
              <Art path={coverArt} alt={`${title} cover`} />
            </div>
            <div className="flip-cover-title">
              <span>A CyliaTales book</span>
              <h1>{title}</h1>
            </div>
          </Leaf>
          {pages.flatMap((p) => [
            <Leaf key={`${p.id}-a`} className="flip-art flip-panorama-left">
              <Art path={p.image_url} alt={`Illustration for page ${p.page_number}`} />
            </Leaf>,
            <Leaf key={`${p.id}-t`} className="flip-art flip-panorama-right">
              <Art path={p.image_url} alt={`Illustration continuation for page ${p.page_number}`} />
              <div className="flip-prose flip-story-panel">
                <p>{p.text}</p>
                <Narration path={p.audio_url} n={p.page_number} />
              </div>
              <span className="flip-folio">{p.page_number}</span>
            </Leaf>,
          ])}
          <Leaf hard className="flip-cover flip-back">
            <div className="flip-cover-title">
              <h1>The end</h1>
              <span>Made with CyliaTales</span>
            </div>
          </Leaf>
        </Flip>
      </div>
      <footer className="reader-footer justify-center">
        <div>
          {selected && (
            <Button
              variant="outline"
              size="sm"
              disabled={!!drawingPage}
              onClick={() => onIllustrate(selected)}
            >
              <ImagePlus />
              {drawingPage === selected.id
                ? "Illustrating…"
                : selected.image_url
                  ? "Redraw page"
                  : "Illustrate page"}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="outline"
            aria-label="Previous page"
            disabled={current === 0}
            onClick={() => book.current?.pageFlip()?.flipPrev()}
          >
            <ArrowLeft />
          </Button>
          <span aria-live="polite" className="min-w-32 text-center text-sm tabular-nums">
            {current === 0
              ? "Cover"
              : current >= total - 1
                ? "Back cover"
                 : `Page ${Math.floor((current - 1) / 2) + 1} of ${pages.length}`}
          </span>
          <Button
            size="icon"
            variant="outline"
            aria-label="Next page"
            disabled={current >= total - 1}
            onClick={() => book.current?.pageFlip()?.flipNext()}
          >
            <ArrowRight />
          </Button>
        </div>
      </footer>
    </div>
  );
}
