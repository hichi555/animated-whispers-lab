import { createFileRoute } from "@tanstack/react-router";
import { Clapperboard, Camera, AudioLines, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/labs")({
  head: () => ({ meta: [{ title: "Labs — CyliaTales" }, { name: "robots", content: "noindex" }, { name: "description", content: "Advanced storytelling features in development." }, { property: "og:title", content: "Labs — CyliaTales" }, { property: "og:description", content: "Advanced storytelling features in development." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Labs,
});

const ITEMS = [
  { icon: Clapperboard, title: "Storyboard", body: "Set the script, illustration and sequence for every shot.", to: "/stories" as const, action: "Open a book" },
  { icon: Camera, title: "Character direction", body: "Shape faces, silhouettes, wardrobe, expression and identity references.", to: "/characters" as const, action: "Build a character" },
  { icon: AudioLines, title: "Voice direction", body: "Create a private, consented narrator and use it throughout a book.", to: "/voices" as const, action: "Open voice studio" },
];

function Labs() {
  return (
    <div>
      <PageHeader eyebrow="Production" title="Direct every part of the story" subtitle="Your connected workspace for cast, narration, storyboards and final delivery." />
      <div className="grid gap-4 md:grid-cols-3">
        {ITEMS.map((i) => (
          <div key={i.title} className="production-card border bg-card p-6">
            <i.icon className="h-6 w-6 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">{i.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{i.body}</p>
            <Button variant="link" className="mt-5 px-0" asChild><Link to={i.to}>{i.action}<ArrowRight/></Link></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
