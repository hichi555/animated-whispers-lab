import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { UserRound, Trash2, Upload, WandSparkles, LockKeyhole, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { generateImage } from "@/lib/studio.functions";
import { ART_STYLES, CHARACTER_KINDS } from "@/lib/catalog";
import { uploadBase64, uploadFile, useMediaUrl } from "@/lib/media";
import reference from "@/assets/character-lock.asset.json";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/characters")({
  head: () => ({
    meta: [
      { title: "Characters — CyliaTales" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Build a reusable cast with defined appearance, outfits and color palettes.",
      },
      { property: "og:title", content: "Characters — CyliaTales" },
      {
        property: "og:description",
        content: "Build a reusable cast with defined appearance, outfits and color palettes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Characters,
});

const EMPTY = {
  name: "",
  kind: CHARACTER_KINDS[0] as string,
  age: "",
  appearance: "",
  outfit: "",
  personality: "",
  palette: "",
  art_style: ART_STYLES[0].id as string,
  face_shape: "Soft oval",
  body_shape: "Balanced",
  hair_style: "",
  expression: "Warm smile",
  silhouette: "Natural",
};

function Characters() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const img = useServerFn(generateImage);
  const [f, setF] = useState(EMPTY);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { data = [] } = useQuery({
    queryKey: ["characters"],
    queryFn: async () =>
      (await supabase.from("characters").select("*").order("created_at", { ascending: false }))
        .data ?? [],
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      let portrait_url: string | null = null;
      let reference_url: string | null = null;
      if (referenceFile)
        reference_url = await uploadFile(user.id, "character-references", referenceFile);
      try {
        const desc = [
          f.name,
          f.kind,
          f.age && `age ${f.age}`,
          f.face_shape && `${f.face_shape} face`,
          f.body_shape && `${f.body_shape} build`,
          f.hair_style,
          f.expression,
          f.silhouette && `${f.silhouette} silhouette`,
          f.appearance,
          f.outfit,
          f.palette && `fixed colors ${f.palette}`,
          f.personality,
          referenceFile && "use the uploaded portrait as the identity reference",
        ]
          .filter(Boolean)
          .join(", ");
        const { b64 } = await img({
          data: {
            prompt: desc,
            style: f.art_style,
            portrait: true,
            referencePaths: reference_url ? [reference_url] : [],
          },
        });
        portrait_url = await uploadBase64(user.id, "characters", b64);
      } catch (err) {
        toast.error(`Portrait failed: ${(err as Error).message}`);
      }
      const { error } = await supabase
        .from("characters")
        .insert({ ...f, user_id: user.id, portrait_url, reference_url });
      if (error) throw error;
      setF(EMPTY);
      setReferenceFile(null);
      qc.invalidateQueries({ queryKey: ["characters"] });
      toast.success("Character added to your cast");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const field = (k: keyof typeof EMPTY, label: string, ph = "") => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={f[k]} placeholder={ph} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
    </div>
  );

  return (
    <div>
      <PageHeader
        eyebrow="Character atelier"
        title="Shape a cast readers remember"
        subtitle="Define identity, silhouette and wardrobe, then generate a reusable character portrait."
      />
      <div className="mb-8 flex flex-wrap items-center gap-6 border-y py-5">
        <img
          src={reference.url}
          alt="Character design reference showing the same child and fox across multiple poses"
          className="h-36 w-64 rounded-lg object-contain"
        />
        <div>
          <h2 className="font-semibold">One character. Every chapter.</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Appearance · outfit · color palette
          </p>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <form onSubmit={create} className="character-workbench space-y-4 border bg-card p-6">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Kind</Label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={f.kind}
              onChange={(e) => setF({ ...f, kind: e.target.value })}
            >
              {CHARACTER_KINDS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>
          {field("age", "Age", "7")}
          <div className="grid grid-cols-2 gap-3">
            {field("face_shape", "Face", "Soft oval")}
            {field("body_shape", "Build", "Small and sturdy")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field("hair_style", "Hair or features", "Long black braids")}
            {field("expression", "Expression", "Bright, curious")}
          </div>
          {field("silhouette", "Silhouette", "Oversized coat, small boots")}
          {field("appearance", "Appearance", "curly red hair, freckles")}
          {field("outfit", "Outfit", "yellow raincoat, green boots")}
          {field("palette", "Colors", "mustard, teal")}
          {field("personality", "Personality", "curious, brave, a bit clumsy")}
          <div className="space-y-1.5">
            <Label>Art style</Label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={f.art_style}
              onChange={(e) => setF({ ...f, art_style: e.target.value })}
            >
              {ART_STYLES.map((s) => (
                <option key={s.id}>{s.id}</option>
              ))}
            </select>
          </div>
          <input
            ref={fileInput}
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setReferenceFile(event.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInput.current?.click()}
          >
            <Upload />
            {referenceFile ? referenceFile.name : "Add identity reference"}
          </Button>
          <Button type="submit" className="w-full" disabled={busy}>
            <WandSparkles />
            {busy ? "Building character…" : "Create character sheet"}
          </Button>
        </form>
        <div className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((c) => (
            <CharCard key={c.id} c={c} />
          ))}
          {!data.length && <p className="text-muted-foreground">No characters yet.</p>}
        </div>
      </div>
    </div>
  );
}

function CharCard({ c }: { c: Tables<"characters"> }) {
  const url = useMediaUrl(c.portrait_url);
  const referenceUrl = useMediaUrl(c.reference_url);
  const qc = useQueryClient();
  const { data: voices = [] } = useQuery({
    queryKey: ["voice-profiles"],
    queryFn: async () =>
      (await supabase.from("voice_profiles").select("id,name").order("name")).data ?? [],
  });
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <div className="relative grid aspect-square place-items-center bg-secondary">
        {url ? (
          <img src={url} alt={c.name} className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-10 w-10 text-muted-foreground" />
        )}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/70 bg-card/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary shadow-sm">
          <LockKeyhole className="h-3 w-3" /> Identity locked
        </div>
        {referenceUrl && (
          <div
            className="absolute bottom-3 right-3 grid h-12 w-12 overflow-hidden rounded-lg border-2 border-white bg-card shadow-md"
            title="Private identity reference"
          >
            <img src={referenceUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg">{c.name}</p>
          <p className="text-xs text-muted-foreground">
            {c.kind}
            {c.personality ? ` · ${c.personality}` : ""}
          </p>
          <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-primary" />{" "}
              {c.palette || "Palette not specified"}
            </span>
            <span className="truncate">
              {[c.face_shape, c.hair_style, c.outfit].filter(Boolean).join(" · ") ||
                "Add visual traits to strengthen continuity"}
            </span>
          </div>
          <Label htmlFor={`voice-${c.id}`} className="mt-4 block text-xs">
            Character voice
          </Label>
          <select
            id={`voice-${c.id}`}
            className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
            value={c.voice_profile_id ?? ""}
            onChange={async (event) => {
              const { error } = await supabase
                .from("characters")
                .update({ voice_profile_id: event.target.value || null })
                .eq("id", c.id);
              if (error) toast.error(error.message);
              else {
                await qc.invalidateQueries({ queryKey: ["characters"] });
                toast.success("Character voice updated");
              }
            }}
          >
            <option value="">Story narrator</option>
            {voices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete"
          onClick={async () => {
            await supabase.from("characters").delete().eq("id", c.id);
            qc.invalidateQueries({ queryKey: ["characters"] });
          }}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
