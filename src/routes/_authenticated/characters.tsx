import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { UserRound, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { generateImage } from "@/lib/studio.functions";
import { ART_STYLES, CHARACTER_KINDS } from "@/lib/catalog";
import { uploadBase64, useMediaUrl } from "@/lib/media";
import reference from "@/assets/character-lock.asset.json";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/characters")({
  head: () => ({ meta: [{ title: "Characters — CyliaTales" }, { name: "robots", content: "noindex" }, { name: "description", content: "Build a reusable cast with defined appearance, outfits and color palettes." }, { property: "og:title", content: "Characters — CyliaTales" }, { property: "og:description", content: "Build a reusable cast with defined appearance, outfits and color palettes." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Characters,
});

const EMPTY = { name: "", kind: CHARACTER_KINDS[0] as string, age: "", appearance: "", outfit: "", personality: "", palette: "", art_style: ART_STYLES[0].id as string };

function Characters() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const img = useServerFn(generateImage);
  const [f, setF] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const { data = [] } = useQuery({
    queryKey: ["characters"],
    queryFn: async () => (await supabase.from("characters").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      let portrait_url: string | null = null;
      try {
        const desc = [f.name, f.kind, f.age && `age ${f.age}`, f.appearance, f.outfit, f.palette && `colors ${f.palette}`, f.personality].filter(Boolean).join(", ");
        const { b64 } = await img({ data: { prompt: desc, style: f.art_style, portrait: true } });
        portrait_url = await uploadBase64(user.id, "characters", b64);
      } catch (err) { toast.error(`Portrait failed: ${(err as Error).message}`); }
      const { error } = await supabase.from("characters").insert({ ...f, user_id: user.id, portrait_url });
      if (error) throw error;
      setF(EMPTY);
      qc.invalidateQueries({ queryKey: ["characters"] });
      toast.success("Character added to your cast");
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  }

  const field = (k: keyof typeof EMPTY, label: string, ph = "") => (
    <div className="space-y-1.5"><Label>{label}</Label><Input value={f[k]} placeholder={ph} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
  );

  return (
    <div>
      <PageHeader eyebrow="Library" title="Character builder" subtitle="Design a recurring cast. Define their appearance, outfit and colors for a recurring cast." />
      <div className="mb-8 flex flex-wrap items-center gap-6 border-y py-5"><img src={reference.url} alt="Character design reference showing the same child and fox across multiple poses" className="h-36 w-64 rounded-lg object-contain"/><div><h2 className="font-semibold">One character. Every chapter.</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">Appearance · outfit · color palette</p></div></div>
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <form onSubmit={create} className="space-y-3 rounded-2xl border bg-card p-6">
          <div className="space-y-1.5"><Label>Name</Label><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Kind</Label>
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{CHARACTER_KINDS.map((k) => <option key={k}>{k}</option>)}</select>
          </div>
          {field("age", "Age", "7")}
          {field("appearance", "Appearance", "curly red hair, freckles")}
          {field("outfit", "Outfit", "yellow raincoat, green boots")}
          {field("palette", "Colors", "mustard, teal")}
          {field("personality", "Personality", "curious, brave, a bit clumsy")}
          <div className="space-y-1.5"><Label>Art style</Label>
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={f.art_style} onChange={(e) => setF({ ...f, art_style: e.target.value })}>{ART_STYLES.map((s) => <option key={s.id}>{s.id}</option>)}</select>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Drawing portrait…" : "Create character"}</Button>
        </form>
        <div className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((c) => <CharCard key={c.id} c={c} />)}
          {!data.length && <p className="text-muted-foreground">No characters yet.</p>}
        </div>
      </div>
    </div>
  );
}

function CharCard({ c }: { c: Tables<"characters"> }) {
  const url = useMediaUrl(c.portrait_url);
  const qc = useQueryClient();
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <div className="grid aspect-square place-items-center bg-secondary">
        {url ? <img src={url} alt={c.name} className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-muted-foreground" />}
      </div>
      <div className="flex items-start justify-between gap-2 p-4">
        <div><p className="font-display text-lg">{c.name}</p><p className="text-xs text-muted-foreground">{c.kind}{c.personality ? ` · ${c.personality}` : ""}</p></div>
        <Button variant="ghost" size="icon" aria-label="Delete" onClick={async () => { await supabase.from("characters").delete().eq("id", c.id); qc.invalidateQueries({ queryKey: ["characters"] }); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
