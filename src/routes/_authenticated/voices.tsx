import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Play } from "lucide-react";
import { narrate } from "@/lib/studio.functions";
import { VOICES } from "@/lib/catalog";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/voices")({
  head: () => ({ meta: [{ title: "Voices — CyliaTales" }, { name: "robots", content: "noindex" }, { name: "description", content: "Explore categorized narrator voices for your children’s books." }, { property: "og:title", content: "Voices — CyliaTales" }, { property: "og:description", content: "Explore categorized narrator voices for your children’s books." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Voices,
});

function Voices() {
  const speak = useServerFn(narrate);
  const [busy, setBusy] = useState<string | null>(null);
  async function preview(id: string, engine: string) {
    setBusy(id);
    try {
      const { b64, mime } = await speak({ data: { text: `Hello, I'm ${id}. Once upon a time, in a village at the edge of the woods…`, voice: engine } });
      new Audio(`data:${mime};base64,${b64}`).play().catch(() => {});
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(null); }
  }
  const cats = [...new Set(VOICES.map((v) => v.category))];
  return (
    <div>
      <PageHeader eyebrow="Library" title="Voice library" subtitle="Original narrator voices, ready for any book." />
      {cats.map((cat) => (
        <section key={cat} className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">{cat}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VOICES.filter((v) => v.category === cat).map((v) => (
              <div key={v.id} className="rounded-2xl border bg-card p-5 shadow-soft">
                <p className="font-display text-xl">{v.id}</p>
                <p className="text-sm text-muted-foreground">{v.mood}</p>
                <p className="mt-2 text-xs text-muted-foreground">Best for: {v.best}</p>
                <Button size="sm" variant="outline" className="mt-4" disabled={!!busy} onClick={() => preview(v.id, v.engine)}>
                  <Play className="h-4 w-4" /> {busy === v.id ? "Loading…" : "Preview"}
                </Button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
