import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  Accessibility,
  BookOpenText,
  Check,
  Eye,
  Languages,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Volume2,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { ART_DIRECTION_BOARDS } from "@/lib/art-direction";
import { COMIC_PANEL_COUNTS, COMIC_TEMPLATES, DEFAULT_COMIC_TEMPLATE, type ComicTemplateId } from "@/lib/comic-templates";
import { getStudioProviderStatus } from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Settings — CyliaTales" },
      {
        name: "description",
        content: "Shape how CyliaTales writes, reads and protects your stories.",
      },
    ],
  }),
  component: SettingsPage,
});

type Preferences = {
  readingAge: "0-3" | "5-7" | "9-12";
  language: string;
  translationLanguage: string;
  bilingual: boolean;
  narration: boolean;
  dyslexiaFriendly: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  privateByDefault: boolean;
  reviewBeforeProduction: boolean;
  defaultPages: "8" | "12" | "16";
  artDirection: string;
  artDirectionNotes: string;
  comicTemplate: ComicTemplateId;
  comicPanelCount: "2" | "3" | "4" | "6";
};
const DEFAULTS: Preferences = {
  readingAge: "5-7",
  language: "English",
  translationLanguage: "Français",
  bilingual: false,
  narration: true,
  dyslexiaFriendly: false,
  highContrast: false,
  reducedMotion: false,
  privateByDefault: true,
  reviewBeforeProduction: true,
  defaultPages: "12",
  artDirection: ART_DIRECTION_BOARDS[0].id,
  artDirectionNotes: "",
  comicTemplate: DEFAULT_COMIC_TEMPLATE,
  comicPanelCount: "3",
};
const STORAGE_KEY = "cyliatales.preferences.v1";

function SettingRow({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: typeof Accessibility;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-border/70 py-5 last:border-0">
      <div className="flex min-w-0 gap-3">
        <span className="settings-icon">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
    </div>
  );
}

function SettingsPage() {
  const { user } = useAuth();
  const getProviderStatus = useServerFn(getStudioProviderStatus);
  const [preferences, setPreferences] = useState<Preferences>(DEFAULTS);
  const [saved, setSaved] = useState(true);
  const [providerStatus, setProviderStatus] = useState<Awaited<ReturnType<typeof getStudioProviderStatus>> | null>(null);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const restored = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) };
        if (restored.translationLanguage === restored.language) {
          restored.translationLanguage = ["English", "Français", "Español", "العربية", "中文", "日本語"].find((item) => item !== restored.language) ?? "English";
        }
        setPreferences(restored);
      }
    } catch {
      toast.error("Your saved preferences could not be loaded.");
    }
  }, []);
  useEffect(() => {
    getProviderStatus().then(setProviderStatus).catch(() => setProviderStatus(null));
  }, [getProviderStatus]);
  const selectedBoard = useMemo(
    () =>
      ART_DIRECTION_BOARDS.find((board) => board.id === preferences.artDirection) ??
      ART_DIRECTION_BOARDS[0],
    [preferences.artDirection],
  );
  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }
  function save() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setSaved(true);
    toast.success("Preferences saved for this studio.");
  }
  function reset() {
    setPreferences(DEFAULTS);
    window.localStorage.removeItem(STORAGE_KEY);
    setSaved(true);
    toast.success("Preferences restored to CyliaTales defaults.");
  }
  return (
    <div>
      <PageHeader
        eyebrow="Studio control"
        title="Settings that protect the story."
        subtitle="Set the reading experience, creative defaults and safety posture once. CyliaTales carries them into the next production without hiding the decisions."
        actions={
          <Button onClick={save} disabled={saved}>
            {saved ? <Check /> : <Save />}
            {saved ? "Saved" : "Save changes"}
          </Button>
        }
      />
      <div className="settings-status mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="settings-status-mark">
            <Settings2 className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Your studio, your defaults</p>
            <p className="text-sm text-muted-foreground">
              Local to this browser · {user?.email ?? "signed-in creator"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw /> Restore defaults
        </Button>
      </div>
      <section className="mb-8 rounded-2xl border bg-card p-5 shadow-soft md:p-6" aria-labelledby="provider-status-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Production infrastructure</p>
            <h2 id="provider-status-title" className="mt-2 text-xl font-semibold">AI provider credentials</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Keys are checked server-side. Values are never sent to the browser or stored in preferences.</p>
          </div>
          <span className="rounded-full border bg-secondary px-3 py-1 text-xs font-semibold">{providerStatus?.baseUrlConfigured ? "Custom gateway URL" : "Provider default endpoint"}</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Writing & safety", providerStatus?.text],
            ["Illustration", providerStatus?.image],
            ["Read-aloud narration", providerStatus?.narration],
            ["Voice cloning", providerStatus?.elevenLabs],
            ["Motion delivery", providerStatus?.motion],
            ["Pollinations backup", providerStatus?.pollinations],
          ].map(([label, connected]) => <div key={label as string} className="flex items-center justify-between rounded-xl border bg-background/60 p-3"><span className="text-sm font-medium">{label as string}</span><span className={connected ? "text-xs font-semibold text-primary" : "text-xs font-semibold text-muted-foreground"}>{connected ? "Credential found" : "Not configured"}</span></div>)}
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="settings-card">
            <div className="settings-card-heading">
              <BookOpenText />
              <div>
                <h2>Reading profile</h2>
                <p>Shape language, pacing and the read-aloud experience.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="settings-field">
                <span>Reading age</span>
                <select
                  value={preferences.readingAge}
                  onChange={(e) =>
                    update("readingAge", e.target.value as Preferences["readingAge"])
                  }
                >
                  <option value="0-3">Ages 0–3 · first words</option>
                  <option value="5-7">Ages 5–7 · emerging reader</option>
                  <option value="9-12">Ages 9–12 · confident reader</option>
                </select>
              </label>
              <label className="settings-field">
                <span>Primary language</span>
                <select
                  value={preferences.language}
                  onChange={(e) => {
                    const nextLanguage = e.target.value;
                    update("language", nextLanguage);
                    if (nextLanguage === preferences.translationLanguage) {
                      const alternate = ["English", "Français", "Español", "العربية", "中文", "日本語"].find((item) => item !== nextLanguage);
                      if (alternate) update("translationLanguage", alternate);
                    }
                  }}
                >
                  <option>English</option>
                  <option>Français</option>
                  <option>Español</option>
                  <option>العربية</option>
                  <option>中文</option>
                  <option>日本語</option>
                </select>
              </label>
              <label className="settings-field">
                <span>Default second language</span>
                <select
                  value={preferences.translationLanguage}
                  onChange={(e) => update("translationLanguage", e.target.value)}
                  disabled={!preferences.bilingual}
                >
                  {[
                    ["English", "English"], ["Français", "French"], ["Español", "Spanish"],
                    ["العربية", "Arabic"], ["中文", "Chinese"], ["日本語", "Japanese"],
                  ].filter(([value]) => value !== preferences.language).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-2">
              <SettingRow
                icon={Languages}
                title="Bilingual reading"
                description="Keep the primary language and a second language together on the reading spread."
                checked={preferences.bilingual}
                onCheckedChange={(value) => update("bilingual", value)}
              />
              <SettingRow
                icon={Volume2}
                title="Narration by default"
                description="Prepare every approved page for read-aloud playback when a compatible voice is available."
                checked={preferences.narration}
                onCheckedChange={(value) => update("narration", value)}
              />
            </div>
          </section>
          <section className="settings-card">
            <div className="settings-card-heading">
              <Accessibility />
              <div>
                <h2>Comfort & access</h2>
                <p>Make story time easier to read, hear and navigate.</p>
              </div>
            </div>
            <div className="mt-2">
              <SettingRow
                icon={Eye}
                title="Dyslexia-friendly reading"
                description="Use a calmer reading treatment with stronger spacing and line length for longer sessions."
                checked={preferences.dyslexiaFriendly}
                onCheckedChange={(value) => update("dyslexiaFriendly", value)}
              />
              <SettingRow
                icon={Accessibility}
                title="High contrast controls"
                description="Increase contrast on navigation, status labels and interactive controls."
                checked={preferences.highContrast}
                onCheckedChange={(value) => update("highContrast", value)}
              />
              <SettingRow
                icon={Sparkles}
                title="Reduced motion"
                description="Keep page transitions and production previews calm for motion-sensitive readers."
                checked={preferences.reducedMotion}
                onCheckedChange={(value) => update("reducedMotion", value)}
              />
            </div>
          </section>
          <section className="settings-card">
            <div className="settings-card-heading">
              <WandSparkles />
              <div>
                <h2>Production defaults</h2>
                <p>Start each draft closer to the kind of story you actually make.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="settings-field">
                <span>Default page count</span>
                <select
                  value={preferences.defaultPages}
                  onChange={(e) =>
                    update("defaultPages", e.target.value as Preferences["defaultPages"])
                  }
                >
                  <option value="8">8 pages · short read</option>
                  <option value="12">12 pages · picture-book rhythm</option>
                  <option value="16">16 pages · extended world</option>
                </select>
              </label>
              <label className="settings-field">
                <span>Art direction</span>
                <select
                  value={preferences.artDirection}
                  onChange={(e) => update("artDirection", e.target.value)}
                >
                  {ART_DIRECTION_BOARDS.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="settings-field">
                <span>Comic page template</span>
                <select
                  value={preferences.comicTemplate}
                  onChange={(e) => {
                    const next = COMIC_TEMPLATES.find((item) => item.id === e.target.value);
                    if (!next) return;
                    update("comicTemplate", next.id);
                    update("comicPanelCount", String(next.panelCount) as Preferences["comicPanelCount"]);
                  }}
                >
                  {COMIC_TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>{template.name} · {template.panelCount} panels</option>
                  ))}
                </select>
              </label>
              <label className="settings-field">
                <span>Default panel count</span>
                <select
                  value={preferences.comicPanelCount}
                  onChange={(e) => update("comicPanelCount", e.target.value as Preferences["comicPanelCount"])}
                >
                  {COMIC_PANEL_COUNTS.map((count) => (
                    <option key={count} value={count}>{count} panels per page</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="settings-field mt-5 block">
              <span>Art-direction notes · optional</span>
              <textarea
                value={preferences.artDirectionNotes}
                onChange={(e) => update("artDirectionNotes", e.target.value.slice(0, 500))}
                maxLength={500}
                rows={3}
                placeholder="For example: soft backlight, hand-painted texture, wide quiet backgrounds…"
              />
              <span className="mt-1 block text-xs font-normal text-muted-foreground">Added to the chosen art board for future image prompts; keep notes concrete and family-friendly. {preferences.artDirectionNotes.length}/500</span>
            </label>
            <div className="mt-2">
              <SettingRow
                icon={Check}
                title="Review before production"
                description="Pause after the manuscript and storyboard so you can approve the world before generation begins."
                checked={preferences.reviewBeforeProduction}
                onCheckedChange={(value) => update("reviewBeforeProduction", value)}
              />
            </div>
          </section>
          <section className="settings-card">
            <div className="settings-card-heading">
              <ShieldCheck />
              <div>
                <h2>Privacy & sharing</h2>
                <p>Keep family stories and private references under your control.</p>
              </div>
            </div>
            <div className="mt-2">
              <SettingRow
                icon={ShieldCheck}
                title="Private by default"
                description="New stories remain private until you deliberately share or publish them."
                checked={preferences.privateByDefault}
                onCheckedChange={(value) => update("privateByDefault", value)}
              />
            </div>
          </section>
        </div>
        <aside className="settings-preview self-start rounded-2xl border bg-card p-5 shadow-soft xl:sticky xl:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Live preference preview
          </p>
          <div className="settings-board mt-4 overflow-hidden rounded-xl">
            <img src={selectedBoard.image} alt="" />
            <div className="settings-board-caption">
              <p>{selectedBoard.name}</p>
              <span>{selectedBoard.medium}</span>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reader</span>
              <strong>Ages {preferences.readingAge}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Language</span>
              <strong>
                {preferences.language}
                {preferences.bilingual ? ` + ${preferences.translationLanguage}` : ""}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Book length</span>
              <strong>{preferences.defaultPages} pages</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Comic template</span>
              <strong className="text-right">{COMIC_TEMPLATES.find((item) => item.id === preferences.comicTemplate)?.name ?? "Cinematic sequence"} · {preferences.comicPanelCount} panels</strong>
            </div>
            {preferences.artDirectionNotes.trim() && (
              <div className="border-t pt-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Custom art notes</span>
                <p className="mt-1 line-clamp-3 text-sm">{preferences.artDirectionNotes}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Privacy</span>
              <strong>{preferences.privateByDefault ? "Private" : "Share-ready"}</strong>
            </div>
          </div>
          <div className="mt-5 border-t pt-5 text-sm leading-6 text-muted-foreground">
            <p className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> CyliaTales keeps your
              creative decisions visible and your story private until you choose otherwise.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
