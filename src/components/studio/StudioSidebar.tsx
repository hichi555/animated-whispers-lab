import { Link, useLocation } from '@tanstack/react-router';
import { BookOpen, Users, Palette, Mic, Settings, LogOut, Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

const STUDIO_SECTIONS = [
  { label: 'Stories', icon: BookOpen, href: '/studio' },
  { label: 'Characters', icon: Users, href: '/studio/characters' },
  { label: 'Voices', icon: Mic, href: '/studio/voices' },
  { label: 'Styles', icon: Palette, href: '/studio/styles' },
];

export function StudioSidebar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const SidebarContent = () => (
    <>
      <Logo className="mb-8" />

      <nav className="space-y-2 flex-1">
        {STUDIO_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = pathname === section.href;
          return (
            <Link
              key={section.href}
              to={section.href}
              onClick={() => setMobileOpen(false)}
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
          onClick={() => setMobileOpen(false)}
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
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-card p-6 flex-col h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-card z-40 flex items-center px-4 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-8 w-8"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
        <Logo className="!gap-1" />
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 mt-16 bg-card border-r overflow-y-auto">
          <div className="p-6 space-y-2 flex flex-col h-full">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
