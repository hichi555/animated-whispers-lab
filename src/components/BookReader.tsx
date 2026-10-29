import { forwardRef, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ImagePlus,
  Languages,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
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
  const [bilingual, setBilingual] = useState(false);
  const [startPage, setStartPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const narration = useRef<HTMLAudioElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
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
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getAttribute("aria-hidden") !== "true");
    focusable()[0]?.focus({ preventScroll: true });
    window.addEventListener("resize", fit);
    const key = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input,textarea,select")) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") book.current?.pageFlip()?.flipNext();
      if (e.key === "ArrowLeft") book.current?.pageFlip()?.flipPrev();
      if (e.key === "Tab") {
        const items = focusable();
        if (!items.length) {
          e.preventDefault();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("resize", fit);
      window.removeEventListener("keydown", key);
      previousFocus?.focus({ preventScroll: true });
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
  const readingIndex = current > 0 && current < total - 1 ? Math.floor((current - 1) / 2) : -1;
  const selectedNarration = useMediaUrl(readingIndex >= 0 ? pages[readingIndex]?.audio_url : null);

  useEffect(() => {
    setProgress(0);
    setDuration(0);
    if (narration.current) {
      narration.current.pause();
      narration.current.load();
    }
  }, [selectedNarration]);

  useEffect(() => {
    if (!isPlaying || !selectedNarration || !narration.current) return;
    const play = () => void narration.current?.play().catch(() => setIsPlaying(false));
    if (narration.current.readyState >= 2) play();
    else narration.current.addEventListener("loadeddata", play, { once: true });
    return () => narration.current?.removeEventListener("loadeddata", play);
  }, [isPlaying, selectedNarration]);

  function togglePlayback() {
    if (!selectedNarration || !narration.current) return;
    if (isPlaying) {
      narration.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }

  function jumpToPage(index: number) {
    const next = Math.max(0, Math.min(index, pages.length - 1));
    book.current?.pageFlip()?.turnToPage(next * 2 + 1);
  }

  return (
    <div
      ref={dialogRef}
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
            title="Toggle bilingual view"
            aria-label="Toggle bilingual side-by-side view"
            aria-pressed={bilingual}
            disabled={!pages.some((page) => page.translation_text)}
            onClick={() => setBilingual((value) => !value)}
          >
            <Languages />
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
      <audio
        ref={narration}
        src={selectedNarration ?? undefined}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)}
        onEnded={() => {
          if (readingIndex < pages.length - 1) jumpToPage(readingIndex + 1);
          else setIsPlaying(false);
        }}
        aria-label={
          readingIndex >= 0
            ? `Read-aloud narration for page ${readingIndex + 1}`
            : "Read-aloud narration"
        }
        className="sr-only"
      />
      <div
        className={`flip-stage ${current === 0 ? "reader-front-closed" : current >= total - 1 ? "reader-back-closed" : ""}`}
      >
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
          onChangeState={(e: { data: string }) => {
            if (e.data === "flipping") rustle();
          }}
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
              <div
                className={`flip-prose flip-story-panel ${bilingual && p.translation_text ? "reader-bilingual" : ""}`}
              >
                <div>
                  <p className="reader-language-label">Original</p>
                  <p>{p.text}</p>
                </div>
                {bilingual && p.translation_text && (
                  <div>
                    <p className="reader-language-label">
                      {p.translation_language || "Translation"}
                    </p>
                    <p lang={p.translation_language || undefined}>{p.translation_text}</p>
                  </div>
                )}
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
        <div className="reader-player" aria-label="Read-aloud player">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous narrated page"
            disabled={readingIndex <= 0}
            onClick={() => jumpToPage(readingIndex - 1)}
          >
            <SkipBack />
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label={isPlaying ? "Pause read-aloud" : "Play read-aloud"}
            disabled={!selectedNarration}
            onClick={togglePlayback}
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
          <div className="reader-player-copy">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {readingIndex >= 0 ? `Page ${readingIndex + 1} read-aloud` : "Read aloud"}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={Math.min(progress, duration || 1)}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (narration.current) narration.current.currentTime = next;
                setProgress(next);
              }}
              disabled={!selectedNarration}
              aria-label="Narration progress"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next narrated page"
            disabled={readingIndex < 0 || readingIndex >= pages.length - 1}
            onClick={() => jumpToPage(readingIndex + 1)}
          >
            <SkipForward />
          </Button>
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
