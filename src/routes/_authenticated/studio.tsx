import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, PenTool, UserRound, Mic, Clapperboard, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { BookCard } from "./stories.index";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({ meta: [{ title: "Studio — CyliaTales" }, { name: "robots", content: "noindex" }, { name: "description", content: "Create, illustrate and narrate original children’s books in your CyliaTales studio." }, { property: "og:title", content: "Studio — CyliaTales" }, { property: "og:description", content: "Create, illustrate and narrate original children’s books in your CyliaTales studio." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Studio,
});

function Studio() {
  const { data: stories = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => (await supabase.from("stories").select("*").order("updated_at", { ascending: false })).data ?? [],
  });
  const { data: cast = 0 } = useQuery({
    queryKey: ["characters-count"],
    queryFn: async () => (await supabase.from("characters").select("id", { count: "exact", head: true })).count ?? 0,
  });
  const { data: voices = 0 } = useQuery({
    queryKey: ["voice-count"],
    queryFn: async () => (await supabase.from("voice_profiles").select("id", { count: "exact", head: true })).count ?? 0,
  });
  const tiles = [
    { to: "/stories/new", icon: PenTool, title: "Write a new book", body: "Idea, age, theme, style — we draft it." },
    { to: "/characters", icon: UserRound, title: `Characters (${cast})`, body: "Build a recurring cast." },
    { to: "/voices", icon: Mic, title: "Voice library", body: "Pick a narrator for your book." },
    { to: "/stories", icon: BookOpen, title: `My books (${stories.length})`, body: "Open, edit and read aloud." },
  ] as const;
  return (
    <div>
      <PageHeader eyebrow="Studio" title="Your story studio" actions={<Button asChild><Link to="/stories/new">New story</Link></Button>} />
      <div className="production-desk mb-8 border-y py-7"><div><p className="text-xs font-semibold uppercase text-primary">On your desk</p><h2 className="mt-2 text-2xl font-semibold">{stories[0]?.title ?? "Your next story starts here"}</h2><p className="mt-2 max-w-xl text-sm text-muted-foreground">{stories[0] ? `Ages ${stories[0].age_range} · ${stories[0].art_style} · ${stories[0].voice}` : "Books, characters and voices"}</p></div><div className="production-steps">{[{label:"Cast",done:cast>0},{label:"Voice",done:voices>0},{label:"Story",done:stories.length>0},{label:"Film",done:stories.some(s=>s.status==="complete")}].map((step)=><div key={step.label}>{step.done?<CheckCircle2/>:<Circle/>}<span>{step.label}</span></div>)}</div>{stories[0] ? <Button asChild><Link to="/stories/$id" params={{id:stories[0].id}}>Continue book<ArrowRight/></Link></Button> : <Button asChild><Link to="/stories/new">Start a story<ArrowRight/></Link></Button>}</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="rounded-2xl border bg-card p-6 shadow-soft transition hover:-translate-y-0.5">
            <t.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">{t.title}</h3>
          </Link>
        ))}
      </div>
      <div className="mt-4"><Button asChild variant="outline"><Link to="/labs"><Clapperboard/>Open film production</Link></Button></div>
      <h2 className="mt-12 text-2xl font-semibold">Recent books</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stories.slice(0, 4).map((s) => <BookCard key={s.id} story={s} />)}
        {!stories.length && <p className="text-muted-foreground">No books yet — start your first one.</p>}
      </div>
    </div>
  );
}
