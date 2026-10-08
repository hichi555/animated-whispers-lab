import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import { EmptyState } from '@/components/EmptyState';

export const Route = createFileRoute('/studio/voices')({
  component: VoiceLibrary,
});

function VoiceLibrary() {
  const voices = [];

  return (
    <div className="flex-1 overflow-auto md:mt-0 mt-16">
      <div className="p-6 md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/studio">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-semibold">Voice Presets</h1>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New voice
          </Button>
        </div>

        <Card>
          <CardContent className="py-12">
            {voices.length === 0 ? (
              <EmptyState
                icon={<div className="text-2xl">🎤</div>}
                title="No custom voices yet"
                description="Add voice presets for narration. Start with our premium voices."
                actionLabel="Add voice"
                action={() => undefined}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
