import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Download,
  Save,
  Clapperboard,
  Film,
  Sparkles,
  Loader2,
  Eye,
  History,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMediaUrl } from "@/lib/media";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { startSceneMotion, checkSceneMotion } from "@/lib/studio.functions";
import type { Tables } from "@/integrations/supabase/types";

type Page = Tables<"story_pages">;

const MOTION_CLASS: Record<string, string> = {
  "Locked-off": "motion-still",
  "Slow push-in": "motion-push",
  "Gentle pan left": "motion-pan-left",
  "Gentle pan right": "motion-pan-right",
};
const SHOT_SCALE: Record<string, number> = {
  Wide: 1,
  Medium: 1.08,
  "Close-up": 1.22,
  Detail: 1.38,
};

export function StoryVideo({ pages, title }: { pages: Page[]; title: string }) {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const page = pages[selected];
  const narration = useMediaUrl(page?.audio_url);
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (!playing || !page) return;
    const advance = () => {
      if (selected + 1 < pages.length) setSelected(selected + 1);
      else setPlaying(false);
    };
    if (narration && audio.current) {
      const el = audio.current;
      el.currentTime = 0;
      el.onended = advance;
      void el.play().catch(() => setPlaying(false));
      return () => {
        el.pause();
        el.onended = null;
      };
    }
    const timer = window.setTimeout(advance, page.duration_seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [playing, selected, narration, pages.length, page]);

  async function exportVideo() {
    if (!pages.length || pages.some((p) => !p.image_url)) {
      toast.error("Add an illustration to every scene before exporting.");
      return;
    }
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported("video/webm")) {
      toast.error("WebM export is not supported in this browser.");
      return;
    }
    setPlaying(false);
    setExporting(true);
    let stream: MediaStream | undefined;
    try {
      const images = await Promise.all(
        pages.map(async (p) => {
          if (!p.image_url) throw new Error("Missing illustration");
          const { data, error } = await supabase.storage
            .from("media")
            .createSignedUrl(p.image_url, 3600);
          if (error) throw error;
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = data.signedUrl;
          await img.decode();
          return img;
        }),
      );
      const canvas = document.createElement("canvas");
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Video canvas is unavailable");
      stream = canvas.captureStream(30);
      // Narration: decode each page's saved audio and mix into the film soundtrack.
      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      const voices = await Promise.all(
        pages.map(async (p) => {
          if (!p.audio_url) return null;
          try {
            const { data } = await supabase.storage
              .from("media")
              .createSignedUrl(p.audio_url, 3600);
            if (!data) return null;
            const buf = await (await fetch(data.signedUrl)).arrayBuffer();
            return await audioCtx.decodeAudioData(buf);
          } catch {
            return null;
          }
        }),
      );
      const hasVoice = voices.some(Boolean);
      if (hasVoice) dest.stream.getAudioTracks().forEach((t) => stream!.addTrack(t));
      const mime =
        hasVoice && MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
          ? "video/webm;codecs=vp9,opus"
          : "video/webm";
      const recorder = new MediaRecorder(stream, {
        mimeType: mime,
        audioBitsPerSecond: 192000,
        videoBitsPerSecond: 12000000,
      });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      const done = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
        recorder.onerror = () => reject(new Error("Video export failed"));
      });
      const background =
        getComputedStyle(document.documentElement).getPropertyValue("--background").trim() ||
        "#fff";
      recorder.start();
      for (let i = 0; i < images.length; i++) {
        setSelected(i);
        const img = images[i];
        const p = pages[i];
        if (!img || !p) throw new Error("Scene illustration is unavailable");
        const voice = voices[i];
        const ms = Math.max(p.duration_seconds * 1000, voice ? voice.duration * 1000 + 600 : 0);
        const start = performance.now();
        if (voice) {
          const src = audioCtx.createBufferSource();
          src.buffer = voice;
          src.connect(dest);
          src.start(audioCtx.currentTime + 0.3);
        }
        const base = Math.min(1920 / img.width, 1080 / img.height) * (SHOT_SCALE[p.shot_type] ?? 1);
        await new Promise<void>((resolve) => {
          const frame = () => {
            const t = Math.min(1, (performance.now() - start) / ms);
            const ease = t * t * (3 - 2 * t);
            let scale = base,
              dx = 0;
            if (p.camera_motion === "Slow push-in") scale = base * (1 + 0.1 * ease);
            if (p.camera_motion === "Gentle pan left") {
              scale = base * 1.12;
              dx = 80 - 160 * ease;
            }
            if (p.camera_motion === "Gentle pan right") {
              scale = base * 1.12;
              dx = -80 + 160 * ease;
            }
            const w = img.width * scale,
              h = img.height * scale;
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, 1920, 1080);
            ctx.drawImage(img, (1920 - w) / 2 + dx, (1080 - h) / 2, w, h);
            if (t < 1) requestAnimationFrame(frame);
            else resolve();
          };
          frame();
        });
      }
      recorder.stop();
      const blob = await done;
      void audioCtx.close();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]+/gi, "-")}.webm`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success(
        hasVoice
          ? "1080p film exported with narration"
          : "1080p film exported — add narration to pages to include voice",
      );
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      stream?.getTracks().forEach((track) => track.stop());
      setExporting(false);
    }
  }
  if (!page) return <p className="py-12 text-muted-foreground">This book has no scenes yet.</p>;
  const animated = pages.filter((p) => p.motion_url).length;
  return (
    <section className="video-workspace">
      <div className="flex flex-wrap items-center justify-between gap-3 border-y py-4">
        <div className="flex items-center gap-3">
          <Clapperboard className="text-primary" />
          <h2 className="text-lg font-semibold">Story film</h2>
          <span className="text-sm text-muted-foreground">
            {pages.length} scenes · {animated} animated
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={exporting} onClick={() => setPlaying(!playing)}>
            {playing ? <Pause /> : <Eye />}
            {playing ? "Pause preview" : "Preview storyboard"}
          </Button>
          <Button disabled={exporting} onClick={exportVideo}>
            <Download />
            {exporting ? "Exporting…" : "Export 1080p WebM"}
          </Button>
        </div>
      </div>
      <DeliveryChecklist pages={pages} />
      <div className="grid gap-6 py-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <SceneStage page={page} playing={playing || exporting} />
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded border px-2 py-1">{page.shot_type}</span>
            <span className="rounded border px-2 py-1">{page.camera_motion}</span>
            <span className="rounded border px-2 py-1">{page.duration_seconds}s</span>
            {page.motion_url && (
              <span className="rounded border border-primary px-2 py-1 text-primary">
                Motion clip
              </span>
            )}
          </div>
          <p className="mt-4 font-display text-xl leading-relaxed">{page.text}</p>
          {narration && (
            <audio ref={audio} key={narration} src={narration} controls className="mt-4 w-full" />
          )}
        </div>
        <div>
          <SceneEditor key={`${page.id}:${page.updated_at}`} page={page} />
        </div>
      </div>
      <div className="storyboard-strip">
        {pages.map((p, i) => (
          <SceneTile
            key={p.id}
            page={p}
            active={i === selected}
            onSelect={() => {
              setPlaying(false);
              setSelected(i);
            }}
            disabled={exporting}
          />
        ))}
      </div>
    </section>
  );
}

function DeliveryChecklist({ pages }: { pages: Page[] }) {
  const checks = [
    {
      label: "Every scene has an illustration",
      done: pages.length > 0 && pages.every((scene) => Boolean(scene.image_url)),
    },
    {
      label: "Every scene has narration",
      done: pages.length > 0 && pages.every((scene) => Boolean(scene.audio_url)),
    },
    {
      label: "At least one scene has rendered motion",
      done: pages.some((scene) => Boolean(scene.motion_url)),
    },
  ];
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 border-b bg-secondary/30 px-4 py-3 text-xs text-muted-foreground">
      {checks.map((check) => (
        <span key={check.label} className="flex items-center gap-1.5">
          {check.done ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-muted-foreground/70" />
          )}
          {check.label}
        </span>
      ))}
    </div>
  );
}

function SceneStage({ page, playing }: { page: Page; playing: boolean }) {
  const image = useMediaUrl(page.image_url);
  const clip = useMediaUrl(page.motion_url);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (playing) {
      v.currentTime = 0;
      void v.play().catch(() => {});
    } else v.pause();
  }, [playing, clip]);
  if (clip)
    return (
      <div className="video-stage">
        <video
          ref={video}
          key={clip}
          src={clip}
          poster={image ?? undefined}
          muted
          playsInline
          controls={!playing}
          className="h-full w-full object-contain"
        />
      </div>
    );
  if (!image)
    return (
      <div className="video-stage">
        <p className="text-muted-foreground">No illustration for this scene</p>
      </div>
    );
  return (
    <div className="video-stage">
      <img
        key={`${page.id}:${playing}:${page.camera_motion}:${page.shot_type}`}
        src={image}
        alt={`Scene ${page.page_number}`}
        className={playing ? (MOTION_CLASS[page.camera_motion] ?? "") : ""}
        style={{
          ["--shot-scale" as string]: SHOT_SCALE[page.shot_type] ?? 1,
          ["--scene-duration" as string]: `${page.duration_seconds}s`,
          transform: playing ? undefined : `scale(${SHOT_SCALE[page.shot_type] ?? 1})`,
        }}
      />
    </div>
  );
}

function SceneTile({
  page,
  active,
  onSelect,
  disabled,
}: {
  page: Page;
  active: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const url = useMediaUrl(page.image_url);
  return (
    <Button
      variant={active ? "default" : "outline"}
      aria-pressed={active}
      onClick={onSelect}
      disabled={disabled}
      className="storyboard-tile relative"
    >
      {url ? <img src={url} alt="" /> : <Clapperboard />}
      <span>
        Scene {page.page_number}
        {page.motion_url ? " · ▶" : page.motion_status === "processing" ? " · …" : ""}
      </span>
    </Button>
  );
}

function SceneEditor({ page }: { page: Page }) {
  const [text, setText] = useState(page.text);
  const [prompt, setPrompt] = useState(page.image_prompt ?? "");
  const [duration, setDuration] = useState(page.duration_seconds);
  const [shot, setShot] = useState(page.shot_type);
  const [motion, setMotion] = useState(page.camera_motion);
  const [action, setAction] = useState(page.motion_prompt ?? "");
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [progress, setProgress] = useState(0);
  const qc = useQueryClient();
  const start = useServerFn(startSceneMotion);
  const check = useServerFn(checkSceneMotion);
  const processing = page.motion_status === "processing";
  useEffect(() => {
    if (!processing) return;
    let stopped = false;
    const poll = async () => {
      try {
        const r = await check({ data: { pageId: page.id } });
        if (stopped) return;
        if ("progress" in r && typeof r.progress === "number") setProgress(r.progress);
        if (r.status === "completed") {
          toast.success(`Scene ${page.page_number} motion clip ready`);
          await qc.invalidateQueries({ queryKey: ["pages", page.story_id] });
          return;
        }
        if (r.status === "failed") {
          toast.error(("error" in r && r.error) || "Motion clip failed");
          await qc.invalidateQueries({ queryKey: ["pages", page.story_id] });
          return;
        }
        timer = window.setTimeout(poll, 8000);
      } catch (e) {
        if (!stopped) toast.error((e as Error).message);
      }
    };
    let timer = window.setTimeout(poll, 4000);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [processing, page.id, page.page_number, page.story_id, check, qc]);

  async function persist() {
    const { error } = await supabase
      .from("story_pages")
      .update({
        text,
        image_prompt: prompt,
        duration_seconds: duration,
        shot_type: shot,
        camera_motion: motion,
        motion_prompt: action || null,
        ...(text !== page.text ? { audio_url: null } : {}),
      })
      .eq("id", page.id);
    if (error) throw error;
  }
  async function save() {
    setSaving(true);
    try {
      await persist();
      await qc.invalidateQueries({ queryKey: ["pages", page.story_id] });
      toast.success("Scene saved");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  async function animate() {
    if (!page.image_url) {
      toast.error("Illustrate this scene first.");
      return;
    }
    setStarting(true);
    try {
      await persist();
      await start({ data: { pageId: page.id } });
      setProgress(0);
      toast.success("Animating scene — this takes 1–3 minutes");
      await qc.invalidateQueries({ queryKey: ["pages", page.story_id] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setStarting(false);
    }
  }
  const select = "h-10 w-full rounded-md border bg-background px-3 text-sm";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Film className="text-primary" />
        <h3 className="font-semibold">Scene {page.page_number} direction</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="shot-type">Framing</Label>
          <select
            id="shot-type"
            className={select}
            value={shot}
            onChange={(e) => setShot(e.target.value)}
          >
            <option>Wide</option>
            <option>Medium</option>
            <option>Close-up</option>
            <option>Detail</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="camera-motion">Camera</Label>
          <select
            id="camera-motion"
            className={select}
            value={motion}
            onChange={(e) => setMotion(e.target.value)}
          >
            <option>Locked-off</option>
            <option>Slow push-in</option>
            <option>Gentle pan left</option>
            <option>Gentle pan right</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="scene-duration">Duration · {duration}s</Label>
        <input
          id="scene-duration"
          className="w-full accent-primary"
          type="range"
          min={3}
          max={10}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="scene-action">Character action</Label>
        <Textarea
          id="scene-action"
          rows={2}
          placeholder="e.g. Mia waves and the kite lifts into the wind"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="scene-script">Narration script</Label>
        <Textarea
          id="scene-script"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="scene-direction">Illustration direction</Label>
        <Textarea
          id="scene-direction"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={save} disabled={saving}>
          <Save />
          {saving ? "Saving…" : "Save scene"}
        </Button>
        <Button onClick={animate} disabled={starting || processing || !page.image_url}>
          {processing || starting ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {processing
            ? `Animating${progress ? ` · ${Math.round(progress)}%` : "…"}`
            : page.motion_url
              ? "Re-animate scene"
              : "Animate scene"}
        </Button>
      </div>
      {page.motion_status === "failed" && page.motion_error && (
        <p className="text-sm text-destructive">
          {page.motion_error} If the illustration may be the cause, try regenerating it.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Animation turns the illustration into a real motion clip using your framing, camera and
        action. Preview uses camera moves only.
      </p>
    </div>
  );
}
