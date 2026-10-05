import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutGrid, PenTool, BookOpen, UserRound, Mic, Clapperboard, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: StudioLayout,
});

const NAV = [
  { group: "Create", items: [
    { to: "/studio", label: "Overview", icon: LayoutGrid },
    { to: "/stories/new", label: "New story", icon: PenTool },
  ] },
  { group: "Library", items: [
    { to: "/stories", label: "My books", icon: BookOpen },
    { to: "/characters", label: "Characters", icon: UserRound },
    { to: "/voices", label: "Voices", icon: Mic },
  ] },
  { group: "Produce", items: [{ to: "/labs", label: "Production", icon: Clapperboard }] },
] as const;

function StudioLayout() {
  const { session, loading, user } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && !session) nav({ to: "/auth" });
  }, [loading, session, nav]);

  if (loading || !session) return <div className="grid min-h-screen place-items-center text-muted-foreground">Opening your studio…</div>;

  return (
    <div className="flex min-h-screen bg-background studio-shell">
      <aside className="studio-sidebar sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar p-5 text-sidebar-foreground md:flex">
        <Logo light />
        <nav className="mt-10 flex-1 space-y-7">
          {NAV.map((g) => (
            <div key={g.group}>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">{g.group}</p>
              <ul className="mt-2 space-y-1">
                {g.items.map((i) => (
                  <li key={i.to}>
                    <Link
                      to={i.to}
                      activeOptions={{ exact: true }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeProps={{ className: "bg-sidebar-accent !text-sidebar-primary font-semibold" }}
                    >
                      <i.icon className="h-4 w-4" /> {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-sidebar-border pt-4">
          <p className="truncate px-3 text-xs text-sidebar-foreground/60">{user?.email}</p>
          <Button variant="ghost" onClick={() => supabase.auth.signOut()} className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="studio-topbar"><div className="md:hidden"><Logo /></div><p className="hidden text-xs font-semibold uppercase text-muted-foreground md:block">CyliaTales / Story studio</p><Button asChild variant="outline" size="sm"><Link to="/stories/new"><PenTool/> New story</Link></Button></header>
        <nav aria-label="Studio pages" className="studio-mobile-nav md:hidden">{NAV.map(g => g.items.map(i => <Link key={i.to} to={i.to} activeOptions={{exact: true}} activeProps={{className: "text-primary bg-secondary"}}><i.icon className="h-4 w-4"/>{i.label}</Link>))}</nav>
        <main className="flex-1 px-5 py-8 md:px-10"><Outlet /></main>
      </div>
    </div>
  );
}
