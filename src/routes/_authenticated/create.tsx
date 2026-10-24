import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  AudioLines,
  BookOpenText,
  CheckCircle2,
  Clapperboard,
  FileAudio,
  ImagePlus,
  LibraryBig,
  Mic2,
  Orbit,
  Play,
  ScanFace,
  Search,
  Sparkles,
  UserRound,
  Video,
  WandSparkles,
  Waves,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MODEL_CATALOG, CAPABILITY_META, type ModelCapability } from "@/lib/model-catalog";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({
    meta: [
      { title: "AI Create — CyliaAI" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Create books, audiobooks, avatars, anime scenes and media with one professional AI production layer.",
      },
    ],
  }),
  component: CreateHub,
});

type CreationCard = {
  icon: typeof BookOpenText;
  eyebrow: string;
  title: string;
  body: string;
  tone: string;
  cta: string;
  to?: "/stories/new" | "/voices" | "/characters" | "/labs" | "/world";
  onClick?: () => void;
};

const CREATION_CARDS: CreationCard[] = [
  {
    icon: BookOpenText,
    eyebrow: "Book Auto AI Quality",
    title: "Professional ebook studio",
    body: "Turn a brief into a structured, illustrated ebook with editorial review, continuity controls and a ready-to-share reading experience.",
    tone: "from-amber-50 to-orange-100/70",
    cta: "Open book writer",
    to: "/stories/new",
  },
  {
    icon: AudioLines,
    eyebrow: "ElevenLabs engine",
    title: "Audiobook narrator",
    body: "Create human-like narration, sync it page by page, and keep voice direction, pacing and consent visible throughout production.",
    tone: "from-sky-50 to-indigo-100/70",
    cta: "Open voice studio",
    to: "/voices",
  },
  {
    icon: ScanFace,
    eyebrow: "Character identity",
    title: "Avatar generator",
    body: "Design a consistent character or presenter, define their visual identity, and hand off the approved look to video and lip-sync.",
    tone: "from-rose-50 to-fuchsia-100/70",
    cta: "Open character atelier",
    to: "/characters",
  },
  {
    icon: WandSparkles,
    eyebrow: "Anime & motion",
    title: "Anime studio",
    body: "Direct a visual style, generate scene boards, and move from image-to-video with a clear shot list rather than a black-box prompt.",
    tone: "from-violet-50 to-purple-100/70",
    cta: "Open production desk",
    to: "/labs",
  },
  {
    icon: LibraryBig,
    eyebrow: "4K / 3D library",
    title: "Media stock",
    body: "Organize references, approved art, 4K stills and 3D-ready visual ingredients around the world you are producing.",
    tone: "from-emerald-50 to-teal-100/70",
    cta: "Browse story world",
    to: "/world",
  },
  {
    icon: Waves,
    eyebrow: "Performance layer",
    title: "Lip-sync & performance",
    body: "Align dialogue, mouth movement and timing for speaking avatars, narrated clips and character-led scenes.",
    tone: "from-slate-50 to-cyan-100/70",
    cta: "Plan a scene",
    to: "/labs",
  },
];

const CAPABILITY_ORDER: ModelCapability[] = ["text", "image", "audio", "video", "avatar", "lip-sync"];

function CreateHub() {
  const [activeCapability, setActiveCapability] = useState<ModelCapability | "all">("all");
  const [search, setSearch] = useState("");
  const filteredModels = useMemo(
    () =>
      MODEL_CATALOG.filter((model) => {
        const matchesCapability = activeCapability === "all" || model.capability === activeCapability;
        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          `${model.name} ${model.provider} ${model.note}`.toLowerCase().includes(query);
        return matchesCapability && matchesSearch;
      }),
    [activeCapability, search],
  );

  return (
    <div className="create-hub pb-10">
      <PageHeader
        eyebrow="CyliaAI / AI Create"
        title="One creative OS. Every finished format."
        subtitle="Choose a production lane, keep human review in the loop, and let CyliaAI route the right model for the job—from a premium ebook to a narrated anime scene."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/labs">
                <Clapperboard /> Production desk
              </Link>
            </Button>
            <Button asChild>
              <Link to="/stories/new">
                <Sparkles /> Start a creation
              </Link>
            </Button>
          </div>
        }
      />

      <section className="create-hero mt-8 overflow-hidden rounded-[1.75rem] border bg-primary p-6 text-primary-foreground shadow-soft md:p-9">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <Orbit className="h-4 w-4" /> The CyliaAI production layer
            </p>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">
              From raw idea to a world your audience can read, hear and see.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-primary-foreground/75 md:text-base">
              Every output stays connected to the same brief, cast, visual direction and approval gates. That is how quality compounds instead of fragmenting across tools.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/stories/new"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground transition hover:brightness-105"
              >
                Build a professional ebook <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/voices"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-primary-foreground/25 px-4 text-sm font-semibold transition hover:bg-primary-foreground/10"
              >
                <AudioLines className="h-4 w-4" /> Narrate with ElevenLabs
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: CheckCircle2, label: "Review-first", detail: "Nothing publishes unseen." },
              { icon: Zap, label: "Model routing", detail: "Best fit for each stage." },
              { icon: LockShield, label: "Private by default", detail: "Your world stays yours." },
            ].map(({ icon: Icon, label, detail }) => (
              <div key={label} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-4 backdrop-blur-sm">
                <Icon className="h-5 w-5 text-accent" />
                <p className="mt-4 text-sm font-semibold">{label}</p>
                <p className="mt-1 text-xs text-primary-foreground/65">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="creation-lanes-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Creation lanes</p>
            <h2 id="creation-lanes-title" className="mt-2 text-2xl font-semibold md:text-3xl">Make the thing you actually want to ship.</h2>
          </div>
          <p className="max-w-md text-right text-sm leading-6 text-muted-foreground">Each lane has a clear artifact, review state and next production step.</p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CREATION_CARDS.map(({ icon: Icon, eyebrow, title, body, tone, cta, to, onClick }) => (
            <article key={title} className={`group flex min-h-[248px] flex-col rounded-2xl border bg-gradient-to-br ${tone} p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lg`}>
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/75 text-primary shadow-sm"><Icon className="h-5 w-5" /></span>
                <span className="rounded-full bg-white/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/60">Ready</span>
              </div>
              <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/75">{eyebrow}</p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{body}</p>
              {to ? (
                <Link to={to} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:gap-3">{cta} <ArrowRight className="h-4 w-4" /></Link>
              ) : (
                <button type="button" onClick={onClick} className="mt-5 inline-flex items-center gap-2 text-left text-sm font-semibold text-primary">{cta} <ArrowRight className="h-4 w-4" /></button>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border bg-card p-6 shadow-soft md:p-7" aria-labelledby="model-router-title">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary"><Sparkles className="h-4 w-4" /> Model router</p>
            <h2 id="model-router-title" className="mt-2 text-2xl font-semibold">A professional stack, not a provider maze.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">CyliaAI keeps model choices in a routing layer so your workflow stays stable as providers evolve. The selected model is always visible at the review gate.</p>
          </div>
          <div className="rounded-xl bg-secondary px-4 py-3 text-sm"><span className="font-semibold">{MODEL_CATALOG.length} models mapped</span><br /><span className="text-muted-foreground">Across 14 providers</span></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button size="sm" variant={activeCapability === "all" ? "default" : "outline"} onClick={() => setActiveCapability("all")}>All models</Button>
          {CAPABILITY_ORDER.map((capability) => <Button key={capability} size="sm" variant={activeCapability === capability ? "default" : "outline"} onClick={() => setActiveCapability(capability)}>{CAPABILITY_META[capability].label}</Button>)}
        </div>
        <div className="relative mt-4 max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search models or providers…" className="pl-9" aria-label="Search models" /></div>
        <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {filteredModels.map((model) => <div key={`${model.provider}-${model.name}`} className="flex items-center gap-3 rounded-xl border bg-background/60 p-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">{iconForCapability(model.capability)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{model.name}</p><p className="truncate text-xs text-muted-foreground">{model.provider} · {model.note}</p></div><span className="rounded-full border px-2 py-1 text-[10px] font-semibold text-muted-foreground">{model.tier}</span></div>)}
        </div>
        {!filteredModels.length && <p className="mt-5 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">No models match that filter. Try a different capability or provider.</p>}
      </section>

      <section className="mt-12 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border bg-secondary/50 p-6 md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Recommended first run</p>
          <h2 className="mt-3 text-2xl font-semibold">The premium story pipeline</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["Brief & manuscript", "Character identity", "Illustration direction", "ElevenLabs narration", "Image-to-video scene", "Export & share"].map((step, index) => <div key={step} className="flex items-center gap-3 rounded-xl border bg-card p-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{index + 1}</span><span className="text-sm font-medium">{step}</span></div>)}
          </div>
        </div>
        <div className="rounded-2xl bg-accent p-6 text-accent-foreground md:p-7">
          <Mic2 className="h-6 w-6" />
          <h2 className="mt-5 text-2xl font-semibold">ElevenLabs is already part of the core.</h2>
          <p className="mt-3 text-sm leading-6 text-accent-foreground/75">Voice previews, consented voice cloning and page narration are routed through the secure server-side ElevenLabs integration—not exposed as a decorative badge.</p>
          <Button className="mt-6" variant="secondary" asChild><Link to="/voices"><Play /> Test a narrator</Link></Button>
        </div>
      </section>
    </div>
  );
}

function iconForCapability(capability: ModelCapability) {
  const props = { className: "h-4 w-4" };
  if (capability === "text") return <BookOpenText {...props} />;
  if (capability === "image") return <ImagePlus {...props} />;
  if (capability === "video") return <Video {...props} />;
  if (capability === "audio") return <FileAudio {...props} />;
  if (capability === "avatar") return <UserRound {...props} />;
  return <ScanFace {...props} />;
}

function LockShield({ className }: { className?: string }) {
  return <div className={className}><span className="sr-only">Private by default</span><span aria-hidden="true">◈</span></div>;
}
