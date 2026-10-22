import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SAMPLE_BOOK, type SampleLanguage } from "@/lib/showcase";

const LANGUAGES: { id: SampleLanguage; label: string; speech: string }[] = [
  { id: "en", label: "EN", speech: "en-GB" },
  { id: "fr", label: "FR", speech: "fr-FR" },
  { id: "es", label: "ES", speech: "es-ES" },
];

function imageForPage(index: number) {
  return index < 0 ? SAMPLE_BOOK.cover.image : (SAMPLE_BOOK.pages[index]?.image ?? SAMPLE_BOOK.cover.image);
}

export function SampleReader() {
  const [pageIndex, setPageIndex] = useState(-1);
  const [language, setLanguage] = useState<SampleLanguage>("en");
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [listening, setListening] = useState(false);
  const [outgoingImage, setOutgoingImage] = useState<string | null>(null);
  const [fading, setFading] = useState(false);
  const fadeTimer = useRef<number | null>(null);
  const animationFrame = useRef<number | null>(null);
  const currentImage = imageForPage(pageIndex);
  const currentText =
    pageIndex < 0
      ? `${SAMPLE_BOOK.cover.title[language]}. ${SAMPLE_BOOK.cover.blurb[language]}`
      : (SAMPLE_BOOK.pages[pageIndex]?.text[language] ?? SAMPLE_BOOK.cover.subtitle[language]);
  const currentLanguage = LANGUAGES.find((item) => item.id === language)!;
  const isCover = pageIndex < 0;

  useEffect(() => {
    setSpeechAvailable("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current);
      if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  useEffect(() => {
    const nextPage = pageIndex < 0 ? 0 : (pageIndex + 1) % SAMPLE_BOOK.pages.length;
    const preload = new Image();
    preload.src = SAMPLE_BOOK.pages[nextPage]?.image ?? SAMPLE_BOOK.cover.image;
  }, [pageIndex]);

  function stopListening() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setListening(false);
  }

  function goToPage(nextIndex: number) {
    if (nextIndex < -1 || nextIndex >= SAMPLE_BOOK.pages.length || nextIndex === pageIndex) return;
    stopListening();
    if (fadeTimer.current !== null) window.clearTimeout(fadeTimer.current);
    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    setOutgoingImage(currentImage);
    setFading(false);
    setPageIndex(nextIndex);
    animationFrame.current = window.requestAnimationFrame(() => setFading(true));
    fadeTimer.current = window.setTimeout(() => {
      setOutgoingImage(null);
      setFading(false);
    }, 210);
  }

  function toggleListening() {
    if (listening) {
      stopListening();
      return;
    }
    if (!speechAvailable) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentText);
    utterance.lang = currentLanguage.speech;
    utterance.onend = () => setListening(false);
    utterance.onerror = () => setListening(false);
    window.speechSynthesis.speak(utterance);
    setListening(true);
  }

  return (
    <section
      id="sample"
      aria-labelledby="sample-title"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goToPage(pageIndex - 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          goToPage(pageIndex + 1);
        }
      }}
      className="mx-auto max-w-7xl scroll-mt-8 px-5 py-16 outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            A small story, six pages
          </p>
          <h2 id="sample-title" className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Read one, right here.
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-card p-1" aria-label="Sample language">
          {LANGUAGES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={language === item.id}
              onClick={() => {
                stopListening();
                setLanguage(item.id);
              }}
              className={`rounded-full px-3 py-2 text-xs font-bold transition-colors motion-reduce:transition-none ${
                language === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid overflow-hidden rounded-3xl border bg-card shadow-soft lg:grid-cols-2">
        <div className="relative aspect-[3/2] min-h-0 bg-secondary lg:aspect-auto">
          {outgoingImage && (
            <img
              src={outgoingImage}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 motion-reduce:transition-none ${
                fading ? "opacity-0" : "opacity-100"
              }`}
            />
          )}
          <img
            key={currentImage}
            src={currentImage}
            alt={
              isCover
                ? "Fern and Ember beneath the trees on the cover of their story"
                : `Fern and Ember in the illustration for page ${pageIndex + 1}`
            }
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 motion-reduce:transition-none ${
              outgoingImage && !fading ? "opacity-0" : "opacity-100"
            }`}
          />
          {isCover && (
            <div
              className={`absolute inset-x-0 top-0 bg-gradient-to-b from-foreground/60 via-foreground/20 to-transparent px-5 pb-10 pt-5 text-center text-background transition-opacity duration-200 motion-reduce:transition-none sm:px-8 sm:pt-7 ${
                outgoingImage && !fading ? "opacity-0" : "opacity-100"
              }`}
            >
              <p className="font-display text-3xl leading-tight text-balance sm:text-4xl">
                {SAMPLE_BOOK.cover.title[language]}
              </p>
              <p className="mt-2 text-sm font-medium">{SAMPLE_BOOK.cover.subtitle[language]}</p>
            </div>
          )}
        </div>
        <div className="flex min-h-[19rem] flex-col justify-between bg-background p-6 sm:p-9 lg:min-h-0 lg:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {isCover ? "The cover" : `Fern and Ember · ${pageIndex + 1}`}
            </p>
            <p className="mt-5 font-display text-2xl leading-[1.65] text-foreground sm:text-3xl sm:leading-[1.65]">
              {isCover ? SAMPLE_BOOK.cover.blurb[language] : currentText}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <span className="text-sm font-medium text-muted-foreground">
              {isCover ? "Cover" : `Page ${pageIndex + 1} of ${SAMPLE_BOOK.pages.length}`}
            </span>
            {speechAvailable && (
              <Button
                variant={listening ? "secondary" : "outline"}
                size="sm"
                aria-pressed={listening}
                onClick={toggleListening}
              >
                {listening ? <VolumeX /> : <Volume2 />}
                {listening ? "Stop listening" : "Listen"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(pageIndex - 1)}
          disabled={pageIndex < 0}
          aria-label="Previous page"
        >
          <ArrowLeft /> Previous
        </Button>
        <div className="flex items-center gap-2" role="group" aria-label="Choose a page">
          <button
            type="button"
            aria-label="Cover"
            aria-current={isCover ? "page" : undefined}
            onClick={() => goToPage(-1)}
            className={`h-2.5 rounded-full transition-all motion-reduce:transition-none ${
              isCover ? "w-7 bg-primary" : "w-2.5 bg-border hover:bg-primary/50"
            }`}
          />
          {SAMPLE_BOOK.pages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Page ${index + 1}`}
              aria-current={pageIndex === index ? "page" : undefined}
              onClick={() => goToPage(index)}
              className={`h-2.5 rounded-full transition-all motion-reduce:transition-none ${
                pageIndex === index ? "w-7 bg-primary" : "w-2.5 bg-border hover:bg-primary/50"
              }`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(pageIndex + 1)}
          disabled={pageIndex >= SAMPLE_BOOK.pages.length - 1}
          aria-label="Next page"
        >
          Next <ArrowRight />
        </Button>
      </div>
      <p className="mt-6 text-center font-display text-lg leading-7 text-muted-foreground">
        This book began with one line: “A girl whose lantern goes out, and the fox who lights the way
        home.”
      </p>
    </section>
  );
}
