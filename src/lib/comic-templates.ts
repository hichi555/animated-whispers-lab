export const COMIC_TEMPLATES = [
  {
    id: "cinematic",
    name: "Cinematic sequence",
    panelCount: 3,
    direction:
      "A cinematic three-beat sequence: an expansive establishing frame, a character-led decision, then an intimate emotional payoff. Vary shot distance and keep the page flowing clearly from left to right. No lettering, speech bubbles, captions or text in the art.",
  },
  {
    id: "manga-rhythm",
    name: "Manga-inspired rhythm",
    panelCount: 4,
    direction:
      "A four-beat, top-to-bottom visual rhythm: establish the moment, show a meaningful reaction, build a small action, then land a warm payoff. Use expressive faces and dynamic but easy-to-follow framing; do not imitate any specific series or character. No lettering, speech bubbles, captions or text in the art.",
  },
  {
    id: "storybook-panels",
    name: "Classic storybook panels",
    panelCount: 3,
    direction:
      "Three generous storybook frames with clear silhouettes, warm staging and one readable action in each. Frame one sets the place, frame two reveals the discovery, frame three resolves the feeling. Preserve generous breathing room and the approved book art direction. No lettering, speech bubbles, captions or text in the art.",
  },
  {
    id: "adventure-strip",
    name: "Adventure strip",
    panelCount: 6,
    direction:
      "A six-beat adventure strip with concise visual moments: establish, notice, prepare, attempt, surprise and resolve. Each frame must be legible at small size, vary composition and preserve spatial continuity. Keep action gentle and age-appropriate. No lettering, speech bubbles, captions or text in the art.",
  },
] as const;

export type ComicTemplateId = (typeof COMIC_TEMPLATES)[number]["id"];
export const DEFAULT_COMIC_TEMPLATE: ComicTemplateId = "cinematic";
export const COMIC_PANEL_COUNTS = [2, 3, 4, 6] as const;
