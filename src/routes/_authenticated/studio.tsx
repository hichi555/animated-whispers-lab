import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  BookMarked,
  CheckCircle2,
  Circle,
  Clapperboard,
  FileImage,
  Film,
  GraduationCap,
  Globe2,
  Layers3,
  Mic,
  PenTool,
  Printer,
  PlaySquare,
  PanelsTopLeft,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { BookCard } from "./stories.index";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({
    meta: [
      { title: "World Studio — CyliaTales" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Build one connected CyliaTales story world across books, voices and motion.",
      },
    ],
  }),
  component: Studio,
});

function Studio() {
  const { data: stories = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: async () =>
      (await supabase.from("stories").select("*").order("updated_at", { ascending: false })).data ??
      [],
  });
  const { data: cast = 0 } = useQuery({
    queryKey: ["characters-count"],
    queryFn: async () =>
      (await supabase.from("characters").select("id", { count: "exact", head: true })).count ?? 0,
  });
  const { data: voices = 0 } = useQuery({
    queryKey: ["voice-count"],
    queryFn: async () =>
      (await supabase.from("voice_profiles").select("id", { count: "exact", head: true })).count ??
      0,
  });
  const tiles = [
    {
      to: "/stories/new",
      icon: PenTool,
      title: "Write a new book",
      body: "Brief the world, review the manuscript plan, then produce.",
    },
    {
      to: "/characters",
      icon: UserRound,
      title: `Character atlas (${cast})`,
      body: "Build a recurring cast with locked visual identity.",
    },
    {
      to: "/voices",
      icon: Mic,
      title: `Voice library (${voices})`,
      body: "Give the world a narrator with a considered sound.",
    },
    {
      to: "/stories",
      icon: BookOpen,
      title: `Story shelf (${stories.length})`,
      body: "Read, revise and carry approved worlds forward.",
    },
  ] as const;
  return (
    <div>
      <PageHeader
        eyebrow="World Studio"
        title="One world. Many ways to tell it."
        subtitle="CyliaTales keeps your cast, voice and visual direction connected while you move from manuscript to read-aloud book to moving scene."
        actions={
          <Button asChild>
            <Link to="/stories/new">New story</Link>
          </Button>
        }
      />
      <div className="production-desk mb-8 border-y py-7">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">On your desk</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {stories[0]?.title ?? "Your next story starts here"}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {stories[0]
              ? `Ages ${stories[0].age_range} · ${stories[0].art_style} · ${stories[0].voice}`
              : "Books, characters and voices"}
          </p>
        </div>
        <div className="production-steps">
          {[
            { label: "Cast", done: cast > 0 },
            { label: "Voice", done: voices > 0 },
            { label: "Story", done: stories.length > 0 },
            { label: "Film", done: stories.some((s) => s.status === "complete") },
          ].map((step) => (
            <div key={step.label}>
              {step.done ? <CheckCircle2 /> : <Circle />}
              <span>{step.label}</span>
            </div>
          ))}
        </div>
        {stories[0] ? (
          <Button asChild>
            <Link to="/stories/$id" params={{ id: stories[0].id }}>
              Continue book
              <ArrowRight />
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link to="/stories/new">
              Start a story
              <ArrowRight />
            </Link>
          </Button>
        )}
      </div>
      <section className="mb-10 rounded-3xl border bg-card p-6 shadow-soft md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Globe2 className="h-4 w-4" /> The CyliaTales world layer
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Your story is more than one output.</h2>
            <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
              Build the world once, then carry its identity into every approved page, narration take
              and scene. Nothing is treated as a disposable one-off prompt.
            </p>
          </div>
          <div className="rounded-2xl bg-secondary px-4 py-3 text-sm">
            <span className="font-semibold">Continuity status</span>
            <br />
            <span className="text-muted-foreground">
              {cast > 0 && stories.length > 0
                ? "Cast and story are connected"
                : "Add a cast and story to begin"}
            </span>
          </div>
        </div>
        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <Link
            to="/world"
            className="group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            <Globe2 className="h-5 w-5 text-primary" />
            <h3 className="mt-4 font-semibold">Story World</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {cast + stories.length} continuity anchor{cast + stories.length === 1 ? "" : "s"} across your next production.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Open world desk <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            to="/characters"
            className="group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            <UserRound className="h-5 w-5 text-primary" />
            <h3 className="mt-4 font-semibold">Character atlas</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {cast} approved character{cast === 1 ? "" : "s"} with identity references.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Open atlas <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            to="/stories"
            className="group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            <Layers3 className="h-5 w-5 text-primary" />
            <h3 className="mt-4 font-semibold">Story shelf</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {stories.length} world{stories.length === 1 ? "" : "s"} ready for review, reading or
              revision.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Open shelf <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            to="/labs"
            className="group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
          >
            <PlaySquare className="h-5 w-5 text-primary" />
            <h3 className="mt-4 font-semibold">Motion desk</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Carry an approved page into a planned, narratable scene.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Open motion desk{" "}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>
      <section className="mb-10" aria-labelledby="delivery-suite-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Delivery suite
            </p>
            <h2 id="delivery-suite-title" className="mt-2 text-2xl font-semibold">
              One approved world, six finished ways to share it.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              These are real production surfaces backed by your saved story assets—not teaser cards.
              Open the story editor to review the source before choosing a format.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/labs">
              Open production desk <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              to: "/stories",
              icon: BookMarked,
              title: "Read-aloud book",
              body: "Flip-book reading, saved narration, contents and large type.",
            },
            {
              to: "/labs",
              icon: Film,
              title: "Moving scenes",
              body: "Direct camera movement, duration and motion per approved page.",
            },
            {
              to: "/stories",
              icon: PanelsTopLeft,
              title: "Comic page",
              body: "Build three connected panels from the same cast and art direction.",
            },
            {
              to: "/stories",
              icon: FileImage,
              title: "Poster & cover",
              body: "Create a finished visual identity for the story world.",
            },
            {
              to: "/activities",
              icon: GraduationCap,
              title: "Learning extension",
              body: "Turn the actual story into warm, age-aware activities.",
            },
            {
              to: "/stories",
              icon: Printer,
              title: "Print & archive",
              body: "Deliver a print PDF or a complete asset bundle for safekeeping.",
            },
          ].map(({ to, icon: Icon, title, body }) => (
            <Link
              key={title}
              to={to}
              className="group flex gap-4 rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-semibold">
                  {title}
                  <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">{body}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="rounded-2xl border bg-card p-6 shadow-soft transition hover:-translate-y-0.5"
          >
            <t.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">{t.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.body}</p>
          </Link>
        ))}
      </div>
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link to="/labs">
            <Clapperboard /> Open motion production
          </Link>
        </Button>
      </div>
      <h2 className="mt-12 text-2xl font-semibold">Recent books</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stories.slice(0, 4).map((s) => (
          <BookCard key={s.id} story={s} />
        ))}
        {!stories.length && (
          <p className="text-muted-foreground">No books yet — start your first one.</p>
        )}
      </div>
    </div>
  );
}
