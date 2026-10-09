import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  AudioLines,
  BookOpen,
  Check,
  CheckCircle2,
  Clapperboard,
  Film,
  Image as ImageIcon,
  LockKeyhole,
  PenLine,
  RefreshCw,
  Sparkles,
  UserRound,
  WandSparkles,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMediaUrl } from "@/lib/media";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/labs")({
  head: () => ({
    meta: [
      { title: "Production Desk — CyliaTales" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Review, direct and export your CyliaTales story production.",
      },
      { property: "og:title", content: "Production Desk — CyliaTales" },
      {
        property: "og:description",
        content: "Review, direct and export your CyliaTales story production.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Labs,
});

type Story = Tables<"stories">;
type Page = Tables<"story_pages">;
type Stage = {
  label: string;
  description: string;
  icon: typeof PenLine;
  done: boolean;
  to?: "/stories/new" | "/characters";
};

function Labs() {
  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["production-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const [selectedId, setSelectedId] = useState("");
  useEffect(() => {
    if (!selectedId && stories[0]?.id) setSelectedId(stories[0].id);
  }, [selectedId, stories]);
  const selected = stories.find((story) => story.id === selectedId) ?? stories[0];
  const { data: pages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ["production-pages", selected?.id],
    enabled: Boolean(selected?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("story_pages")
        .select("*")
        .eq("story_id", selected.id)
        .order("page_number");
      if (error) throw error;
      return data ?? [];
    },
  });
  const stages = selected ? getStages(selected, pages) : [];
  const completed = stages.filter((stage) => stage.done).length;
  const percent = stages.length ? Math.round((completed / stages.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Production desk"
        title="Make the approved version real."
        subtitle="A review-first control room for story, cast, pages, narration and motion. Nothing is exported until you can inspect it."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/stories">
                <BookOpen /> Library
              </Link>
            </Button>
            <Button asChild>
              <Link to="/stories/new">
                <PenLine /> New story
              </Link>
            </Button>
          </div>
        }
      />
      {isLoading ? (
        <ProductionSkeleton />
      ) : !stories.length ? (
        <EmptyDesk />
      ) : (
        <>
          <div className="production-command border bg-card p-5 shadow-soft md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  <LockKeyhole className="h-4 w-4" /> Private production
                </p>
                <h2 className="mt-3 truncate text-2xl font-semibold md:text-3xl">
                  {selected.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ages {selected.age_range} · {selected.art_style} · {selected.voice} ·{" "}
                  {pages.length} scenes
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ProgressRing value={percent} />
                <div>
                  <p className="text-sm font-semibold">
                    {completed} of {stages.length} gates passed
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Review each gate before delivery.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-7 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {stages.map((stage) => (
                <StageRow key={stage.label} stage={stage} />
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/stories/$id" params={{ id: selected.id }}>
                  <Clapperboard /> Open production timeline
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/stories/$id" params={{ id: selected.id }}>
                  <RefreshCw /> Review story
                </Link>
              </Button>
            </div>
          </div>

          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Your productions
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Choose a story to direct</h2>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="sr-only">Select a story</span>
                <select
                  className="h-10 min-w-52 rounded-md border bg-background px-3 font-medium text-foreground"
                  value={selected.id}
                  onChange={(event) => setSelectedId(event.target.value)}
                >
                  {stories.map((story) => (
                    <option key={story.id} value={story.id}>
                      {story.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <ProductionStat
                icon={ImageIcon}
                label="Illustration coverage"
                value={`${pages.filter((page) => Boolean(page.image_url)).length}/${pages.length || 0}`}
                detail="Approved page images"
              />
              <ProductionStat
                icon={AudioLines}
                label="Narration coverage"
                value={`${pages.filter((page) => Boolean(page.audio_url)).length}/${pages.length || 0}`}
                detail="Recorded story lines"
              />
              <ProductionStat
                icon={Film}
                label="Motion coverage"
                value={`${pages.filter((page) => Boolean(page.motion_url)).length}/${pages.length || 0}`}
                detail="Rendered scene clips"
              />
            </div>
          </section>

          <section className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="border bg-card p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Shot list
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">Inspect every scene</h2>
                </div>
                <span className="text-sm text-muted-foreground">
                  {pagesLoading ? "Loading…" : `${pages.length} scenes`}
                </span>
              </div>
              <div className="mt-5 space-y-2">
                {pages.slice(0, 6).map((page) => (
                  <SceneRow key={page.id} page={page} />
                ))}
                {pages.length > 6 && (
                  <Button variant="link" className="px-0" asChild>
                    <Link to="/stories/$id" params={{ id: selected.id }}>
                      Open all scenes <ArrowRight />
                    </Link>
                  </Button>
                )}
                {!pages.length && (
                  <p className="text-sm text-muted-foreground">
                    This story has no scenes yet. Open the story editor to draft its first
                    production plan.
                  </p>
                )}
              </div>
            </div>
            <div className="border bg-primary p-6 text-primary-foreground">
              <Sparkles className="h-6 w-6 text-accent" />
              <h2 className="mt-5 text-xl font-semibold">CyliaTales direction standard</h2>
              <p className="mt-3 text-sm leading-6 text-primary-foreground/80">
                Lock the story plan, cast and visual language first. Then regenerate only the page
                or shot that needs attention—approved work stays untouched.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-primary-foreground/90">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-accent" /> Story and age fit reviewed
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-accent" /> Character and style continuity
                  checked
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-accent" /> Narration and motion approved per
                  scene
                </li>
              </ul>
              <Button variant="secondary" className="mt-7" asChild>
                <Link to="/characters">
                  <UserRound /> Review the cast
                </Link>
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function getStages(story: Story, pages: Page[]): Stage[] {
  return [
    {
      label: "Story brief",
      description: "Idea and reading level",
      icon: PenLine,
      done: Boolean(story.idea?.trim()),
      to: "/stories/new",
    },
    {
      label: "Cast lock",
      description: "Recurring characters",
      icon: UserRound,
      done: story.character_ids.length > 0,
      to: "/characters",
    },
    {
      label: "Page review",
      description: "Illustrated scenes",
      icon: ImageIcon,
      done: pages.length > 0 && pages.every((page) => Boolean(page.image_url)),
    },
    {
      label: "Film assembly",
      description: "Narration and motion",
      icon: Film,
      done: pages.length > 0 && pages.every((page) => Boolean(page.audio_url || page.motion_url)),
    },
  ];
}

function StageRow({ stage }: { stage: Stage }) {
  const Icon = stage.icon;
  const content = (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 transition ${stage.done ? "border-accent/40 bg-accent/5" : "bg-background/50"}`}
    >
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-background">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{stage.label}</p>
        <p className="truncate text-xs text-muted-foreground">{stage.description}</p>
      </div>
      {stage.done ? (
        <CheckCircle2 className="h-5 w-5 text-accent" />
      ) : (
        <XCircle className="h-5 w-5 text-muted-foreground/50" />
      )}
    </div>
  );
  return stage.to ? <Link to={stage.to}>{content}</Link> : content;
}

function ProductionStat({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Film;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border bg-card p-5">
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-primary" />
        <span className="text-2xl font-semibold">{value}</span>
      </div>
      <p className="mt-5 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function SceneRow({ page }: { page: Page }) {
  const image = useMediaUrl(page.image_url);
  return (
    <Link
      to="/stories/$id"
      params={{ id: page.story_id }}
      className="flex items-center gap-3 rounded-xl border p-3 transition hover:border-primary/40 hover:bg-secondary/40"
    >
      <div className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-secondary">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <Clapperboard className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">Scene {page.page_number}</p>
        <p className="truncate text-xs text-muted-foreground">
          {page.shot_type} · {page.camera_motion} · {page.duration_seconds}s
        </p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        {page.image_url && <ImageIcon className="h-4 w-4 text-accent" />}
        {page.audio_url && <AudioLines className="h-4 w-4 text-accent" />}
        {page.motion_url && <Film className="h-4 w-4 text-accent" />}
      </div>
    </Link>
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative grid h-14 w-14 place-items-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-secondary"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-accent transition-all"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * value) / 100}
        />
      </svg>
      <span className="text-xs font-semibold">{value}%</span>
    </div>
  );
}

function EmptyDesk() {
  return (
    <div className="grid min-h-96 place-items-center border bg-card p-8 text-center shadow-soft">
      <div className="max-w-md">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
          <WandSparkles />
        </div>
        <h2 className="mt-5 text-2xl font-semibold">Your production desk is ready.</h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          Start with a story brief, then bring it here to direct the cast, pages, narration and
          film.
        </p>
        <Button className="mt-7" asChild>
          <Link to="/stories/new">
            <PenLine /> Write the first scene
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ProductionSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="h-64 animate-pulse rounded-2xl bg-secondary" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 animate-pulse rounded-xl bg-secondary" />
        <div className="h-28 animate-pulse rounded-xl bg-secondary" />
        <div className="h-28 animate-pulse rounded-xl bg-secondary" />
      </div>
    </div>
  );
}
