import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { StudioSidebar } from '@/components/studio/StudioSidebar';

export const Route = createFileRoute('/studio')({ 
  beforeLoad: async ({ navigate }) => {
    // Protected route - check auth
  },
  component: StudioLayout,
});

function StudioLayout() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: '/auth' });
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <StudioSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
