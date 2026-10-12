import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMediaUrl } from "@/lib/media";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore stories — CyliaTales" },
      { name: "description", content: "Read published story worlds created in CyliaTales." },
    ],
  }),
  component: Explore,
});

function Explore() {
  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["public-stories"],
    queryFn: async () =>
      (
        await supabase
          .from("stories")
          .select("id,title,cover_url,age_range,art_style,published_at")
          .eq("visibility", "public")
          .order("published_at", { ascending: false })
          .limit(48)
      ).data ?? [],
  });
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12 lg:px-8">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← CyliaTales
      </Link>
      <div className="mt-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          The public shelf
        </p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight">
          Stories with a world behind them.
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          Read published books from CyliaTales creators. Every story stays connected to its approved
          cast, visual direction and reading experience.
        </p>
      </div>
      {isLoading ? (
        <p className="mt-12 text-muted-foreground">Loading published stories…</p>
      ) : stories.length === 0 ? (
        <div className="mt-12 rounded-3xl border bg-card p-10 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-4 text-xl font-semibold">The shelf is waiting for its first story.</h2>
          <p className="mt-2 text-muted-foreground">
            Publish a finished CyliaTales book to make it available here.
          </p>
        </div>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stories.map((story) => (
            <PublicStoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </main>
  );
}
function PublicStoryCard({
  story,
}: {
  story: {
    id: string;
    title: string;
    cover_url: string | null;
    age_range: string;
    art_style: string;
  };
}) {
  const cover = useMediaUrl(story.cover_url);
  return (
    <Link
      to="/explore/$id"
      params={{ id: story.id }}
      className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[4/5] bg-secondary">
        {cover ? (
          <img src={cover} alt={`${story.title} cover`} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center font-display text-xl">
            {story.title}
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="font-semibold">{story.title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Ages {story.age_range} · {story.art_style}
        </p>
        <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Read story <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
