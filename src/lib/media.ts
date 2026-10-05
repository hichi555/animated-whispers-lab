import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export async function uploadBase64(userId: string, folder: string, b64: string, mime = "image/png") {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const ext = mime.includes("png") ? "png" : mime.includes("wav") ? "wav" : mime.includes("mpeg") ? "mp3" : "bin";
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, bytes, { contentType: mime });
  if (error) throw error;
  return path;
}

export async function uploadFile(userId: string, folder: string, file: File) {
  const safeExtension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${safeExtension}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

export function fileToBase64(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(file);
  });
}

export function useMediaUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["media", path],
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      if (!path) throw new Error("No media selected");
      const { data, error } = await supabase.storage.from("media").createSignedUrl(path, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
  }).data;
}
