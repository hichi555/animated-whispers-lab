import { createFileRoute } from "@tanstack/react-router";
import { Clapperboard, Box, AudioLines } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/labs")({
  head: () => ({ meta: [{ title: "Labs — CyliaTales" }, { name: "robots", content: "noindex" }, { name: "description", content: "Advanced storytelling features in development." }, { property: "og:title", content: "Labs — CyliaTales" }, { property: "og:description", content: "Advanced storytelling features in development." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Labs,
});

const ITEMS = [
  { icon: Clapperboard, title: "Video stories", body: "Turn a finished book into a narrated, animated short." },
  { icon: Box, title: "3D characters", body: "Sculpt, pose and turn your cast in three dimensions." },
  { icon: AudioLines, title: "Consented voice cloning", body: "Narrate in your own voice. Requires a recorded consent statement from the voice owner — no celebrity or third-party voices." },
];

function Labs() {
  return (
    <div>
      <PageHeader eyebrow="Labs" title="Coming soon" subtitle="What we're building next for your studio." />
      <div className="grid gap-4 md:grid-cols-3">
        {ITEMS.map((i) => (
          <div key={i.title} className="rounded-2xl border border-dashed bg-secondary/50 p-6">
            <i.icon className="h-6 w-6 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">{i.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{i.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
