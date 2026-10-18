# CyliaTales Story Studio

CyliaTales is a review-first story production studio for families, educators, and independent creators. It connects manuscript direction, recurring characters, original art direction, narrated reading, moving scenes, classroom extensions, and export delivery in one private workspace.

The product is built around continuity and authorship: define the world once, inspect each stage, and choose what becomes part of the finished story. Supabase provides authentication, storage, and the protected story workspace; the AI layer remains provider-neutral so model choices can evolve without reshaping the product.

## Core surfaces

- Story writer with reader age, tone, cast, art direction, and review checkpoints.
- Character atlas with private visual references and continuity controls.
- Story shelf, full-page reader, narration, poster, comic, motion, activity, print, and asset-bundle delivery.
- Settings & Preferences for reading profile, bilingual reading, narration, accessibility, privacy, and production defaults.

## Development

Install dependencies, configure the Supabase environment described in `.env.example`, then run `npm run dev -- --host 0.0.0.0 --port 8080` for the local studio preview.
