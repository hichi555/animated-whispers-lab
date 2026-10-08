import { Link, useLocation } from '@tanstack/react-router';
import { BookOpen, Users, Palette, Mic, Settings, LogOut } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const STUDIO_SECTIONS = [
  { label: 'Stories', icon: BookOpen, href: '/studio' },
  { label: 'Characters', icon: Users, href: '/studio/characters' },
  { label: 'Voices', icon: Mic, href: '/studio/voices' },
  { label: 'Styles', icon: Palette, href: '/studio/styles' },
];

export function StudioSidebar() {
  const { pathname } = useLocation();

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <aside className="w-64 border-r bg-card p-6 flex flex-col h-screen">
      <Logo className="mb-8" />

      <nav className="space-y-2 flex-1">
        {STUDIO_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = pathname === section.href;
          return (
            <Link
              key={section.href}
              to={section.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t pt-4">
        <Link
          to="/studio/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
