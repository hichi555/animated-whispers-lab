import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { resolveOAuthCallbackOrigin, shouldHandoffOAuth } from "@/lib/auth-redirect";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
=======
import { supabase } from "@/integrations/supabase/client";
>>>>>>> origin/independent-cyliatales-auth-visuals
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — CyliaTales" },
      {
        name: "description",
        content: "Sign in or create your CyliaTales account to start making stories.",
      },
      { property: "og:title", content: "Sign in — CyliaTales" },
      { property: "og:description", content: "Access your story studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { session } = useAuth();
  const supabaseReady = isSupabaseConfigured();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const autoGoogleStarted = useRef(false);
  const configuredOrigin = import.meta.env["VITE_APP_URL"] as string | undefined;
  const browserOrigin = typeof window === "undefined" ? "" : window.location.origin;
  const callbackOrigin = resolveOAuthCallbackOrigin(browserOrigin, configuredOrigin);
  const handoffToPublic = shouldHandoffOAuth(browserOrigin, callbackOrigin);
  const callbackUrl = `${callbackOrigin}/auth/callback?returnTo=%2Fstudio`;

  useEffect(() => {
    if (session) nav({ to: "/studio" });
  }, [session, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseReady) {
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: callbackUrl,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Check your email for the confirmation link, then return to sign in.");
          setMode("in");
          setPassword("");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    if (!supabaseReady) {
      return;
    }
    setBusy(true);
    try {
<<<<<<< HEAD
      if (handoffToPublic) {
        window.location.assign(`${callbackOrigin}/auth?oauth=google&returnTo=%2Fstudio`);
        return;
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: { access_type: "offline", prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error((error as Error).message);
      setBusy(false);
    }
=======
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (error) { toast.error((error as Error).message); }
    finally { setBusy(false); }
>>>>>>> origin/independent-cyliatales-auth-visuals
  }

  useEffect(() => {
    const oauth = new URLSearchParams(window.location.search).get("oauth");
    if (oauth === "google" && supabaseReady && !session && !autoGoogleStarted.current) {
      autoGoogleStarted.current = true;
      void google();
    }
  }, [session]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-16">
        <Logo />
        <h1 className="mt-10 text-4xl font-semibold">
          {mode === "in" ? "Welcome back" : "Create your studio"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {mode === "in"
            ? "Pick up where your story left off."
            : "Free to start. Your books, characters and voices in one place."}
        </p>
        <Button
          variant="outline"
          disabled={busy || !supabaseReady}
          className="mt-8 h-11"
          onClick={google}
        >
          Continue with Google
        </Button>
        {notice && (
          <p
            role="status"
            className="mt-4 max-w-md border-l-2 border-primary pl-3 text-sm text-primary"
          >
            {notice}
          </p>
        )}
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={submit} className="max-w-md space-y-4">
=======
        <Button variant="outline" disabled={busy} className="mt-8 h-11 w-full max-w-md gap-3" onClick={google}>
          <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.06 13.22l7.98 6.19C11.93 13.72 17.49 9.5 24 9.5Z" transform="translate(0 4)"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.75 7.18l7.72 5.99c4.51-4.17 7.07-10.31 7.07-17.64Z" transform="translate(0 -1)"/>
            <path fill="#FBBC05" d="M10.04 28.59A14.4 14.4 0 0 1 9.27 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.55 2.57 10.78l7.47-6.19Z" transform="translate(1 0)"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.72-5.99c-2.14 1.44-4.88 2.29-8.18 2.29-6.51 0-12.07-4.22-14.06-10.09l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 -3)"/>
          </svg>
          Continue with Google
        </Button>
        {notice && <p role="status" className="mt-4 max-w-md border-l-2 border-primary pl-3 text-sm text-primary">{notice}</p>}
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
        <form onSubmit={submit} className="space-y-4 max-w-md">
>>>>>>> origin/independent-cyliatales-auth-visuals
          {mode === "up" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Password</Label>
            <Input
              id="pw"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={busy || !supabaseReady}>
            {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <Button
          variant="link"
          disabled={busy || !supabaseReady}
          className="mt-6 justify-start px-0 text-sm text-muted-foreground"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
        >
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </Button>
      </div>
      <div className="relative hidden lg:block">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </div>
  );
}
