import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import { EmptyState } from '@/components/EmptyState';

export const Route = createFileRoute('/studio/characters')({
  component: CharacterLibrary,
});

function CharacterLibrary() {
  const characters = [];

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
            <h1 className="text-3xl font-semibold">Character Library</h1>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New character
          </Button>
        </div>

        <Card>
          <CardContent className="py-12">
            {characters.length === 0 ? (
              <EmptyState
                icon={<div className="text-2xl">👤</div>}
                title="No characters yet"
                description="Create reusable characters that you can use across your stories."
                actionLabel="Create character"
                action={() => undefined}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
