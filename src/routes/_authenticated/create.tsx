import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { getStudioProviderStatus } from "@/lib/studio.functions";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Tables } from "@/integrations/supabase/types";
import ebookStudioThumb from "@/assets/thumbnails/ebook-studio.webp";
import audiobookThumb from "@/assets/thumbnails/audiobook-narration.webp";
import avatarThumb from "@/assets/thumbnails/avatar-generator.webp";
import animeThumb from "@/assets/thumbnails/anime-studio.webp";
import mediaLibraryThumb from "@/assets/thumbnails/media-library.webp";
import lipSyncThumb from "@/assets/thumbnails/lip-sync.webp";
import imageToVideoThumb from "@/assets/thumbnails/image-to-video.webp";
import worldBuilderThumb from "@/assets/thumbnails/world-builder.webp";
import printShareThumb from "@/assets/thumbnails/print-share.webp";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({
    meta: [
      { title: "Story Production — CyliaTales" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Create illustrated children’s books, read-aloud stories, comics, and animated scenes in one review-first studio.",
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
  image: string;
  cta: string;
  to?: "/stories/new" | "/voices" | "/characters" | "/labs" | "/world";
  onClick?: () => void;
};

const CREATION_CARDS: CreationCard[] = [
  {
    icon: BookOpenText,
    eyebrow: "Storybook",
    title: "Write & illustrate a book",
    body: "Shape a child-ready story, keep every page editable, and carry one approved cast and art direction through the whole book.",
    tone: "from-amber-50 to-orange-100/70",
    image: ebookStudioThumb,
    cta: "Start a storybook",
    to: "/stories/new",
  },
  {
    icon: AudioLines,
    eyebrow: "Read aloud",
    title: "Give the story a voice",
    body: "Choose a narrator, make page-synced audio, and review the spoken story alongside its illustrations.",
    tone: "from-sky-50 to-indigo-100/70",
    image: audiobookThumb,
    cta: "Open voice studio",
    to: "/voices",
  },
  {
    icon: BookOpenText,
    eyebrow: "Comic format",
    title: "Reframe pages as a comic",
    body: "Build panel-by-panel story beats from the same manuscript, approved characters, and chosen art direction.",
    tone: "from-rose-50 to-fuchsia-100/70",
    image: ebookStudioThumb,
    cta: "Open a story to make panels",
    to: "/stories/new",
  },
  {
    icon: Video,
    eyebrow: "Animated story",
    title: "Direct scenes into a short film",
    body: "Turn approved story illustrations into scenes with camera direction, editable timing, and controlled transitions.",
    tone: "from-blue-50 to-sky-100/70",
    image: imageToVideoThumb,
    cta: "Open production desk",
    to: "/labs",
  },
  {
    icon: Orbit,
    eyebrow: "Story continuity",
    title: "Keep the world consistent",
    body: "Connect recurring characters, places, props, and visual references so each new page belongs to the same story world.",
    tone: "from-lime-50 to-emerald-100/70",
    image: worldBuilderThumb,
    cta: "Open story world",
    to: "/world",
  },
  {
    icon: LibraryBig,
    eyebrow: "Share & print",
    title: "Deliver a keepsake",
    body: "Review the finished reading experience, export a shareable book, or prepare a print-ready copy from approved pages.",
    tone: "from-yellow-50 to-amber-100/70",
    image: printShareThumb,
    cta: "Create a book",
    to: "/stories/new",
  },
];

function CreateHub() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const getProviderStatus = useServerFn(getStudioProviderStatus);
  const { data: providers } = useQuery({ queryKey: ["story-provider-status"], queryFn: () => getProviderStatus() });
  const [projectTitle, setProjectTitle] = useState("");
  const [projectBrief, setProjectBrief] = useState("");
  const [projectMode, setProjectMode] = useState<"ebook" | "audiobook" | "anime" | "video">("ebook");
  const [savingProject, setSavingProject] = useState(false);
  const { data: projects = [] } = useQuery({
    queryKey: ["creation-projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("creation_projects").select("*").order("updated_at", { ascending: false }).limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: sourceCharacters = [] } = useQuery({
    queryKey: ["character-lock-source"],
    queryFn: async () => {
      const { data, error } = await supabase.from("characters").select("*").order("updated_at", { ascending: false }).limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: locks = [] } = useQuery({
    queryKey: ["character-locks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("character_locks").select("*").order("updated_at", { ascending: false }).limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });


  async function createProject() {
    if (!user || projectTitle.trim().length < 2 || projectBrief.trim().length < 3) {
      toast.error("Add a project title and a short brief first.");
      return;
    }
    setSavingProject(true);
    try {
      const { data: project, error } = await supabase.from("creation_projects").insert({
        user_id: user.id,
        title: projectTitle.trim(),
        brief: projectBrief.trim(),
        creation_mode: projectMode,
        status: "planning",
        safety_status: "pending",
        selected_models: { text: "Configured text model", image: "Configured image model", audio: "Configured narration provider", video: "Configured motion provider" },
      }).select("id").single();
      if (error) throw error;
      const artifacts = [
        { artifact_type: "ebook", provider: "CyliaTales story editor", metadata: { stage: "manuscript-and-layout", order: 1 } },
        { artifact_type: "ebook_pdf", provider: "CyliaTales book export", metadata: { stage: "print-and-share", order: 2 } },
        { artifact_type: "audiobook", provider: "ElevenLabs", metadata: { stage: "narration-master", order: 3, model: "eleven_multilingual_v2" } },
        { artifact_type: "narration_track", provider: "ElevenLabs", metadata: { stage: "page-synced-audio", order: 4 } },
        { artifact_type: "scene", provider: "CyliaTales scene pipeline", metadata: { stage: "approved-illustration-to-motion", order: 5, characterLockRequired: true } },
        { artifact_type: "video", provider: "CyliaTales scene pipeline", metadata: { stage: "final-animated-delivery", order: 6 } },
      ];
      const { error: artifactError } = await supabase.from("creation_artifacts").insert(artifacts.map((artifact) => ({ ...artifact, project_id: project.id, user_id: user.id, status: "planned" })));
      if (artifactError) throw artifactError;
      setProjectTitle("");
      setProjectBrief("");
      await queryClient.invalidateQueries({ queryKey: ["creation-projects"] });
      toast.success("Production project created");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSavingProject(false);
    }
  }

  async function createCharacterLock(character: Tables<"characters">) {
    if (!user) return;
    try {
      const referencePaths = [character.reference_url, character.portrait_url].filter((value): value is string => Boolean(value));
      const { error } = await supabase.from("character_locks").insert({
        user_id: user.id,
        character_id: character.id,
        name: character.name,
        identity_prompt: [character.kind, character.age, character.appearance, character.outfit, character.palette && `Palette: ${character.palette}`, character.personality].filter(Boolean).join(". "),
        reference_paths: referencePaths,
        style_id: character.art_style,
        status: "approved",
        metadata: { source: "character-atlas", referenceCount: referencePaths.length },
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["character-locks"] });
      toast.success(`${character.name} is now reusable across projects`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <div className="create-hub pb-10">
      <PageHeader
        eyebrow="CyliaTales / Story production"
        title="One story, ready to read, hear, and watch."
        subtitle="Write and illustrate children’s books, shape comic panels, record a read-aloud, and direct story scenes without leaving the same creative studio."
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
              <Orbit className="h-4 w-4" /> The CyliaTales story studio
            </p>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">
              From a small idea to a story a child can read, hear, and remember.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-primary-foreground/75 md:text-base">
              Every output stays connected to the same brief, cast, visual direction and approval gates. That is how quality compounds instead of fragmenting across tools.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/stories/new"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground transition hover:brightness-105"
              >
                Start a picture book <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/voices"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-primary-foreground/25 px-4 text-sm font-semibold transition hover:bg-primary-foreground/10"
              >
                <AudioLines className="h-4 w-4" /> Choose a narrator
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: CheckCircle2, label: "Review-first", detail: "Nothing publishes unseen." },
              { icon: Zap, label: "Model routing", detail: "Best fit for each stage." },
              { icon: CheckCircle2, label: "Private by default", detail: "Your world stays yours." },
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
          {CREATION_CARDS.map(({ icon: Icon, eyebrow, title, body, tone, image, cta, to, onClick }) => (
            <article key={title} className={`group flex min-h-[330px] flex-col overflow-hidden rounded-2xl border bg-gradient-to-br ${tone} shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lg`}>
              <div className="relative h-36 overflow-hidden bg-primary/10">
                <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/75 text-primary shadow-sm"><Icon className="h-5 w-5" /></span>
                <span className="rounded-full bg-white/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/60">Story format</span>
              </div>
              <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/75">{eyebrow}</p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{body}</p>
              {to ? (
                <Link to={to} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:gap-3">{cta} <ArrowRight className="h-4 w-4" /></Link>
              ) : (
                <button type="button" onClick={onClick} className="mt-5 inline-flex items-center gap-2 text-left text-sm font-semibold text-primary">{cta} <ArrowRight className="h-4 w-4" /></button>
              )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border bg-card p-6 shadow-soft md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Persistent production</p>
              <h2 className="mt-2 text-2xl font-semibold">Start a connected project</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Keep the manuscript, character references, narration, animated scenes, and delivery files connected to one story brief.</p>
            </div>
            <span className="rounded-full border bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">{projects.length} recent</span>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <Input value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} placeholder="Project title" aria-label="Project title" />
            <select value={projectMode} onChange={(event) => setProjectMode(event.target.value as typeof projectMode)} className="h-10 rounded-md border bg-background px-3 text-sm" aria-label="Project creation mode">
              <option value="ebook">Picture book</option>
              <option value="audiobook">Audiobook</option>
              <option value="anime">Animated story</option>
              <option value="video">Image-to-video</option>

            </select>
          </div>
          <Textarea value={projectBrief} onChange={(event) => setProjectBrief(event.target.value)} className="mt-3 min-h-24" placeholder="Describe the story, audience, emotional center and finished format…" aria-label="Project brief" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Saved to your private production workspace.</p>
            <Button onClick={createProject} disabled={savingProject}>{savingProject ? "Saving project…" : "Create production project"} <ArrowRight className="h-4 w-4" /></Button>
          </div>
          {projects.length > 0 && <div className="mt-6 grid gap-2 border-t pt-5 sm:grid-cols-2">
            {projects.slice(0, 4).map((project) => <div key={project.id} className="rounded-xl border bg-secondary/40 p-3"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold">{project.title}</p><span className="text-[10px] font-semibold uppercase tracking-wide text-primary">{project.status}</span></div><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{project.brief}</p></div>)}
          </div>}
        </div>
        <div className="rounded-2xl border bg-secondary/45 p-6 shadow-soft md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Continuity control</p><h2 className="mt-2 text-2xl font-semibold">Character-lock atlas</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Approve an identity once. Reuse the same face, outfit, palette and voice direction across every format.</p></div>
            <ScanFace className="h-6 w-6 text-primary" />
          </div>
          <div className="mt-6 space-y-2">
            {sourceCharacters.slice(0, 4).map((character) => {
              const locked = locks.some((lock) => lock.character_id === character.id);
              return <div key={character.id} className="flex items-center gap-3 rounded-xl border bg-card p-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><UserRound className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{character.name}</p><p className="truncate text-xs text-muted-foreground">{character.kind} · {character.art_style}</p></div>{locked ? <span className="text-xs font-semibold text-primary">Locked</span> : <Button size="sm" variant="outline" onClick={() => createCharacterLock(character)}>Lock identity</Button>}</div>;
            })}
            {!sourceCharacters.length && <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">Create a character first, then return here to lock their identity for books, audio and motion.</div>}
          </div>
          {locks.length > 0 && <p className="mt-4 text-xs font-semibold text-primary">{locks.length} reusable identity{locks.length === 1 ? "" : "ies"} ready across your workspace.</p>}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border bg-card p-6 shadow-soft md:p-7" aria-labelledby="model-router-title">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary"><Sparkles className="h-4 w-4" /> Generation connections</p>
        <h2 id="model-router-title" className="mt-2 text-2xl font-semibold">Only configured providers appear ready.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Credentials stay on the server. A configured connection can still be affected by provider access, model availability, or account limits; image and read-aloud requests move to their configured backup when the primary fails.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Story writing", ready: providers?.text },
            { label: "Illustration", ready: providers?.image },
            { label: "Read-aloud narration", ready: providers?.narration },
            { label: "ElevenLabs voice cloning", ready: providers?.elevenLabs },
            { label: "Scene motion", ready: providers?.motion },
            { label: "Groq text", ready: providers?.groq },
            { label: "Pollinations text / image / narration", ready: providers?.pollinations },
            { label: "Cloudflare Workers AI", ready: providers?.cloudflareAI },
            { label: "Durable story-job worker (optional)", ready: providers?.cloudflareWorker },
          ].map((item) => <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border bg-background/60 p-4"><span className="text-sm font-medium">{item.label}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.ready ? "bg-emerald-100 text-emerald-800" : "bg-secondary text-muted-foreground"}`}>{providers ? item.ready ? "Credential found" : "Not configured" : "Checking…"}</span></div>)}
        </div>
      </section>

      <section className="mt-12 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border bg-secondary/50 p-6 md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Recommended first run</p>
          <h2 className="mt-3 text-2xl font-semibold">The premium story pipeline</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["Brief & manuscript", "Character identity", "Illustration direction", "Read-aloud narration", "Image-to-video scene", "Export & share"].map((step, index) => <div key={step} className="flex items-center gap-3 rounded-xl border bg-card p-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{index + 1}</span><span className="text-sm font-medium">{step}</span></div>)}
          </div>
        </div>
        <div className="rounded-2xl bg-accent p-6 text-accent-foreground md:p-7">
          <Mic2 className="h-6 w-6" />
          <h2 className="mt-5 text-2xl font-semibold">A voice for every page.</h2>
          <p className="mt-3 text-sm leading-6 text-accent-foreground/75">Read-aloud audio tries the primary server-side voice endpoint, then Pollinations when available. Provider access and account balance can still limit a request; voice cloning is a separate, optional ElevenLabs service.</p>
          <Button className="mt-6" variant="secondary" asChild><Link to="/voices"><Play /> Choose a narrator</Link></Button>
        </div>
      </section>
    </div>
  );
}
