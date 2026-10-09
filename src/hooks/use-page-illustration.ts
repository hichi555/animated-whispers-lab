import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateImage } from "@/lib/studio.functions";
import { supabase } from "@/integrations/supabase/client";
import { uploadBase64 } from "@/lib/media";
import type { Tables } from "@/integrations/supabase/types";

export function usePageIllustration(story: Tables<"stories"> | null | undefined) {
  const generate = useServerFn(generateImage);
  const cache = useQueryClient();
  const [drawingPage, setDrawingPage] = useState<string | null>(null);
  async function illustrate(page: Tables<"story_pages">) {
    if (!story || drawingPage) return;
    setDrawingPage(page.id);
    try {
      const { data: cast, error: castError } = await supabase.from("characters").select("name,appearance,outfit,palette,portrait_url,reference_url").in("id", story.character_ids);
      if (castError) throw castError;
      const referencePaths = (cast ?? []).flatMap(c => [c.portrait_url, c.reference_url]).filter((p): p is string => !!p).slice(0, 6);
      const castNote = (cast ?? []).map(c => `${c.name}: ${[c.appearance,c.outfit,c.palette].filter(Boolean).join(", ")}`).join("; ");
      const { b64 } = await generate({ data: { prompt: `Illustrate this exact story moment: ${page.text}. Art direction: ${page.image_prompt ?? ""}. Established cast: ${castNote}`, style: story.art_style, referencePaths } });
      const path = await uploadBase64(story.user_id, "pages", b64);
      const { error } = await supabase.from("story_pages").update({ image_url: path, motion_url: null, motion_status: "idle" }).eq("id", page.id);
      if (error) throw error;
      if (page.page_number === 1 && !story.cover_url) {
        const { error: coverError } = await supabase.from("stories").update({ cover_url: path }).eq("id", story.id);
        if (coverError) throw coverError;
      }
      await Promise.all([cache.invalidateQueries({ queryKey: ["pages", story.id] }), cache.invalidateQueries({ queryKey: ["story", story.id] }), cache.invalidateQueries({ queryKey: ["stories"] })]);
      toast.success(`Page ${page.page_number} illustration saved`);
    } catch (error) { toast.error((error as Error).message); }
    finally { setDrawingPage(null); }
  }
  return { illustrate, drawingPage };
}