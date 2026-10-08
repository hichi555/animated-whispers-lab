import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { StudioSidebar } from '@/components/studio/StudioSidebar';
import { LoadingSpinner } from '@/components/Loading';

export const Route = createFileRoute('/studio')({ 
  beforeLoad: async ({ navigate }) => {
    // Protected route validation happens in component
  },
  component: StudioLayout,
});

function StudioLayout() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !session) {
      navigate({ to: '/auth' });
    }
  }, [session, loading, navigate, mounted]);

  if (!mounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-sm text-muted-foreground">Loading your studio...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Redirect is happening
  }

  return (
    <div className="flex h-screen bg-background">
      <StudioSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
