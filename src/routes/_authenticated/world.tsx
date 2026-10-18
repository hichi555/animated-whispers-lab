import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Crown,
  Gem,
  Map,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ART_DIRECTION_BOARDS } from "@/lib/art-direction";

export const Route = createFileRoute("/_authenticated/world")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Story World — CyliaTales" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Keep your cast, places, props and visual language consistent across every format.",
      },
    ],
  }),
  component: StoryWorld,
});

type LedgerItem = {
  id: string;
  name: string;
  kind: "place" | "prop";
  purpose: string;
  anchor: string;
};

const STORAGE_KEY = "cyliatales.world-ledger.v1";
const DEFAULT_BOARD = ART_DIRECTION_BOARDS[0];

function StoryWorld() {
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [kind, setKind] = useState<LedgerItem["kind"]>("place");
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [anchor, setAnchor] = useState("");
  const [filter, setFilter] = useState("");

  const { data: stories = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: async () =>
      (await supabase.from("stories").select("id,title,status,art_style").order("updated_at", { ascending: false })).data ?? [],
  });
  const { data: characters = [] } = useQuery({
    queryKey: ["characters"],
    queryFn: async () =>
      (await supabase.from("characters").select("id,name,portrait_url,art_style,outfit").order("created_at", { ascending: false })).data ?? [],
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLedger(JSON.parse(raw) as LedgerItem[]);
    } catch {
      toast.error("The continuity ledger could not be loaded.");
    }
  }, []);

  const activeBoard = useMemo(() => {
    const preferred = window.localStorage.getItem("cyliatales.preferences.v1");
    if (!preferred) return DEFAULT_BOARD;
    try {
      const id = JSON.parse(preferred).artDirection;
      return ART_DIRECTION_BOARDS.find((board) => board.id === id) ?? DEFAULT_BOARD;
    } catch {
      return DEFAULT_BOARD;
    }
  }, []);

  const filtered = ledger.filter((item) =>
    `${item.name} ${item.purpose} ${item.anchor}`.toLowerCase().includes(filter.toLowerCase()),
  );
  const places = ledger.filter((item) => item.kind === "place").length;
  const props = ledger.filter((item) => item.kind === "prop").length;
  const checks = [
    { label: "At least one recurring character", done: characters.length > 0 },
    { label: "A visual direction is selected", done: Boolean(activeBoard) },
    { label: "A story is in the shelf", done: stories.length > 0 },
    { label: "Places and props are named", done: ledger.length > 0 },
  ];
  const health = Math.round((checks.filter((check) => check.done).length / checks.length) * 100);

  function addItem(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !purpose.trim() || !anchor.trim()) {
      toast.error("Give this world asset a name, purpose and visual anchor.");
      return;
    }
    const next = [
      { id: crypto.randomUUID(), name: name.trim(), kind, purpose: purpose.trim(), anchor: anchor.trim() },
      ...ledger,
    ];
    setLedger(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setName("");
    setPurpose("");
    setAnchor("");
    toast.success(`${kind === "place" ? "Place" : "Prop"} added to the continuity ledger.`);
  }

  function removeItem(id: string) {
    const next = ledger.filter((item) => item.id !== id);
    setLedger(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Story World"
        title="Build the world once. Keep it true everywhere."
        subtitle="The continuity desk keeps the cast, places, props and visual language in view before you turn a story into pages, audio or motion."
        actions={
          <Button asChild>
            <Link to="/stories/new">
              <WandSparkles /> Start a story
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-3xl border bg-card shadow-soft">
          <div className="flex items-start justify-between gap-5 border-b p-6 md:p-8">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <Compass className="h-4 w-4" /> Continuity health
              </p>
              <h2 className="mt-3 font-display text-3xl">{health}% ready for a connected production</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                A strong world bible reduces drift when the same hero returns in a new chapter, language or format.
              </p>
            </div>
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-8 border-secondary text-sm font-bold text-primary">
              {health}
            </div>
          </div>
          <div className="grid gap-3 p-6 md:grid-cols-2 md:p-8">
            {checks.map((check) => (
              <div key={check.label} className="flex items-center gap-3 rounded-xl border bg-background/60 p-3 text-sm">
                <span className={`grid h-7 w-7 place-items-center rounded-full ${check.done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {check.done ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                </span>
                <span className={check.done ? "font-medium" : "text-muted-foreground"}>{check.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border bg-sidebar p-6 text-sidebar-foreground shadow-soft md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/60">Current visual language</p>
          <div className="mt-5 overflow-hidden rounded-2xl border border-sidebar-border">
            <img src={activeBoard.image} alt="" className="aspect-[16/9] w-full object-cover" />
          </div>
          <p className="mt-4 font-display text-2xl">{activeBoard.name}</p>
          <p className="mt-1 text-sm text-sidebar-foreground/65">{activeBoard.medium}</p>
          <Link to="/settings" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sidebar-primary">
            Adjust art direction <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <form onSubmit={addItem} className="rounded-3xl border bg-card p-6 shadow-soft md:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><Plus className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">World asset</p>
              <h2 className="font-display text-2xl">Add to the ledger</h2>
            </div>
          </div>
          <div className="mt-6 flex gap-2 rounded-xl bg-secondary p-1">
            {(["place", "prop"] as const).map((option) => (
              <button key={option} type="button" onClick={() => setKind(option)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold capitalize transition ${kind === option ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {option}
              </button>
            ))}
          </div>
          <div className="mt-5 space-y-4">
            <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === "place" ? "The Tideglass Pier" : "Mira's copper compass"} /></div>
            <div className="space-y-1.5"><Label>Story purpose</Label><Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Where the turning point happens" /></div>
            <div className="space-y-1.5"><Label>Visual anchor</Label><Input value={anchor} onChange={(e) => setAnchor(e.target.value)} placeholder="Wet blue boards, brass lamps, sea fog" /></div>
          </div>
          <Button type="submit" className="mt-6 w-full"><Plus /> Add {kind}</Button>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">Saved to this studio browser as a continuity note. It will be carried into the next production brief.</p>
        </form>

        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">World bible</p><h2 className="mt-2 font-display text-3xl">{characters.length + places + props} continuity anchors</h2><p className="mt-1 text-sm text-muted-foreground">{characters.length} cast · {places} places · {props} props</p></div>
            <label className="relative block w-full sm:w-64"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-9" placeholder="Find an anchor…" /></label>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {characters.map((character) => <div key={character.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-soft"><span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary"><UserRound className="h-5 w-5" /></span><span className="min-w-0"><span className="block truncate font-semibold">{character.name}</span><span className="mt-1 block truncate text-xs text-muted-foreground">Character · {character.outfit || character.art_style || "Identity reference"}</span></span><Crown className="ml-auto h-4 w-4 shrink-0 text-primary" /></div>)}
            {filtered.map((item) => <div key={item.id} className="rounded-2xl border bg-card p-4 shadow-soft"><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">{item.kind === "place" ? <Map className="h-5 w-5" /> : <Gem className="h-5 w-5" />}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{item.name}</p><p className="text-xs capitalize text-muted-foreground">{item.kind}</p></div><button type="button" onClick={() => removeItem(item.id)} className="text-muted-foreground transition hover:text-destructive" aria-label={`Remove ${item.name}`}><Trash2 className="h-4 w-4" /></button></div><p className="mt-3 text-sm leading-5">{item.purpose}</p><p className="mt-2 text-xs leading-5 text-muted-foreground"><span className="font-semibold text-foreground">Anchor:</span> {item.anchor}</p></div></div></div>)}
            {!characters.length && !filtered.length && <div className="col-span-full rounded-2xl border border-dashed p-8 text-center"><Sparkles className="mx-auto h-6 w-6 text-primary" /><p className="mt-3 font-semibold">Your world is still open.</p><p className="mt-1 text-sm text-muted-foreground">Add your first character, place or prop to give the next story something solid to return to.</p></div>}
          </div>
        </div>
      </section>

      <section className="grid gap-3 border-t pt-8 sm:grid-cols-3">
        <Link to="/characters" className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40"><UserRound className="h-5 w-5 text-primary" /><p className="mt-4 font-semibold">Character atlas</p><p className="mt-1 text-sm text-muted-foreground">Lock face, outfit, palette and voice.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Open atlas <ArrowRight className="h-4 w-4 group-hover:translate-x-1" /></span></Link>
        <Link to="/stories" className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40"><BookOpen className="h-5 w-5 text-primary" /><p className="mt-4 font-semibold">Story shelf</p><p className="mt-1 text-sm text-muted-foreground">Carry this world into a new chapter.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Open shelf <ArrowRight className="h-4 w-4 group-hover:translate-x-1" /></span></Link>
        <Link to="/labs" className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40"><Sparkles className="h-5 w-5 text-primary" /><p className="mt-4 font-semibold">Motion desk</p><p className="mt-1 text-sm text-muted-foreground">Direct the next scene without losing identity.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Open production <ArrowRight className="h-4 w-4 group-hover:translate-x-1" /></span></Link>
      </section>
    </div>
  );
}
