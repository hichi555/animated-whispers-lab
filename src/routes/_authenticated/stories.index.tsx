import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, HeartHandshake, Lightbulb, School, Sparkles } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useMediaUrl } from "@/lib/media";
import ebookStudioThumb from "@/assets/thumbnails/ebook-studio.webp";
import worldBuilderThumb from "@/assets/thumbnails/world-builder.webp";
import printShareThumb from "@/assets/thumbnails/print-share.webp";

export const Route = createFileRoute("/_authenticated/stories/")({
  head: () => ({
    meta: [
      { title: "My books — CyliaTales" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Your private library of original illustrated children’s books.",
      },
      { property: "og:title", content: "My books — CyliaTales" },
      {
        property: "og:description",
        content: "Your private library of original illustrated children’s books.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Books,
});

const STARTERS = [
  { category: "Parents", icon: HeartHandshake, title: "A gentle first day", description: "A child discovers the small rituals that make a new classroom feel safe.", age: "5-7", image: worldBuilderThumb },
  { category: "Teachers", icon: School, title: "My calm-down map", description: "A classroom social story about naming big feelings and choosing a helpful next step.", age: "5-7", image: ebookStudioThumb },
  { category: "Bedtime", icon: Sparkles, title: "The lantern that listened", description: "A quiet nighttime adventure with a soft ending and space for reflection.", age: "3-5", image: printShareThumb },
  { category: "Parents", icon: HeartHandshake, title: "The brave goodbye", description: "A reassuring story for a child learning that goodbyes can have a return.", age: "3-5", image: ebookStudioThumb },
  { category: "Teachers", icon: School, title: "One kind choice", description: "A short, repeatable story about sharing space, materials and attention.", age: "5-7", image: worldBuilderThumb },
  { category: "Bedtime", icon: Sparkles, title: "Moon over the windowsill", description: "A slow, lyrical story for winding down after a full day.", age: "0-3", image: printShareThumb },
];

export function BookCard({ story }: { story: Tables<"stories"> }) {
  const cover = useMediaUrl(story.cover_url);
  return (
    <Link
      to="/stories/$id"
      params={{ id: story.id }}
      className="overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:-translate-y-0.5"
    >
      <div className="grid aspect-[3/2] place-items-center bg-secondary">
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <div className="p-4">
        <p className="font-display text-lg leading-tight">{story.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Ages {story.age_range} · {story.art_style}
        </p>
      </div>
    </Link>
  );
}

function Books() {
  const [starterFilter, setStarterFilter] = useState("All");
  const { data = [], isLoading } = useQuery({
    queryKey: ["stories"],
    queryFn: async () =>
      (await supabase.from("stories").select("*").order("updated_at", { ascending: false })).data ??
      [],
  });
  return (
    <div>
      <PageHeader
        eyebrow="Library"
        title="My books"
        actions={
          <Button asChild>
            <Link to="/stories/new">New story</Link>
          </Button>
        }
      />
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !data.length ? (
        <p className="text-muted-foreground">Your shelf is empty. Create your first book!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((s) => (
            <BookCard key={s.id} story={s} />
          ))}
        </div>
      )}
      <section className="mt-14 border-t pt-8" aria-labelledby="story-starters-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary"><Lightbulb className="h-4 w-4" /> Inspiration shelf</p><h2 id="story-starters-title" className="mt-2 text-2xl font-semibold">Start from a real moment</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Situation-specific prompts for parents, teachers and bedtime reading. Customize the child, place and ending before anything is generated.</p></div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Story starter categories">
            {["All", "Parents", "Teachers", "Bedtime"].map((category) => <Button key={category} size="sm" variant={starterFilter === category ? "default" : "outline"} onClick={() => setStarterFilter(category)}>{category}</Button>)}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STARTERS.filter((starter) => starterFilter === "All" || starter.category === starterFilter).map((starter) => { const Icon = starter.icon; return <article key={starter.title} className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"><img src={starter.image} alt="" className="h-36 w-full object-cover transition duration-500 group-hover:scale-105" /><div className="p-4"><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary"><Icon className="h-3.5 w-3.5" /> {starter.category}</span><span className="text-xs text-muted-foreground">Ages {starter.age}</span></div><h3 className="mt-3 font-display text-lg">{starter.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{starter.description}</p><Button className="mt-4 w-full" variant="outline" asChild><Link to="/stories/new" search={{ idea: starter.description, age: starter.age }}>Use this starting point</Link></Button></div></article>; })}
        </div>
      </section>
    </div>
  );
}
