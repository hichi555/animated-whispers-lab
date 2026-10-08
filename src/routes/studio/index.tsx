import { createFileRoute } from '@tanstack/react-router';
import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/studio/')({ 
  component: StudioDashboard,
});

function StudioDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Your Stories</h1>
        <p className="text-muted-foreground mt-1">Create, edit, and publish your illustrated children's books</p>
      </div>

      <div className="mb-8">
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create New Story
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">Start Your First Story</p>
          <p className="text-sm text-muted-foreground mt-1">Create a new book with AI assistance</p>
        </div>
      </div>
    </div>
  );
}
