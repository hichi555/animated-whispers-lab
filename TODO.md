# CyliaTales upgrade outcomes

## Independent foundation

- The application contains no provider-generated auth adapter, provider-specific environment variable, localhost redirect, or obsolete asset URL in active source.
- Supabase client and Google OAuth remain direct, explicit, and environment-driven.

## Settings & Preferences center

- Authenticated users can open `/settings` from desktop and mobile navigation.
- Users can select a reading age, story language, optional bilingual reading, narration autoplay, dyslexia-friendly reading, high contrast, reduced motion, private-by-default publishing, and creation defaults.
- Settings show explicit save state and persist across reloads without pretending to be server-saved when they are browser-local.
- Reset controls are scoped and reversible.

## Production studio quality

- The authenticated shell presents clear Create, Library, Produce, and Account groupings.
- The studio makes continuity, production status, and output formats visible without generic placeholder content.
- The studio exposes a real Delivery Suite linking approved story assets to read-aloud books, moving scenes, comic pages, posters/covers, learning extensions, and print/archive delivery.
- Existing books, characters, voices, motion, activities, art direction, remix, poster, comic, reader, and export features remain reachable.

## Validation and delivery

- Production build passes.
- Local authenticated routes return HTTP 200.
- Public original art assets return HTTP 200.
- GitHub receives the independent source without `.env`, keys, dependencies, or generated output.
