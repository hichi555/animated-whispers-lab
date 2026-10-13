import { useState } from "react";
import { Download, FileArchive, FileText, Loader2 } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { zipSync } from "fflate";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Story = Tables<"stories">;
type Page = Tables<"story_pages">;
type Panel = Tables<"story_panels">;
const safe = (value: string) =>
  value
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "story";
async function signed(path: string) {
  const { data, error } = await supabase.storage.from("media").createSignedUrl(path, 900);
  if (error || !data?.signedUrl) throw error ?? new Error("Asset URL unavailable");
  return data.signedUrl;
}
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ExportDelivery({ story, pages }: { story: Story; pages: Page[] }) {
  const [busy, setBusy] = useState<"pdf" | "zip" | null>(null);
  const complete = pages.length > 0 && pages.every((p) => Boolean(p.image_url));
  async function exportPdf(): Promise<void> {
    if (!complete) {
      toast.error("Every page needs a saved illustration before PDF delivery.");
      return;
    }
    setBusy("pdf");
    try {
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      for (const pageData of pages) {
        const page = pdf.addPage([612, 792]);
        page.drawText(story.title, { x: 40, y: 754, size: 18, font, color: rgb(0.12, 0.12, 0.14) });
        page.drawText(`CyliaTales · Page ${pageData.page_number}`, {
          x: 40,
          y: 32,
          size: 9,
          font,
          color: rgb(0.4, 0.4, 0.42),
        });
        const url = await signed(pageData.image_url!);
        const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());
        const image = bytes[0] === 0xff ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);
        const scale = Math.min(532 / image.width, 680 / image.height);
        page.drawImage(image, {
          x: 40 + (532 - image.width * scale) / 2,
          y: 65 + (680 - image.height * scale) / 2,
          width: image.width * scale,
          height: image.height * scale,
        });
      }
      download(
        new Blob([(await pdf.save()).buffer as ArrayBuffer], { type: "application/pdf" }),
        `${safe(story.title)}-cylia-tales.pdf`,
      );
      toast.success("Print-ready PDF downloaded");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function exportZip(): Promise<void> {
    if (!pages.length) {
      toast.error("This story has no pages to package yet.");
      return;
    }
    setBusy("zip");
    try {
      const { data: panels = [] } = await supabase
        .from("story_panels")
        .select("*")
        .eq("story_id", story.id)
        .order("page_id")
        .order("panel_number");
      const files: Record<string, Uint8Array> = {};
      files["manifest.json"] = new TextEncoder().encode(
        JSON.stringify(
          {
            title: story.title,
            artStyle: story.art_style,
            ageRange: story.age_range,
            pages: pages.length,
            generatedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
      files["manuscript.txt"] = new TextEncoder().encode(
        pages.map((p) => `PAGE ${p.page_number}\n${p.text}`).join("\n\n"),
      );
      for (const p of pages) {
        if (p.image_url)
          files[`pages/page-${String(p.page_number).padStart(2, "0")}.jpg`] = new Uint8Array(
            await (await fetch(await signed(p.image_url))).arrayBuffer(),
          );
      }
      for (const panel of panels as Panel[]) {
        if (panel.image_url)
          files[`comic-panels/${panel.page_id}-${panel.panel_number}.jpg`] = new Uint8Array(
            await (await fetch(await signed(panel.image_url))).arrayBuffer(),
          );
      }
      download(
        new Blob([zipSync(files).buffer as ArrayBuffer], { type: "application/zip" }),
        `${safe(story.title)}-cylia-tales-assets.zip`,
      );
      toast.success("Complete asset bundle downloaded");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(null);
    }
  }
  return (
    <section
      className="mt-8 rounded-3xl border bg-card p-5 shadow-soft md:p-7"
      aria-labelledby="export-delivery-title"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Delivery desk
        </p>
        <h2 id="export-delivery-title" className="mt-2 text-2xl font-semibold">
          Export what you actually built
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          These exports are generated from saved Supabase assets. The ZIP includes the manuscript,
          page artwork, and any comic panels already produced.
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={exportPdf} disabled={!complete || Boolean(busy)}>
          {busy === "pdf" ? <Loader2 className="animate-spin" /> : <FileText />}{" "}
          {busy === "pdf" ? "Building PDF…" : "Download print PDF"}
        </Button>
        <Button variant="outline" onClick={exportZip} disabled={!pages.length || Boolean(busy)}>
          {busy === "zip" ? <Loader2 className="animate-spin" /> : <FileArchive />}{" "}
          {busy === "zip" ? "Packaging assets…" : "Download ZIP bundle"}
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {complete
          ? `${pages.length} illustrated pages ready${pages.some((p) => p.audio_url) ? " · narration included in the source bundle" : ""}`
          : "PDF delivery unlocks when every page has a saved illustration."}
      </p>
    </section>
  );
}
