import { useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero.webp";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AGE_RANGES } from "@/lib/catalog";

const STARTERS = [
  "A shy lighthouse cat who is afraid of the dark",
  "A first day at a school on the moon",
  "Grandma's garden that grows a different colour every night",
  "A dragon who wants to learn to share",
];

export function Hero() {
  const navigate = useNavigate();
  const [idea, setIdea] = useState("");
  const [ageRange, setAgeRange] = useState<string>(AGE_RANGES[1].id);
  const [showIdeaHint, setShowIdeaHint] = useState(false);
  const ideaRef = useRef<HTMLTextAreaElement>(null);

  function startStory() {
    if (idea.trim().length < 3) {
      setShowIdeaHint(true);
      ideaRef.current?.focus();
      return;
    }
    setShowIdeaHint(false);
    sessionStorage.setItem("cylia:pending-brief", JSON.stringify({ idea: idea.trim(), ageRange }));
    void navigate({ to: "/stories/new" });
  }

  return (
    <section className="border-y border-border/70 bg-hero">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-6 md:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:px-8 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> A story studio for read-alouds
          </p>
          <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.03em] text-foreground sm:text-6xl md:text-7xl">
            Make stories worth <em className="font-display font-normal text-primary">keeping.</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Turn one small idea into a book your family can read, hear and return to together.
            Choose the reader, shape the story, and review each page before it becomes a keepsake.
          </p>

          <div className="mt-8 rounded-2xl border bg-card p-4 shadow-soft sm:p-5">
            <label htmlFor="story-idea" className="text-sm font-semibold">
              What story should we make?
            </label>
            <Textarea
              ref={ideaRef}
              id="story-idea"
              value={idea}
              onChange={(event) => {
                const nextIdea = event.target.value;
                setIdea(nextIdea);
                if (nextIdea.trim().length >= 3) setShowIdeaHint(false);
              }}
              placeholder="A shy lighthouse cat who is afraid of the dark…"
              className="mt-3 min-h-24 resize-y bg-background text-base"
            />
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Who will hear it?
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Reader age">
                {AGE_RANGES.map((range) => (
                  <button
                    key={range.id}
                    type="button"
                    aria-pressed={ageRange === range.id}
                    onClick={() => setAgeRange(range.id)}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors motion-reduce:transition-none sm:text-sm ${
                      ageRange === range.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {range.id.replace("-", "–")} · {range.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Need a first line?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => {
                      setIdea(starter);
                      setShowIdeaHint(false);
                    }}
                    className="rounded-full bg-secondary px-3 py-2 text-left text-xs leading-4 text-secondary-foreground transition-colors hover:bg-primary/10 motion-reduce:transition-none"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
            <Button
              className="mt-5 w-full sm:w-auto"
              onClick={startStory}
            >
              Start this story <ArrowRight />
            </Button>
            <p
              aria-live="polite"
              className={`mt-2 text-xs text-destructive ${showIdeaHint ? "" : "sr-only"}`}
            >
              {showIdeaHint ? "Add a line or pick a starter above." : ""}
            </p>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Private by default · Review every draft · Your story stays yours
          </p>
          <Link
            to="/styles"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            See the fourteen art styles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <figure className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border bg-secondary shadow-soft">
          <img
            src={hero}
            alt="Fern and Ember set out together beneath the trees of Willowmere"
            className="aspect-[4/3] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
          />
          <figcaption className="absolute inset-x-4 bottom-4 rounded-xl border border-white/40 bg-background/90 px-4 py-3 text-sm shadow-sm backdrop-blur">
            <span className="font-display text-lg">Fern and the Lantern Fox</span>
            <span className="ml-2 text-muted-foreground">A sample story, made to read aloud</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
