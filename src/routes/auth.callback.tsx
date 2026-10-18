import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
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

  useEffect(() => {
    let active = true;
    async function finish() {
      const code = new URL(window.location.href).searchParams.get("code");
      const { error: exchangeError } = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : { error: null };
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if ((exchangeError && !data.session) || sessionError || !data.session) {
        toast.error(
          exchangeError?.message ??
            sessionError?.message ??
            "Google sign-in could not be completed.",
        );
        navigate({ to: "/auth", replace: true });
        return;
      }
      navigate({ to: returnTo === "/auth" ? "/studio" : returnTo || "/studio", replace: true });
    }
    finish();
    return () => {
      active = false;
    };
  }, [navigate, returnTo]);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Finishing your secure sign-in…</p>
      </div>
    </div>
  );
}
