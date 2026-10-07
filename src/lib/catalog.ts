export const ART_STYLES = [
  { id: "Soft watercolor", hint: "Gentle washes, paper grain, dreamy edges" },
  { id: "Gouache storybook", hint: "Opaque, matte color with bold shapes" },
  { id: "Colored pencil", hint: "Warm hatching and hand-drawn texture" },
  { id: "Paper cut-out", hint: "Layered collage with soft shadows" },
  { id: "3D clay", hint: "Rounded, tactile claymation look" },
  { id: "Ink & wash", hint: "Classic line art with light color" },
  { id: "3D cartoon", hint: "Cinematic lighting, expressive sculpted characters" },
  { id: "Clay village", hint: "Handcrafted miniature sets and tactile scenery" },
  { id: "Clay character", hint: "Soft sculpted faces and stop-motion charm" },
  { id: "Neon fantasy", hint: "Luminous color, glowing lanterns and bold contrast" },
  { id: "Oil painting", hint: "Rich brushwork and luminous painted light" },
  { id: "Engraving", hint: "Fine etched lines and intricate vintage detail" },
  { id: "Enchanted realism", hint: "Golden-hour detail, glowing windows and lush woodland" },
  { id: "Comic book", hint: "Expressive ink, graphic color and dynamic scenes" },
] as const;

export const AGE_RANGES = [
  { id: "0-3", label: "Toddlers", words: "very short, repetitive, 1-2 sentences per page" },
  { id: "4-6", label: "Early readers", words: "simple sentences, 2-3 per page" },
  { id: "7-9", label: "Young readers", words: "richer vocabulary, 3-5 sentences per page" },
  { id: "10-12", label: "Middle grade", words: "short paragraphs with dialogue" },
] as const;

export const THEMES = [
  { group: "Feelings", items: ["Courage", "Kindness", "Handling big emotions", "Making friends"] },
  { group: "Adventure", items: ["Space voyage", "Enchanted forest", "Under the sea", "Time travel"] },
  { group: "Learning", items: ["Counting & numbers", "Nature & seasons", "Science wonders", "Letters & words"] },
  { group: "Routines", items: ["Bedtime", "First day of school", "New sibling", "Trying new foods"] },
] as const;

export const TONES = ["Cozy", "Funny", "Magical", "Calm", "Exciting", "Heartfelt"] as const;

export const CHARACTER_KINDS = ["Child", "Animal", "Creature", "Robot", "Fairy", "Grown-up"] as const;

/** Original narrator voices. `engine` is the underlying speech voice. */
export const VOICES = [
  { id: "Wren", engine: "Kore", mood: "Warm & gentle", best: "Bedtime, cozy stories", category: "Storytellers" },
  { id: "Otis", engine: "Charon", mood: "Deep & comforting", best: "Classic tales, calm reads", category: "Storytellers" },
  { id: "Juniper", engine: "Aoede", mood: "Bright & airy", best: "Fairy tales, magic", category: "Storytellers" },
  { id: "Pip", engine: "Puck", mood: "Playful & bouncy", best: "Funny stories, adventures", category: "Playful" },
  { id: "Maple", engine: "Leda", mood: "Youthful & curious", best: "Learning, discovery", category: "Playful" },
  { id: "Fennel", engine: "Fenrir", mood: "Energetic & bold", best: "Action, space, pirates", category: "Playful" },
  { id: "Sage", engine: "Achernar", mood: "Soft & soothing", best: "Wind-down, mindfulness", category: "Calm" },
  { id: "Rowan", engine: "Orus", mood: "Steady & clear", best: "Classroom reading", category: "Calm" },
] as const;

export function voiceEngine(id: string) {
  return VOICES.find((v) => v.id === id)?.engine ?? "Kore";
}
