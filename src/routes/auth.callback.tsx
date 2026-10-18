import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Finishing sign in — CyliaTales" }, { name: "robots", content: "noindex" }],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const { returnTo } = useSearch({ from: "/auth/callback" });
  const [failure, setFailure] = useState("");

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let redirected = false;

    const goToStudio = () => {
      if (!active || redirected) return;
      redirected = true;
      navigate({ to: returnTo === "/auth" ? "/studio" : returnTo || "/studio", replace: true });
    };

    const finish = async () => {
      const params = new URL(window.location.href).searchParams;
      const providerError = params.get("error_description") || params.get("error");
      if (providerError) {
        setFailure(decodeURIComponent(providerError.replace(/\+/g, " ")));
        return;
      }

      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setFailure(error.message);
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setFailure(error.message);
        return;
      }
      if (data.session) {
        goToStudio();
        return;
      }

      timer = setTimeout(() => {
        if (active) {
          setFailure(
            "Supabase returned no session. Check that this exact callback URL is allowed in Supabase Authentication → URL Configuration.",
          );
        }
      }, 4000);
    };

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) goToStudio();
    });

    finish().catch((error) => {
      if (active)
        setFailure(
          error instanceof Error ? error.message : "Google sign-in could not be completed.",
        );
    });

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, [navigate, returnTo]);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="max-w-md text-center">
        {failure ? (
          <>
            <p className="text-sm font-semibold text-destructive">
              Google sign-in could not be completed
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{failure}</p>
            <button
              className="mt-6 text-sm font-semibold text-primary underline"
              onClick={() => navigate({ to: "/auth", replace: true })}
            >
              Return to sign in
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Finishing your secure sign-in…</p>
          </>
        )}
      </div>
    </div>
  );
}
