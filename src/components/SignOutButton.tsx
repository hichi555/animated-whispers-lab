import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const cache = useQueryClient();
  async function signOut() {
    setBusy(true);
    try {
      await cache.cancelQueries();
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
      cache.clear();
      await navigate({ to: "/auth", replace: true });
    } catch (error) { toast.error((error as Error).message); }
    finally { setBusy(false); }
  }
  return <Button variant="ghost" size={compact ? "icon" : "default"} title="Sign out" aria-label="Sign out" disabled={busy} onClick={signOut} className={compact ? "" : "mt-2 w-full justify-start gap-3"}><LogOut className="h-4 w-4" />{!compact && (busy ? "Signing out…" : "Sign out")}</Button>;
}