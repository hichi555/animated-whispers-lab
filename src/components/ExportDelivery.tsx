import { useState } from "react";
import { BookOpen, FileArchive, FileText, Loader2 } from "lucide-react";
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
async function assetData(path: string) {
  const response = await fetch(await signed(path));
  if (!response.ok) throw new Error("A saved media asset could not be downloaded");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return `data:${response.headers.get("content-type") || "application/octet-stream"};base64,${btoa(binary)}`;
}
function htmlEscape(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char,
  );
}
function wrapPdfText(
  text: string,
  font: { widthOfTextAtSize: (value: string, size: number) => number },
  size: number,
  maxWidth: number,
) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
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
  const [busy, setBusy] = useState<"pdf" | "zip" | "reader" | null>(null);
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
        const scale = Math.min(532 / image.width, 420 / image.height);
        page.drawImage(image, {
          x: 40 + (532 - image.width * scale) / 2,
          y: 300 + (420 - image.height * scale) / 2,
          width: image.width * scale,
          height: image.height * scale,
        });
        wrapPdfText(pageData.text, font, 12, 532)
          .slice(0, 8)
          .forEach((line, index) => {
            page.drawText(line, {
              x: 40,
              y: 270 - index * 18,
              size: 12,
              font,
              color: rgb(0.16, 0.16, 0.18),
            });
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
        if (p.audio_url)
          files[`narration/page-${String(p.page_number).padStart(2, "0")}.audio`] = new Uint8Array(
            await (await fetch(await signed(p.audio_url))).arrayBuffer(),
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
  async function exportReader(): Promise<void> {
    if (!pages.length) {
      toast.error("This story has no pages to deliver yet.");
      return;
    }
    setBusy("reader");
    try {
      const prepared = await Promise.all(
        pages.map(async (page) => ({
          number: page.page_number,
          text: page.text,
          image: page.image_url ? await assetData(page.image_url) : "",
          audio: page.audio_url ? await assetData(page.audio_url) : "",
        })),
      );
      const pageJson = JSON.stringify(prepared).replace(/</g, "\\u003c");
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${htmlEscape(story.title)} · CyliaTales</title><style>body{margin:0;background:#f3efe5;color:#24313a;font:16px system-ui,sans-serif}.shell{max-width:1120px;margin:auto;padding:28px 18px 60px}.eyebrow{color:#2f6b72;text-transform:uppercase;letter-spacing:.16em;font-size:11px;font-weight:700}.book{display:grid;grid-template-columns:1.1fr .9fr;min-height:560px;background:#fff;border:1px solid #d9d3c6;box-shadow:0 20px 60px #24313a22}.art{display:grid;place-items:center;padding:20px;background:#e9e4d7}.art img{max-width:100%;max-height:560px;object-fit:contain}.copy{display:flex;align-items:center;padding:clamp(24px,6vw,72px);font:clamp(20px,2.4vw,30px)/1.8 Georgia,serif}.controls{display:flex;gap:10px;align-items:center;margin:18px 0;flex-wrap:wrap}.controls button{border:1px solid #b9c4c4;background:#fff;border-radius:999px;padding:10px 15px;color:#24313a;cursor:pointer}.controls button.primary{background:#2f6b72;color:#fff;border-color:#2f6b72}.controls input{accent-color:#2f6b72;min-width:180px;flex:1}@media(max-width:700px){.book{grid-template-columns:1fr}.art{min-height:280px}}</style></head><body><main class="shell"><p class="eyebrow">CyliaTales · offline read-aloud edition</p><h1>${htmlEscape(story.title)}</h1><p id="meta"></p><div class="controls"><button id="prev">Previous</button><button id="play" class="primary">Play narration</button><button id="next">Next</button><input id="seek" type="range" min="0" max="1" value="0" aria-label="Narration progress"></div><section class="book" aria-live="polite"><div class="art"><img id="art" alt=""></div><div class="copy"><p id="text"></p></div></section></main><script>const pages=${pageJson};let index=0;let playing=false;const audio=new Audio();const art=document.querySelector('#art'),text=document.querySelector('#text'),meta=document.querySelector('#meta'),play=document.querySelector('#play'),seek=document.querySelector('#seek');function render(){const p=pages[index];art.src=p.image||'';art.alt='Illustration for page '+p.number;text.textContent=p.text;meta.textContent='Page '+p.number+' of '+pages.length;audio.src=p.audio||'';audio.currentTime=0;seek.value=0;play.textContent=playing&&p.audio?'Pause narration':'Play narration'}function toggle(){if(!pages[index].audio)return;if(audio.paused){playing=true;audio.play();}else{playing=false;audio.pause();}play.textContent=playing?'Pause narration':'Play narration'}function go(next){index=Math.max(0,Math.min(pages.length-1,next));render();if(playing&&pages[index].audio)audio.play().catch(()=>{playing=false;render()})}audio.onloadedmetadata=()=>seek.max=audio.duration||1;audio.ontimeupdate=()=>seek.value=audio.currentTime;audio.onended=()=>index<pages.length-1?go(index+1):(playing=false,render());seek.oninput=()=>audio.currentTime=Number(seek.value);play.onclick=toggle;document.querySelector('#prev').onclick=()=>go(index-1);document.querySelector('#next').onclick=()=>go(index+1);render();</script></body></html>`;
      download(
        new Blob([html], { type: "text/html;charset=utf-8" }),
        `${safe(story.title)}-read-aloud.html`,
      );
      toast.success("Offline read-aloud reader downloaded");
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
          Final delivery stays grounded in saved Supabase assets: print PDF, a self-contained
          read-aloud reader, or a complete source bundle for handoff.
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={exportPdf} disabled={!complete || Boolean(busy)}>
          {busy === "pdf" ? <Loader2 className="animate-spin" /> : <FileText />}{" "}
          {busy === "pdf" ? "Building PDF…" : "Download print PDF"}
        </Button>
        <Button variant="outline" onClick={exportReader} disabled={!pages.length || Boolean(busy)}>
          {busy === "reader" ? <Loader2 className="animate-spin" /> : <BookOpen />}{" "}
          {busy === "reader" ? "Building reader…" : "Download read-aloud reader"}
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
