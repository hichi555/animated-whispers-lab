import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookReader } from "@/components/BookReader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/explore/$id")({
  head: () => ({ meta: [{ title: "Read story — CyliaTales" }] }),
  component: PublicReader,
});
function PublicReader() {
  const { id } = Route.useParams();
  const { data: story } = useQuery({
    queryKey: ["public-story", id],
    queryFn: async () =>
      (await supabase.from("stories").select("*").eq("id", id).eq("visibility", "public").single())
        .data,
  });
  const { data: pages = [] } = useQuery({
    queryKey: ["public-pages", id],
    enabled: Boolean(story),
    queryFn: async () =>
      (await supabase.from("story_pages").select("*").eq("story_id", id).order("page_number"))
        .data ?? [],
  });
  if (!story)
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/explore" className="text-sm text-muted-foreground">
          ← Explore stories
        </Link>
        <p className="mt-8 text-muted-foreground">Opening published story…</p>
      </main>
    );
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <Link to="/explore" className="text-sm text-muted-foreground">
          ← Explore stories
        </Link>
      </div>
      <BookReader
        title={story.title}
        pages={pages}
        storyId={story.id}
        coverPath={story.cover_url}
        onIllustrate={() => undefined}
        drawingPage={null}
        onClose={() => undefined}
      />
    </main>
  );
}
