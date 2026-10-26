# CyliaTales Story Studio

CyliaTales is a review-first story production studio for families, educators, and independent creators. It connects manuscript direction, recurring characters, original art direction, narrated reading, moving scenes, classroom extensions, and export delivery in one private workspace.

The product is built around continuity and authorship: define the world once, inspect each stage, and choose what becomes part of the finished story. Supabase provides authentication, storage, and the protected story workspace; the AI layer remains provider-neutral so model choices can evolve without reshaping the product.

## Core surfaces

- Story writer with reader age, tone, cast, art direction, and review checkpoints.
- Story World continuity desk for recurring characters, places, props, and visual direction.
- Character atlas with private visual references and continuity controls.
- Story shelf, full-page reader, narration, poster, comic, motion, activity, print, and asset-bundle delivery.
- Settings & Preferences for reading profile, bilingual reading, narration, accessibility, privacy, and production defaults.

## Run CyliaTales locally

The repository uses Vite, React, TanStack Start, TanStack Router, and TanStack Query. It includes a committed `package-lock.json`, so use npm for a clean local installation.

```bash
git clone https://github.com/hichi555/animated-whispers-lab.git
cd animated-whispers-lab
npm ci
cp .env.example .env
```

Open `.env` and set the public Supabase publishable/anon key for the connected project `nfefwcmklegldwfjrtku`. The copied template also documents the server-side AI gateway, ElevenLabs, and optional worker variables. For a server running on your own computer, set the OAuth origin to the same local URL:

```env
VITE_SUPABASE_URL="https://nfefwcmklegldwfjrtku.supabase.co"
VITE_SUPABASE_PROJECT_ID="nfefwcmklegldwfjrtku"
VITE_SUPABASE_PUBLISHABLE_KEY="your-public-anon-or-publishable-key"
VITE_APP_URL="http://localhost:8080"
```

Start the local studio:

```bash
npm run dev -- --host 127.0.0.1 --port 8080
```

Then open [http://localhost:8080](http://localhost:8080). This works only after the command is running on the same computer as the browser. A sandbox `localhost` is not the same machine as your personal computer.

For Google sign-in on your own local machine, add these URLs in Supabase Authentication → URL Configuration → Redirect URLs:

```text
http://localhost:8080/auth/callback
http://127.0.0.1:8080/auth/callback
```

If you are using a deployed HTTPS domain instead, set `VITE_APP_URL` to that exact domain and add its `/auth/callback` URL instead. Never use a public preview URL in a local `.env` if you want the completed session to remain on your local app.

## Verification commands

```bash
npm run typecheck
npm run build
```
