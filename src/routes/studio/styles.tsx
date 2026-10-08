import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/studio/styles')({
  component: StyleLibrary,
});

const STYLES = [
  {
    name: 'Watercolor',
    description: 'Soft, gentle, dreamy quality',
    example: '🎨',
  },
  {
    name: 'Digital',
    description: 'Clean, crisp, modern aesthetic',
    example: '💻',
  },
  {
    name: 'Pencil',
    description: 'Hand-drawn, warm, intimate feel',
    example: '✏️',
  },
  {
    name: 'Oil',
    description: 'Rich, expressive, classic art style',
    example: '🖼️',
  },
  {
    name: 'Vector',
    description: 'Bold, playful, graphic novel style',
    example: '📐',
  },
  {
    name: 'Comic',
    description: 'Comic book panels, dynamic action',
    example: '💥',
  },
];

function StyleLibrary() {
  return (
    <div className="flex-1 overflow-auto md:mt-0 mt-16">
      <div className="p-6 md:p-8">
        <div className="mb-8 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/studio">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold">Illustration Styles</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STYLES.map((style) => (
            <Card key={style.name} className="overflow-hidden transition-all hover:shadow-md cursor-pointer">
              <CardContent className="p-6">
                <div className="mb-3 text-4xl">{style.example}</div>
                <h3 className="font-semibold">{style.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{style.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
