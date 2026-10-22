import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clapperboard, PenLine, UserRound } from "lucide-react";

const WORKSPACES = [
  {
    icon: PenLine,
    eyebrow: "01 · Write",
    title: "Shape the story before anything is rendered",
    body: "Start with a spark, choose the reader's age, tone and length, then review the story plan before making art.",
    link: "/stories/new" as const,
    cta: "Open story writer",
  },
  {
    icon: UserRound,
    eyebrow: "02 · Direct",
    title: "Build characters that stay recognizable",
    body: "Define appearance, outfit, palette and personality. Add a private reference image or sketch, then reuse the approved character across pages.",
    link: "/characters" as const,
    cta: "Open character atelier",
  },
  {
    icon: BookOpen,
    eyebrow: "03 · Illustrate",
    title: "Make the page, not a pile of prompts",
    body: "Generate individual illustrations with your art direction and character references. Replace one page without rebuilding the rest of the book.",
    link: "/stories" as const,
    cta: "View story library",
  },
  {
    icon: Clapperboard,
    eyebrow: "04 · Move",
    title: "Turn approved pages into a storyboard",
    body: "Set the shot, camera movement and action for a scene. Preview the sequence, animate selected scenes and export a shareable film.",
    link: "/labs" as const,
    cta: "Explore production",
  },
];

export function Workspaces() {
  return (
    <section id="workspaces" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          One connected desk
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          From first sentence to final scene.
        </h2>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Each workspace has a clear job, a human checkpoint and a next step you can see.
        </p>
      </div>
      <div className="mt-9 grid gap-4 md:grid-cols-2">
        {WORKSPACES.map(({ icon: Icon, eyebrow, title, body, link, cta }) => (
          <article
            key={title}
            className="group rounded-2xl border bg-card p-5 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {eyebrow}
              </span>
            </div>
            <h3 className="mt-7 max-w-md font-display text-2xl leading-tight">{title}</h3>
            <p className="mt-3 max-w-lg leading-7 text-muted-foreground">{body}</p>
            <Link
              to={link}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:gap-3 motion-reduce:transition-none"
            >
              {cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
