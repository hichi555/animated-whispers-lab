export type ModelCapability = "text" | "image" | "video" | "audio" | "avatar" | "lip-sync";

export type ModelDefinition = {
  name: string;
  provider: string;
  capability: ModelCapability;
  note: string;
  tier: "Core" | "Studio" | "Experimental";
};

/** Curated routing catalog. Provider keys stay server-side; the UI only exposes the creative role. */
export const MODEL_CATALOG: ModelDefinition[] = [
  { name: "GPT-5", provider: "OpenAI", capability: "text", note: "Long-form writing and orchestration", tier: "Core" },
  { name: "GPT-4.1", provider: "OpenAI", capability: "text", note: "Fast editorial passes", tier: "Core" },
  { name: "o3", provider: "OpenAI", capability: "text", note: "Deep reasoning and planning", tier: "Studio" },
  { name: "DALL·E 3", provider: "OpenAI", capability: "image", note: "Prompt-faithful concept art", tier: "Core" },
  { name: "GPT Image", provider: "OpenAI", capability: "image", note: "High-fidelity image generation and edits", tier: "Studio" },
  { name: "Sora", provider: "OpenAI", capability: "video", note: "Cinematic image-to-video direction", tier: "Studio" },
  { name: "Gemini 2.5 Pro", provider: "Google", capability: "text", note: "Multimodal story reasoning", tier: "Core" },
  { name: "Gemini 2.5 Flash", provider: "Google", capability: "text", note: "Responsive creative assistant", tier: "Core" },
  { name: "Imagen 4", provider: "Google", capability: "image", note: "Editorial-grade illustration", tier: "Studio" },
  { name: "Veo 3", provider: "Google", capability: "video", note: "Narrative video with sound", tier: "Studio" },
  { name: "Lyria AI", provider: "Google", capability: "audio", note: "Original music beds and motifs", tier: "Studio" },
  { name: "Nano Banana", provider: "Google", capability: "image", note: "Fast visual ideation and edits", tier: "Experimental" },
  { name: "Gemini Live", provider: "Google", capability: "avatar", note: "Interactive character direction", tier: "Experimental" },
  { name: "Claude Sonnet", provider: "Anthropic", capability: "text", note: "Editorial structure and safety review", tier: "Core" },
  { name: "Claude Opus", provider: "Anthropic", capability: "text", note: "High-context manuscript refinement", tier: "Studio" },
  { name: "Kling AI", provider: "Kling", capability: "video", note: "Character motion and scene animation", tier: "Studio" },
  { name: "Runway Gen-4", provider: "Runway", capability: "video", note: "Directed visual sequences", tier: "Studio" },
  { name: "Pika", provider: "Pika", capability: "video", note: "Short-form creative motion", tier: "Experimental" },
  { name: "Luma Dream Machine", provider: "Luma", capability: "video", note: "Atmospheric scene studies", tier: "Experimental" },
  { name: "ElevenLabs Multilingual v2", provider: "ElevenLabs", capability: "audio", note: "Human-like audiobook narration", tier: "Core" },
  { name: "ElevenLabs Sound Effects", provider: "ElevenLabs", capability: "audio", note: "Page ambience and foley", tier: "Studio" },
  { name: "ElevenLabs Voice Design", provider: "ElevenLabs", capability: "avatar", note: "Consented voice identity", tier: "Studio" },
  { name: "HeyGen Avatar", provider: "HeyGen", capability: "avatar", note: "Presenter and character avatars", tier: "Studio" },
  { name: "Synthesia", provider: "Synthesia", capability: "avatar", note: "Structured presenter scenes", tier: "Experimental" },
  { name: "D-ID", provider: "D-ID", capability: "avatar", note: "Talking portrait prototypes", tier: "Experimental" },
  { name: "Sync Labs", provider: "Sync Labs", capability: "lip-sync", note: "Dialogue-to-face alignment", tier: "Studio" },
  { name: "Wav2Lip", provider: "Open source", capability: "lip-sync", note: "Local lip-sync fallback", tier: "Experimental" },
  { name: "Whisper", provider: "OpenAI", capability: "audio", note: "Transcript alignment and captions", tier: "Core" },
  { name: "MusicGen", provider: "Meta", capability: "audio", note: "Instrumental concept sketches", tier: "Experimental" },
  { name: "Stable Diffusion XL", provider: "Stability AI", capability: "image", note: "Style exploration", tier: "Experimental" },
  { name: "FLUX.1", provider: "Black Forest Labs", capability: "image", note: "Expressive visual studies", tier: "Studio" },
  { name: "Ideogram", provider: "Ideogram", capability: "image", note: "Typography-aware compositions", tier: "Experimental" },
  { name: "Topaz Video AI", provider: "Topaz", capability: "video", note: "Finishing and upscale", tier: "Experimental" },
  { name: "Google Cloud TTS", provider: "Google", capability: "audio", note: "Fallback narration voices", tier: "Experimental" },
  { name: "Azure Neural Voice", provider: "Microsoft", capability: "audio", note: "Enterprise voice fallback", tier: "Experimental" },
  { name: "Amazon Polly", provider: "Amazon", capability: "audio", note: "Accessible narration fallback", tier: "Experimental" },
];

export const CAPABILITY_META: Record<ModelCapability, { label: string; description: string }> = {
  text: { label: "Writing & reasoning", description: "Manuscripts, scripts, treatments and creative direction." },
  image: { label: "Image & illustration", description: "Covers, characters, pages, posters and 4K art direction." },
  video: { label: "Video & motion", description: "Image-to-video, shot planning, trailers and scene assembly." },
  audio: { label: "Voice & music", description: "ElevenLabs narration, sound beds, SFX and transcripts." },
  avatar: { label: "Avatar studio", description: "Consented presenters, characters and speaking portraits." },
  "lip-sync": { label: "Lip-sync", description: "Align dialogue, mouth movement and performance timing." },
};
