# CyliaTales — product foundation

## Competitive read

C2Story publicly positions a persistent story world that can become books, comics, posters, and trailers, with character, place, and prop continuity. ReadKidz publicly positions a guided path from one idea to a complete picture book with age-aware language, story-type controls, idea starters, character sheets, consistent illustrations, read-aloud, PDF/print, animation, multilingual output, and kid-safety. CyliaTales will compete on the same complete workflow without copying either brand or interface: a calmer editorial studio with stronger authorship, more visible control, and an original story-constellation motif.

## Implementation approach

- Preserve the existing Vite + React + TanStack Router product and its working studio/reader components.
- Refine the public homepage into a premium editorial landing surface that clearly sells the full creation loop.
- Keep existing story, book reader, narration, print, and video components as the product foundation.
- Add a functional Settings center for profile, language, reading defaults, narration, privacy, and accessibility preferences.
- Keep Supabase client integration in place, with profile writes guarded by the authenticated user and local preference persistence for preview-safe defaults.
- Keep AI provider selection abstracted so free-tier models can be selected later without redesigning the UI.

## Design direction

- **Movement:** editorial story studio — warm paper surfaces, midnight ink, aurora accents, and asymmetric book-like compositions.
- **Principles:** authored over automated; quiet confidence; tactile page moments; clear progression.
- **Color philosophy:** parchment makes the work feel keepsake-worthy, midnight blue creates trust, and saffron marks moments of imagination.
- **Layout:** asymmetrical editorial spreads rather than generic centered cards; use wide visual anchors and deliberate whitespace.
- **Signature elements:** constellation dots, chapter-number markers, page-spread previews, and “made by you” ownership language.
- **Interaction:** every CTA should suggest the next creative action; defaults are visible and reversible.
- **Animation:** restrained fades, lift-on-hover, and gentle page-fold motion; respect reduced-motion settings.
- **Typography:** Fraunces for story/editorial moments, Manrope for UI and product clarity.
- **Brand essence:** a premium story studio for families, classrooms, and independent creators who want original books they can shape and keep.
- **Voice:** precise, warm, author-respecting. Example lines: “Start with the moment you want to remember.” / “You stay the author. CyliaTales helps you bring the pages to life.”
- **Wordmark:** existing open-book spark mark retained and refined through spacing and contrast.
- **Signature color:** saffron `oklch(0.8 0.13 72)` used as a controlled editorial accent.

## Project structure

- `src/routes/index.tsx`: public positioning and product narrative.
- `src/routes/auth.tsx`: sign-in/create entry.
- `src/routes/_authenticated/route.tsx`: protected studio shell and navigation.
- `src/routes/_authenticated/studio.tsx`: overview, recent books, and creation entry points.
- `src/routes/_authenticated/settings.tsx`: profile and reader/studio preferences.
- `src/components/*`: book reader, print layout, story video, logo, and studio UI.
- `src/lib/*`: AI gateway, media, catalog, and style configuration.
- `src/integrations/supabase/*`: browser/server clients and auth boundary.
- `drizzle/migrations/*`: profiles, story-world entities, pages, narration, storage bucket, and RLS history.
- `public/manus-routes.json`: route declarations for preview and publishing.

## Boundaries

- Do not invent or hard-code AI provider credentials.
- Do not claim remote Supabase migrations are applied unless the target project is accessible and the operation succeeds.
- Do not use competitor logos, screenshots, or proprietary illustrations as CyliaTales assets.
