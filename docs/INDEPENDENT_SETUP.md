# Run CyliaTales independently

CyliaTales is a React + TanStack Start app. Lovable is not required to run the app after the independent-build changes in this branch. The app still uses Supabase for authentication, database access and private media storage; Supabase is a separate backend service that you own and configure.

## 1. Local environment

Create a local `.env` file (never commit it) with:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Use the project URL and publishable/anon key from your own Supabase project's API settings. Never put a Supabase service-role key in a `VITE_*` variable or in browser code.

Install and validate:

```bash
npm install
npm run validate:production
npm run dev
```

## 2. Google sign-in

Google OAuth now uses Supabase directly; it no longer calls Lovable's OAuth broker.

1. In Google Cloud Console, create or select a project and configure the OAuth consent screen.
2. Create an OAuth Client ID of type **Web application**.
3. Add the callback URL shown in Supabase Dashboard → Authentication → Providers → Google. It normally looks like `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`. Use the exact value displayed by your Supabase project.
4. Enable the Google provider in Supabase and enter the Google Client ID and Client Secret there.
5. In Supabase Dashboard → Authentication → URL Configuration, add the local app URL (usually `http://localhost:3000`) and your eventual production origin to the allowed redirect URLs.
6. Run the app, choose **Continue with Google**, and test the full redirect and return flow.

Google OAuth cannot be activated by source-code changes alone: it requires your own Google OAuth credentials and Supabase project settings. Do not commit these credentials.

## 3. Services and honest limitations

- Supabase must be configured with the required tables, storage bucket, migrations and Row Level Security policies. A folder named `supabase` is not proof that a live project is configured.
- Story/image/video generation and voice features require provider credentials and compatible API endpoints. Do not advertise a feature as live until it has been tested end-to-end.
- The production validation command runs TypeScript checks, ESLint and the Vite build. Passing it does not by itself prove that OAuth, database policies, storage, or AI provider calls work in production.
