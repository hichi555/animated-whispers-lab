import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useMediaUrl } from "@/lib/media";

export const Route = createFileRoute("/_authenticated/stories/")({
  head: () => ({ meta: [{ title: "My books — CyliaTales" }, { name: "robots", content: "noindex" }, { name: "description", content: "Your private library of original illustrated children’s books." }, { property: "og:title", content: "My books — CyliaTales" }, { property: "og:description", content: "Your private library of original illustrated children’s books." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Books,
});

export function BookCard({ story }: { story: Tables<"stories"> }) {
  const cover = useMediaUrl(story.cover_url);
  return (
    <Link to="/stories/$id" params={{ id: story.id }} className="overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:-translate-y-0.5">
      <div className="grid aspect-[3/2] place-items-center bg-secondary">
        {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <BookOpen className="h-8 w-8 text-muted-foreground" />}
      </div>
      <div className="p-4">
        <p className="font-display text-lg leading-tight">{story.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">Ages {story.age_range} · {story.art_style}</p>
      </div>
    </Link>
  );
}

function Books() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => (await supabase.from("stories").select("*").order("updated_at", { ascending: false })).data ?? [],
  });
  return (
    <div>
      <PageHeader eyebrow="Library" title="My books" actions={<Button asChild><Link to="/stories/new">New story</Link></Button>} />
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : !data.length ? (
        <p className="text-muted-foreground">Your shelf is empty. Create your first book!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.map((s) => <BookCard key={s.id} story={s} />)}</div>
      )}
    </div>
  );
}
