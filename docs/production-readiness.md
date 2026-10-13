# CyliaTales production readiness

## Automated gate

Every change to `main` and every pull request runs:

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint -- --quiet`
4. `npm run build`

The same sequence is available locally as `npm run validate:production`.

## Current validated capabilities

- Supabase-backed stories, pages, characters, voices, versions, outputs, public publishing, branches, and comic panels
- Real image generation, narration, motion, PDF, ZIP, public reader, poster, comic, and art-direction flows
- Root route error boundary and authenticated studio guard
- Supabase client environment validation
- RLS policies for user-owned production records and public published reading
- Original FLUX style boards with local assets and provenance metadata

## Required release checks before public launch

- Apply every migration in `supabase/migrations` to the production Supabase project and verify each migration in the dashboard
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to GitHub Actions and the deployment environment
- Verify Storage bucket policies for `media`, signed URLs, and generated-output retention
- Configure production AI provider credentials and confirm server-side rate limits
- Exercise signup, story creation, illustration, narration, motion, poster, comic, publish, remix, PDF, ZIP, and public-reader flows against the production project
- Confirm billing, credits, abuse controls, privacy/terms, deletion, and export ownership language before charging users
- Add browser-level smoke tests for authenticated and public routes on supported mobile and desktop breakpoints
- Add application monitoring and alerting for failed generation jobs, Supabase errors, and export failures

## Release standard

CyliaTales should only be described as production-ready after the automated gate is green **and** the release checks above have been completed against the connected production services. A green build alone does not prove that provider credentials, migrations, Storage policies, billing, or generation jobs are configured.
