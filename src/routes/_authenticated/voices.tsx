import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AudioWaveform, Mic, Play, Square, Trash2 } from "lucide-react";
import { cloneVoice, deleteClonedVoice, narrate, narrateWithClonedVoice } from "@/lib/studio.functions";
import { VOICES } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { fileToBase64, uploadFile, useMediaUrl } from "@/lib/media";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/voices")({
  head: () => ({ meta: [{ title: "Voices — CyliaTales" }, { name: "robots", content: "noindex" }, { name: "description", content: "Explore categorized narrator voices for your children’s books." }, { property: "og:title", content: "Voices — CyliaTales" }, { property: "og:description", content: "Explore categorized narrator voices for your children’s books." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Voices,
});

function Voices() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const speak = useServerFn(narrate);
  const clone = useServerFn(cloneVoice);
  const customSpeak = useServerFn(narrateWithClonedVoice);
  const removeProviderVoice = useServerFn(deleteClonedVoice);
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [sample, setSample] = useState<File | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<number | null>(null);
  const { data: customVoices = [] } = useQuery({
    queryKey: ["voice-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("voice_profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => () => {
    stream.current?.getTracks().forEach((track) => track.stop());
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  async function preview(id: string, engine: string) {
    setBusy(id);
    try {
      const { b64, mime } = await speak({ data: { text: `Hello, I'm ${id}. Once upon a time, in a village at the edge of the woods…`, voice: engine } });
      new Audio(`data:${mime};base64,${b64}`).play().catch(() => {});
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(null); }
  }

  async function startRecording() {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      stream.current = media;
      const chunks: BlobPart[] = [];
      const next = new MediaRecorder(media, { mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm" });
      next.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      next.onstop = () => {
        const blob = new Blob(chunks, { type: next.mimeType });
        setSample(new File([blob], "voice-sample.webm", { type: next.mimeType }));
        media.getTracks().forEach((track) => track.stop());
      };
      recorder.current = next;
      next.start();
      setElapsed(0);
      setRecording(true);
      timer.current = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    } catch {
      toast.error("Microphone access is needed to record a voice sample.");
    }
  }

  function stopRecording() {
    recorder.current?.stop();
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    setRecording(false);
  }

  async function createVoice() {
    if (!user || !sample || !consent || name.trim().length < 2) return;
    if (sample.size > 12 * 1024 * 1024) { toast.error("Use a recording smaller than 12 MB."); return; }
    setBusy("clone");
    try {
      const audioBase64 = await fileToBase64(sample);
      const { voiceId } = await clone({ data: { name: name.trim(), audioBase64, mime: sample.type || "audio/webm", consentConfirmed: true } });
      const samplePath = await uploadFile(user.id, "voice-samples", sample);
      const { error } = await supabase.from("voice_profiles").insert({
        user_id: user.id,
        name: name.trim(),
        provider_voice_id: voiceId,
        sample_url: samplePath,
        consent_confirmed: true,
        consent_text: "I confirm that I own this voice or have the speaker's explicit permission to create and use this voice clone.",
      });
      if (error) throw error;
      setName(""); setSample(null); setConsent(false);
      await queryClient.invalidateQueries({ queryKey: ["voice-profiles"] });
      toast.success("Voice created and ready for narration");
    } catch (error) { toast.error((error as Error).message); }
    finally { setBusy(null); }
  }

  async function previewCustom(voice: Tables<"voice_profiles">) {
    setBusy(voice.id);
    try {
      const { b64, mime } = await customSpeak({ data: { text: `Hello, I'm ${voice.name}. Let's read a wonderful story together.`, voiceId: voice.provider_voice_id } });
      await new Audio(`data:${mime};base64,${b64}`).play();
    } catch (error) { toast.error((error as Error).message); }
    finally { setBusy(null); }
  }

  async function removeCustom(voice: Tables<"voice_profiles">) {
    if (!confirm(`Delete ${voice.name}? Books using this voice will return to their standard narrator.`)) return;
    setBusy(voice.id);
    try {
      await removeProviderVoice({ data: { voiceId: voice.provider_voice_id } });
      const { error } = await supabase.from("voice_profiles").delete().eq("id", voice.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["voice-profiles"] });
      toast.success("Voice removed");
    } catch (error) { toast.error((error as Error).message); }
    finally { setBusy(null); }
  }
  const cats = [...new Set(VOICES.map((v) => v.category))];
  return (
    <div>
      <PageHeader eyebrow="Voice studio" title="Narrators with real character" subtitle="Choose a studio narrator or create a private voice with the speaker’s permission." />
      <section className="voice-clone-panel mb-12 grid gap-8 border-y py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="flex items-center gap-3"><span className="voice-icon"><AudioWaveform /></span><div><h2 className="text-xl font-semibold">Create a consented voice</h2><p className="text-sm text-muted-foreground">A clear 60–120 second recording gives the best result.</p></div></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="voice-name">Voice name</Label><Input id="voice-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Grandma Rose" /></div>
            <div className="space-y-2"><Label htmlFor="voice-file">Or upload a recording</Label><Input id="voice-file" type="file" accept="audio/*" onChange={(event) => setSample(event.target.files?.[0] ?? null)} /></div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button type="button" variant={recording ? "destructive" : "outline"} onClick={recording ? stopRecording : startRecording} disabled={!!busy}>
              {recording ? <Square /> : <Mic />}{recording ? `Stop · ${elapsed}s` : "Record sample"}
            </Button>
            {sample && <span className="text-sm text-muted-foreground">Ready · {(sample.size / 1024 / 1024).toFixed(1)} MB</span>}
          </div>
          <label className="mt-6 flex max-w-2xl items-start gap-3 text-sm leading-relaxed"><Checkbox checked={consent} onCheckedChange={(value) => setConsent(value === true)} className="mt-1"/><span>I confirm that I own this voice or have the speaker’s explicit permission to create and use this voice clone.</span></label>
          <Button className="mt-6" onClick={createVoice} disabled={!sample || !consent || name.trim().length < 2 || !!busy}>{busy === "clone" ? "Creating voice…" : "Create private voice"}</Button>
        </div>
        <div className="recording-script"><p className="text-xs font-semibold uppercase text-muted-foreground">Suggested reading</p><p className="mt-3 leading-7">“Every story begins with a small spark of wonder. Today, we’ll follow it through a quiet forest, over a silver stream, and all the way home.”</p><p className="mt-4 text-xs text-muted-foreground">Record somewhere quiet, speak naturally, and keep the microphone about a hand’s width away.</p></div>
      </section>
      {!!customVoices.length && <section className="mb-12"><h2 className="mb-4 text-xl font-semibold">Your private voices</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{customVoices.map((voice) => <CustomVoiceCard key={voice.id} voice={voice} busy={busy === voice.id} onPreview={() => previewCustom(voice)} onRemove={() => removeCustom(voice)} />)}</div></section>}
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

function CustomVoiceCard({ voice, busy, onPreview, onRemove }: { voice: Tables<"voice_profiles">; busy: boolean; onPreview: () => void; onRemove: () => void }) {
  const sampleUrl = useMediaUrl(voice.sample_url);
  return <div className="voice-card"><div className="voice-avatar">{voice.name.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{voice.name}</p><p className="text-xs text-muted-foreground">Private · consent confirmed</p>{sampleUrl && <audio src={sampleUrl} preload="none" />}</div><Button size="icon" variant="outline" aria-label={`Preview ${voice.name}`} onClick={onPreview} disabled={busy}><Play /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${voice.name}`} onClick={onRemove} disabled={busy}><Trash2 /></Button></div>;
}
