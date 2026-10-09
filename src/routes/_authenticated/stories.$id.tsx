import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  ImageIcon,
  Volume2,
  Trash2,
  Printer,
  Clapperboard,
  Palette,
  UsersRound,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { generateImage, narrate, narrateWithClonedVoice } from "@/lib/studio.functions";
import { voiceEngine } from "@/lib/catalog";
import { uploadBase64, useMediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { BookReader } from "@/components/BookReader";
import { StoryVideo } from "@/components/StoryVideo";
import { PrintBook } from "@/components/PrintBook";
import { Textarea } from "@/components/ui/textarea";
import { usePageIllustration } from "@/hooks/use-page-illustration";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/stories/$id")({
  head: () => ({
    meta: [
      { title: "Book editor — CyliaTales" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Edit illustrations and story text, save narration and read your book.",
      },
      { property: "og:title", content: "Book editor — CyliaTales" },
      {
        property: "og:description",
        content: "Edit illustrations and story text, save narration and read your book.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Editor,
});

function Editor() {
  const { id } = Route.useParams();
  const [reading, setReading] = useState(false);
  const [view, setView] = useState<"book" | "video">("book");
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const cache = useQueryClient();
  const { data: story } = useQuery({
    queryKey: ["story", id],
    queryFn: async () => (await supabase.from("stories").select("*").eq("id", id).single()).data,
  });
  const { data: pages = [] } = useQuery({
    queryKey: ["pages", id],
    queryFn: async () =>
      (await supabase.from("story_pages").select("*").eq("story_id", id).order("page_number"))
        .data ?? [],
  });
  const { data: cast = [] } = useQuery({
    queryKey: ["story-cast", id, story?.character_ids],
    enabled: Boolean(story?.character_ids?.length),
    queryFn: async () =>
      (
        await supabase
          .from("characters")
          .select("*")
          .in("id", story?.character_ids ?? [])
      ).data ?? [],
  });
  const nav = useNavigate();
  const { illustrate, drawingPage } = usePageIllustration(story);
  if (!story) return <p className="text-muted-foreground">Opening book…</p>;

  async function remove() {
    setDeleting(true);
    try {
      const { error } = await supabase.from("stories").delete().eq("id", id);
      if (error) throw error;
      await cache.invalidateQueries({ queryKey: ["stories"] });
      toast.success("Book deleted");
      await nav({ to: "/stories" });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <Link to="/stories" className="text-sm text-muted-foreground hover:text-foreground">
        ← My books
      </Link>
      <div className="mt-2 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">{story.title}</h1>
          <p className="mt-1 text-muted-foreground">
            Ages {story.age_range} · {story.art_style} · Narrated by {story.voice}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!pages.length} onClick={() => setReading(true)}>
            <BookOpen /> Read book
          </Button>
          <Button variant="outline" disabled={!pages.length} onClick={() => window.print()}>
            <Printer /> Print / PDF
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete book"
            aria-label="Delete book"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <VisualDirection story={story} cast={cast} />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{story.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the book and its pages. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep book</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                void remove();
              }}
            >
              {deleting ? "Deleting…" : "Delete book"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {reading && (
        <BookReader
          title={story.title}
          pages={pages}
          storyId={story.id}
          coverPath={story.cover_url}
          onIllustrate={illustrate}
          drawingPage={drawingPage}
          onClose={() => setReading(false)}
        />
      )}
      <div className="mb-6 flex gap-2" role="group" aria-label="Editor view">
        <Button
          variant={view === "book" ? "default" : "outline"}
          aria-pressed={view === "book"}
          onClick={() => setView("book")}
        >
          <BookOpen /> Book pages
        </Button>
        <Button
          variant={view === "video" ? "default" : "outline"}
          aria-pressed={view === "video"}
          onClick={() => setView("video")}
        >
          <Clapperboard /> Video storyboard
        </Button>
      </div>
      {view === "video" ? (
        <StoryVideo pages={pages} title={story.title} />
      ) : (
        <div className="space-y-6">
          {pages.map((p) => (
            <PageCard key={p.id} page={p} story={story} />
          ))}
        </div>
      )}
      <PrintBook title={story.title} pages={pages} />
    </div>
  );
}

function VisualDirection({
  story,
  cast,
}: {
  story: Tables<"stories">;
  cast: Tables<"characters">[];
}) {
  return (
    <section
      className="mb-7 grid gap-4 rounded-2xl border bg-card p-4 shadow-soft md:grid-cols-[1fr_auto] md:items-center md:p-5"
      aria-label="Approved visual direction"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Art direction
            </p>
            <p className="mt-0.5 text-sm font-semibold">{story.art_style}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
            <Volume2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Narrator
            </p>
            <p className="mt-0.5 text-sm font-semibold">{story.voice}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
            <UsersRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Cast lock
            </p>
            <p className="mt-0.5 text-sm font-semibold">
              {cast.length
                ? `${cast.length} approved character${cast.length === 1 ? "" : "s"}`
                : "No cast selected"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground md:border-l md:border-t-0 md:pl-5 md:pt-0">
        <LockKeyhole className="h-4 w-4 text-accent" /> References are used for every redraw
      </div>
      {cast.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t pt-4 md:col-span-2">
          {cast.map((character) => (
            <CharacterToken key={character.id} character={character} />
          ))}
        </div>
      )}
    </section>
  );
}

function CharacterToken({ character }: { character: Tables<"characters"> }) {
  const portrait = useMediaUrl(character.portrait_url);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border bg-background px-2 py-1 text-xs font-medium">
      <span className="grid h-6 w-6 place-items-center overflow-hidden rounded-full bg-secondary">
        {portrait ? (
          <img src={portrait} alt="" className="h-full w-full object-cover" />
        ) : (
          <UsersRound className="h-3 w-3 text-muted-foreground" />
        )}
      </span>
      {character.name}
      <Sparkles className="h-3 w-3 text-accent" />
    </span>
  );
}

function PageCard({ page, story }: { page: Tables<"story_pages">; story: Tables<"stories"> }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const img = useServerFn(generateImage);
  const speak = useServerFn(narrate);
  const customSpeak = useServerFn(narrateWithClonedVoice);
  const url = useMediaUrl(page.image_url);
  const [text, setText] = useState(page.text);
  const [busy, setBusy] = useState<"img" | "voice" | null>(null);
  const savedAudio = useMediaUrl(page.audio_url);
  const [audio, setAudio] = useState<string | null>(null);
  const [saveState, setSaveState] = useState("Saved");
  const savedText = useRef(page.text);
  useEffect(() => {
    if (text === savedText.current) return;
    const timer = setTimeout(() => {
      void save();
    }, 700);
    return () => clearTimeout(timer);
  }, [text]);

  async function illustrate() {
    if (!user) return;
    setBusy("img");
    try {
      let referencePaths: string[] = [];
      let castNote = "";
      if (story.character_ids.length) {
        const { data: cast } = await supabase
          .from("characters")
          .select("name, appearance, outfit, palette, portrait_url, reference_url")
          .in("id", story.character_ids);
        referencePaths = (cast ?? [])
          .flatMap((c) => [c.portrait_url, c.reference_url])
          .filter((p): p is string => !!p)
          .slice(0, 6);
        castNote = (cast ?? [])
          .map(
            (c) => `${c.name}: ${[c.appearance, c.outfit, c.palette].filter(Boolean).join(", ")}`,
          )
          .join("; ");
      }
      const { b64 } = await img({
        data: {
          prompt: `Draw this exact story text: ${text}. Art direction: ${page.image_prompt ?? ""}${castNote ? `. Characters: ${castNote}` : ""}`,
          style: story.art_style,
          referencePaths,
        },
      });
      const path = await uploadBase64(user.id, "pages", b64);
      const { error } = await supabase
        .from("story_pages")
        .update({ image_url: path })
        .eq("id", page.id);
      if (error) throw error;
      if (page.page_number === 1)
        await supabase.from("stories").update({ cover_url: path }).eq("id", story.id);
      qc.invalidateQueries({ queryKey: ["pages", story.id] });
      qc.invalidateQueries({ queryKey: ["stories"] });
      qc.invalidateQueries({ queryKey: ["story", story.id] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function listen() {
    setBusy("voice");
    try {
      let audioResult: { b64: string; mime: string };
      if (story.voice_profile_id) {
        const { data: profile, error: profileError } = await supabase
          .from("voice_profiles")
          .select("provider_voice_id")
          .eq("id", story.voice_profile_id)
          .single();
        if (profileError) throw profileError;
        audioResult = await customSpeak({ data: { text, voiceId: profile.provider_voice_id } });
      } else {
        audioResult = await speak({ data: { text, voice: voiceEngine(story.voice) } });
      }
      const { b64, mime } = audioResult;
      if (!user) return;
      const path = await uploadBase64(user.id, "narration", b64, mime);
      const { error } = await supabase
        .from("story_pages")
        .update({ audio_url: path })
        .eq("id", page.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["pages", story.id] });
      const src = `data:${mime};base64,${b64}`;
      setAudio(src);
      new Audio(src).play().catch(() => {});
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (text === savedText.current) return;
    setSaveState("Saving…");
    const { error } = await supabase
      .from("story_pages")
      .update({ text, audio_url: null })
      .eq("id", page.id);
    if (error) {
      setSaveState("Not saved");
      toast.error(error.message);
      return;
    }
    savedText.current = text;
    setSaveState("Saved");
    setAudio(null);
    qc.invalidateQueries({ queryKey: ["pages", story.id] });
  }

  return (
    <div className="grid overflow-hidden rounded-2xl border bg-card shadow-soft md:grid-cols-2">
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-secondary">
        {url ? (
          <img
            src={url}
            alt={`Full-page illustration for page ${page.page_number}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <Button variant="outline" disabled={busy === "img"} onClick={illustrate}>
            <ImageIcon className="h-4 w-4" /> {busy === "img" ? "Painting…" : "Illustrate page"}
          </Button>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-card/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary shadow-sm">
          Page {page.page_number}
        </span>
      </div>
      <div className="flex flex-col p-5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <p className="font-semibold uppercase">Page {page.page_number}</p>
          <span role="status">{saveState}</span>
        </div>
        <Textarea
          className="mt-2 flex-1 font-display text-lg"
          rows={5}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSaveState("Unsaved");
          }}
          onBlur={save}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={!!busy} onClick={listen}>
            <Volume2 className="h-4 w-4" /> {busy === "voice" ? "Recording…" : "Narrate"}
          </Button>
          {url && (
            <Button size="sm" variant="ghost" disabled={!!busy} onClick={illustrate}>
              {busy === "img" ? "Painting…" : "Redraw"}
            </Button>
          )}
        </div>
        {(audio || savedAudio) && (
          <audio controls src={audio ?? savedAudio} className="mt-3 w-full" />
        )}
      </div>
    </div>
  );
}
